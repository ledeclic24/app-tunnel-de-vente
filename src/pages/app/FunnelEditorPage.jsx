import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, ExternalLink, Plus, X, Pencil, Trash2, Users, Check, Lock, Unlock, Palette, Copy,
  GripVertical, Undo2, Redo2, Eye, Settings, BookmarkPlus, Sparkles, Wand2, Megaphone,
} from 'lucide-react';
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy, horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  fetchFunnel, updateFunnel, publishFunnel, unpublishFunnel, fetchSteps, addStep, deleteStep, reorderSteps, updateStep,
  fetchAllBlocksForFunnel, addBlock, updateBlock, deleteBlock, reorderBlocks, countLeads, toggleBlockLock,
} from '../../lib/funnelsApi';
import { BLOCK_TYPES, createDefaultContent } from '../../lib/blockTypes';
import { slugify } from '../../lib/slug';
import { useAuth } from '../../context/AuthContext';
import { getPlan } from '../../lib/plans';
import { brandStyleVars } from '../../lib/colorUtils';
import { computeHealthScore } from '../../lib/healthScore';
import { resolveStickyFooterPrice } from '../../lib/currency';
import { fetchReusableBlocks, saveReusableBlock, deleteReusableBlock, incrementReusableBlockUsage } from '../../lib/growthApi';
import { useConfirm } from '../../components/app/ConfirmDialog';
import { useToast } from '../../components/app/Toast';
import RechargeCreditsButton from '../../components/app/RechargeCreditsButton';
import { fetchCreditCosts } from '../../lib/creditsApi';
import Spinner from '../../components/app/Spinner';
import { useClickOutside } from '../../lib/useClickOutside';
import { useAnchoredPosition } from '../../lib/useAnchoredPosition';
import { editFunnelWithAI, regenerateBlockWithAI, generateBlockImageWithAI, regenerateSignatureVisualWithAI, improveElementWithAI } from '../../lib/aiApi';
import BlockRenderer from '../../components/blocks/BlockRenderer';
import BlockEditorPanel from '../../components/blocks/BlockEditorPanel';
import ElementStylePanel from '../../components/blocks/ElementStylePanel';
import BrandKitPanel from '../../components/app/BrandKitPanel';
import FunnelSettingsPanel from '../../components/app/FunnelSettingsPanel';
import PageSettingsPanel from '../../components/app/PageSettingsPanel';
import FunnelPreviewModal from '../../components/app/FunnelPreviewModal';
import HealthScoreCard from '../../components/app/HealthScoreCard';
import CountdownBar from '../../components/public/CountdownBar';
import PurchaseNotification from '../../components/public/PurchaseNotification';
import StickyFooterCta from '../../components/public/StickyFooterCta';

const HISTORY_LIMIT = 20;

// Objets figés (hors composant) : useSensor() les mémoïse par référence en
// interne, donc leur recréer en ligne à chaque rendu produisait un nouveau
// tableau de sensors à chaque frappe — DndContext le republie dans son
// contexte, ce qui forçait TOUS les useSortable() (donc tous les BlockCard)
// à se re-rendre à chaque caractère tapé, contournant leur React.memo.
const POINTER_ACTIVATION_CONSTRAINT = { activationConstraint: { distance: 5 } };
const KEYBOARD_COORDINATE_GETTER = { coordinateGetter: sortableKeyboardCoordinates };

const AI_ERROR_MESSAGES = {
  plan_required: "L'édition par IA nécessite le plan Pro ou Entreprise.",
  limit_reached: 'Tu as atteint ta limite de générations IA ce mois-ci.',
  insufficient_credits: 'Crédits IA insuffisants. Achète un pack ou passe au plan supérieur depuis la page Facturation.',
  invalid_input: 'Précise un peu plus ta demande.',
  ai_error: "L'IA n'a pas pu répondre pour le moment. Réessaie dans quelques instants.",
  parse_error: 'La modification a échoué. Réessaie avec une formulation différente.',
  block_locked: 'Déverrouille ce bloc avant de le régénérer.',
  server_error: 'Une erreur est survenue. Réessaie.',
};

// Messages dédiés au quota d'images (distinct du quota IA/texte ci-dessus) :
// un utilisateur avec du quota IA restant mais plus de quota image ne doit
// pas voir un message trompeur sur la limite de génération de texte.
const IMAGE_ERROR_MESSAGES = {
  plan_required: "La génération d'images nécessite le plan Pro ou Entreprise.",
  limit_reached: "Tu as atteint ta limite de générations d'images ce mois-ci.",
  insufficient_credits: 'Crédits IA insuffisants. Achète un pack ou passe au plan supérieur depuis la page Facturation.',
  invalid_input: "Ce type de bloc ne supporte pas la génération d'image.",
  ai_error: "Le générateur d'images n'a pas pu répondre. Réessaie dans quelques instants.",
  parse_error: 'La génération a échoué. Réessaie.',
  server_error: 'Une erreur est survenue. Réessaie.',
};

const BlockCard = React.memo(function BlockCard({
  block, onDelete, onDuplicate, isExpanded, onToggle, onChange, userId, selectedElement, onSelectElement,
  dragHandleProps, onSaveToLibrary, canUseLibrary, onToggleLock, onRegenerate, canRegenerate, isRegenerating, regenerateCost,
  onGenerateImage, isGeneratingImage, onRegenerateSignatureVisual, isGeneratingSignatureVisual, defaultBg, siblingSteps, currency,
}) {
  const def = BLOCK_TYPES.find((b) => b.type === block.type);
  const Icon = def?.icon;
  const locked = Boolean(block.locked);

  // Reprend la même alternance que l'aperçu du bloc (defaultBg, calculé par
  // le parent selon l'index) sur le bandeau d'en-tête de l'éditeur — rythme
  // visuel cohérent entre les cartes plutôt qu'un bandeau gris uniforme.
  const headerTint = defaultBg === 'primary' ? 'bg-primary/5' : 'bg-accent/5';

  return (
    <div id={`block-${block.id}`} className={`bg-background border rounded-[2rem] overflow-hidden shadow-soft ${locked ? 'border-accent/30' : 'border-surface/10'}`}>
      <div className={`flex items-center justify-between px-5 py-3 border-b border-surface/10 ${headerTint}`}>
        <div className="flex items-center gap-2 text-sm font-medium text-surface/70 min-w-0">
          <button
            type="button"
            {...dragHandleProps}
            className="p-1.5 -ml-1.5 rounded-lg text-surface/30 hover:text-surface cursor-grab active:cursor-grabbing touch-none shrink-0"
            aria-label="Réordonner ce bloc"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          {Icon && <Icon className="w-4 h-4 text-accent shrink-0" />}
          <span className="truncate">{def?.label || block.type}</span>
          {locked && <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-accent/10 text-accent shrink-0">Verrouillé</span>}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {canRegenerate && !locked && (
            <button
              onClick={() => onRegenerate(block)}
              disabled={isRegenerating}
              className="p-1.5 rounded-lg text-surface/40 hover:text-accent disabled:opacity-50"
              aria-label="Régénérer ce bloc avec l'IA"
              title={regenerateCost ? `Régénérer ce bloc avec l'IA (${regenerateCost} crédits)` : "Régénérer ce bloc avec l'IA"}
            >
              {isRegenerating ? (
                <span className="block w-4 h-4 border-2 border-surface/20 border-t-accent rounded-full animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
            </button>
          )}
          <button
            onClick={() => onToggleLock(block)}
            className={`p-1.5 rounded-lg ${locked ? 'text-accent hover:text-accent/70' : 'text-surface/40 hover:text-surface'}`}
            aria-label={locked ? 'Déverrouiller ce bloc' : 'Verrouiller ce bloc'}
            title={locked ? "Déverrouiller (l'IA pourra à nouveau le modifier)" : "Verrouiller (protège ce bloc des régénérations IA)"}
          >
            {locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
          <button onClick={() => onToggle(block.id)} className={`p-1.5 rounded-lg ${isExpanded ? 'text-accent' : 'text-surface/40 hover:text-surface'}`}>
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => onDuplicate(block)} className="p-1.5 rounded-lg text-surface/40 hover:text-surface" aria-label="Dupliquer">
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSaveToLibrary(block)}
            className={`p-1.5 rounded-lg ${canUseLibrary ? 'text-surface/40 hover:text-accent' : 'text-surface/20 hover:text-surface/40'}`}
            aria-label="Enregistrer dans ma bibliothèque"
            title={canUseLibrary ? 'Enregistrer dans ma bibliothèque' : 'Bibliothèque réservée aux plans payants'}
          >
            <BookmarkPlus className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(block)} className="p-1.5 rounded-lg text-surface/40 hover:text-red-500">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        <BlockRenderer
          block={block}
          onAdvance={() => {}}
          editMode
          selectedElement={selectedElement}
          onSelectElement={(elementKey, kind, label) => onSelectElement(block.id, elementKey, kind, label)}
          onContentChange={(content) => onChange(block, content)}
          userId={userId}
          defaultBg={defaultBg}
          currency={currency}
          siblingSteps={siblingSteps}
          onGenerateImage={onGenerateImage}
          isGeneratingImage={isGeneratingImage}
          onRegenerateSignatureVisual={onRegenerateSignatureVisual}
          isGeneratingSignatureVisual={isGeneratingSignatureVisual}
        />
      </div>

      {isExpanded && (
        <div className="border-t border-surface/10 p-5 bg-surface/[0.02]">
          <BlockEditorPanel
            block={block}
            onChange={(content) => onChange(block, content)}
            userId={userId}
            onGenerateImage={onGenerateImage}
            imageGenerating={isGeneratingImage}
            steps={siblingSteps}
          />
        </div>
      )}
    </div>
  );
});

const SortableBlockCard = React.memo(function SortableBlockCard(props) {
  const { block } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style}>
      <BlockCard {...props} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
});

function SortableStepChip({ step, isSelected, onSelect, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: step.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-0.5 shrink-0 rounded-full pl-1.5 pr-1.5 py-1.5 border ${isSelected ? 'bg-primary text-background border-primary' : 'bg-background text-surface/70 border-surface/10'}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="p-1 opacity-50 hover:opacity-100 cursor-grab active:cursor-grabbing touch-none"
        aria-label="Réordonner cette page"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      <button onClick={onSelect} className="hover-lift text-sm font-medium whitespace-nowrap px-1.5">
        {step.name}
      </button>
      <button onClick={onDelete} className="p-1 opacity-50 hover:opacity-100 hover:text-red-400" aria-label="Supprimer cette page">
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

export default function FunnelEditorPage() {
  const { funnelId } = useParams();
  const navigate = useNavigate();
  const { effectiveOwnerId, effectiveProfile } = useAuth();
  const plan = getPlan(effectiveProfile?.plan);
  const [funnel, setFunnel] = useState(null);
  const [steps, setSteps] = useState([]);
  const [selectedStepId, setSelectedStepId] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [blocksByStepId, setBlocksByStepId] = useState({});
  const [expandedBlockId, setExpandedBlockId] = useState(null);
  const [selection, setSelection] = useState(null);
  const [showPalette, setShowPalette] = useState(false);
  const [paletteTab, setPaletteTab] = useState('new');
  const [showBrandKit, setShowBrandKit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPageSettings, setShowPageSettings] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const settingsMenuRef = useClickOutside(showSettingsMenu, () => setShowSettingsMenu(false));
  const settingsMenuTriggerRef = useRef(null);
  const settingsMenuPos = useAnchoredPosition(showSettingsMenu, settingsMenuTriggerRef, 224);
  const paletteRef = useClickOutside(showPalette, () => setShowPalette(false));
  const [showPreview, setShowPreview] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', text: "Décris ce que tu veux changer sur ce tunnel (ex. « ajoute une section témoignages », « rends le titre plus percutant »)." },
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiErrorCode, setAiErrorCode] = useState('');
  const [regeneratingBlockId, setRegeneratingBlockId] = useState(null);
  const [imageGeneratingBlockId, setImageGeneratingBlockId] = useState(null);
  const [signatureVisualGeneratingBlockId, setSignatureVisualGeneratingBlockId] = useState(null);
  const [improvingElementKey, setImprovingElementKey] = useState(null);
  const [leadsCount, setLeadsCount] = useState(0);
  const [nameDraft, setNameDraft] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionErrorCode, setActionErrorCode] = useState('');
  const [libraryBlocks, setLibraryBlocks] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState('');
  const [creditCosts, setCreditCosts] = useState(null);

  useEffect(() => {
    if (plan.aiAccess) fetchCreditCosts().then(setCreditCosts).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [historyState, setHistoryState] = useState({ stack: [], index: -1 });
  const confirm = useConfirm();
  const toast = useToast();

  const contentHistoryTimer = useRef(null);
  // Un timer d'enregistrement par bloc (pas un seul partagé) : éditer le
  // bloc A ne doit jamais annuler une sauvegarde en attente du bloc B.
  const blockSaveTimers = useRef({});
  // Permet aux callbacks passés à chaque BlockCard (onDelete, onChange...)
  // d'être stables (useCallback, référence figée) sans pour autant lire un
  // `blocks` figé au moment de leur création — sinon soit les callbacks
  // changent de référence à chaque frappe (ce qui annule le React.memo des
  // BlockCard et force le re-rendu de TOUS les blocs sur chaque caractère
  // tapé), soit ils agissent sur une liste de blocs obsolète.
  const blocksRef = useRef(blocks);
  useEffect(() => {
    blocksRef.current = blocks;
  }, [blocks]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    // fetchFunnel/fetchSteps/fetchAllBlocksForFunnel/countLeads ne dépendent
    // tous que de funnelId — aucun n'a besoin du résultat d'un autre, donc
    // un seul aller-retour groupé au lieu de 4 successifs. Les blocs de
    // TOUTES les étapes arrivent en un seul appel (fetchAllBlocksForFunnel,
    // déjà groupés par étape côté serveur) au lieu d'un appel par étape.
    let f, s, blocksMap, count;
    try {
      [f, s, blocksMap, count] = await Promise.all([
        fetchFunnel(funnelId),
        fetchSteps(funnelId),
        fetchAllBlocksForFunnel(funnelId),
        countLeads(funnelId),
      ]);
    } catch {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setFunnel(f);
    setNameDraft(f.name);
    setSteps(s);
    setBlocksByStepId(blocksMap);
    const firstStep = s[0]?.id || null;
    setSelectedStepId(firstStep);
    const initialBlocks = blocksMap[firstStep] || [];
    setBlocks(initialBlocks);
    setHistoryState({ stack: [initialBlocks], index: 0 });
    setLeadsCount(count);
    setLoading(false);
  }, [funnelId]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleAiSend = async (e) => {
    e.preventDefault();
    if (!aiInput.trim() || aiGenerating) return;
    const instruction = aiInput.trim();
    setAiInput('');
    setAiMessages((prev) => [...prev, { role: 'user', text: instruction }]);
    setAiGenerating(true);
    setAiErrorCode('');
    try {
      await editFunnelWithAI(funnelId, instruction);
      await loadAll();
      setAiMessages((prev) => [...prev, { role: 'assistant', text: 'Modifications appliquées — regarde le résultat ci-dessous.' }]);
    } catch (err) {
      setAiMessages((prev) => [...prev, { role: 'assistant', text: AI_ERROR_MESSAGES[err.message] || AI_ERROR_MESSAGES.server_error }]);
      setAiErrorCode(err.message);
    }
    setAiGenerating(false);
  };

  const applyBlocks = useCallback((updater) => {
    setBlocks((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setBlocksByStepId((map) => ({ ...map, [selectedStepId]: next }));
      return next;
    });
  }, [selectedStepId]);

  const pushHistory = useCallback((snapshot) => {
    setHistoryState(({ stack, index }) => {
      let newStack = stack.slice(0, index + 1).concat([snapshot]);
      if (newStack.length > HISTORY_LIMIT) newStack = newStack.slice(newStack.length - HISTORY_LIMIT);
      return { stack: newStack, index: newStack.length - 1 };
    });
  }, []);

  const selectStep = async (stepId) => {
    setSelectedStepId(stepId);
    setExpandedBlockId(null);
    setSelection(null);
    const stepBlocks = blocksByStepId[stepId] || [];
    setBlocks(stepBlocks);
    setHistoryState({ stack: [stepBlocks], index: 0 });
  };

  const handleSaveName = async () => {
    setEditingName(false);
    if (nameDraft.trim() && nameDraft !== funnel.name) {
      try {
        await updateFunnel(funnelId, { name: nameDraft.trim() });
        setFunnel((f) => ({ ...f, name: nameDraft.trim() }));
      } catch {
        setActionError('Le renommage a échoué. Réessaie.');
      }
    }
  };

  // "Publier" tant que le tunnel n'a jamais été publié OU que des
  // modifications ont eu lieu depuis le dernier snapshot (voir
  // hasUnpublishedChanges côté backend) ; "Publié" (clic = dépublier)
  // seulement quand le snapshot public reflète exactement l'état actuel.
  const needsPublish = !funnel?.is_published || funnel?.has_unpublished_changes;

  const togglePublish = async () => {
    try {
      const updated = needsPublish
        ? await publishFunnel(funnelId)
        : await unpublishFunnel(funnelId);
      setFunnel((f) => ({ ...f, ...updated }));
    } catch (err) {
      // Le backend refuse maintenant de publier une offre payante sans
      // moyen de paiement rattaché, avec un message précis identifiant
      // l'offre concernée (voir FunnelsService.publish) — on l'affiche tel
      // quel plutôt qu'un message générique. actionErrorCode permet en plus
      // d'afficher un bouton qui amène directement au bloc concerné (voir
      // le check "payment-method" de computeHealthScore, calculé sur les
      // mêmes données) plutôt que de laisser un débutant chercher tout
      // seul où se trouve ce réglage.
      setActionError(
        err.message || (needsPublish ? 'La publication a échoué. Réessaie.' : 'La dépublication a échoué. Réessaie.'),
      );
      setActionErrorCode(err.message || '');
    }
  };

  // Les 3 panneaux de réglages (Général/Design/Page) partagent un seul
  // bouton "Réglages" avec un menu déroulant (voir le rendu plus bas) —
  // cliquer sur l'entrée déjà ouverte la referme, comme le faisait chaque
  // bouton séparé auparavant.
  const selectSettingsPanel = (which) => {
    setShowSettings(which === 'general' && !showSettings);
    setShowBrandKit(which === 'design' && !showBrandKit);
    setShowPageSettings(which === 'page' && !showPageSettings);
    setShowAiAssistant(false);
    setShowSettingsMenu(false);
    setActionError('');
  };

  const handleAddStep = async () => {
    const name = window.prompt('Nom de la nouvelle page :');
    if (!name || !name.trim()) return;
    try {
      const step = await addStep(funnelId, { name: name.trim(), slug: slugify(name), position: steps.length });
      setSteps((prev) => [...prev, step]);
      setBlocksByStepId((map) => ({ ...map, [step.id]: [] }));
      selectStep(step.id);
    } catch {
      setActionError("L'ajout de la page a échoué. Réessaie.");
    }
  };

  const handleDeleteStep = async (step) => {
    if (steps.length <= 1) { toast.error('Un tunnel doit garder au moins une page.'); return; }
    if (!(await confirm(`Supprimer la page "${step.name}" ?`))) return;
    try {
      await deleteStep(step.id);
      const remaining = steps.filter((s) => s.id !== step.id);
      setSteps(remaining);
      setBlocksByStepId((map) => {
        const next = { ...map };
        delete next[step.id];
        return next;
      });
      if (selectedStepId === step.id) selectStep(remaining[0]?.id || null);
    } catch {
      setActionError('La suppression de la page a échoué. Réessaie.');
    }
  };

  const stepSensors = useSensors(
    useSensor(PointerSensor, POINTER_ACTIVATION_CONSTRAINT),
    useSensor(KeyboardSensor, KEYBOARD_COORDINATE_GETTER),
  );

  const handleStepDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = steps.findIndex((s) => s.id === active.id);
    const newIndex = steps.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = arrayMove(steps, oldIndex, newIndex);
    setSteps(next);
    try {
      await reorderSteps(next.map((s) => s.id));
    } catch {
      setActionError("Le réordonnancement des pages n'a pas pu être enregistré.");
    }
  };

  const blockSensors = useSensors(
    useSensor(PointerSensor, POINTER_ACTIVATION_CONSTRAINT),
    useSensor(KeyboardSensor, KEYBOARD_COORDINATE_GETTER),
  );

  const handleBlockDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((b) => b.id === active.id);
    const newIndex = blocks.findIndex((b) => b.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const next = arrayMove(blocks, oldIndex, newIndex);
    applyBlocks(next);
    pushHistory(next);
    try {
      await reorderBlocks(next.map((b) => b.id));
    } catch {
      setActionError("Le réordonnancement des blocs n'a pas pu être enregistré.");
    }
  };

  const handleAddBlock = async (type) => {
    setShowPalette(false);
    if (!plan.blocks.includes(type)) {
      navigate('/app/billing');
      return;
    }
    try {
      const block = await addBlock(selectedStepId, type, createDefaultContent(type), blocks.length);
      const next = [...blocks, block];
      applyBlocks(next);
      pushHistory(next);
      setExpandedBlockId(block.id);
    } catch {
      setActionError("L'ajout du bloc a échoué. Réessaie.");
    }
  };

  const handleDeleteBlock = useCallback(async (block) => {
    if (!(await confirm('Supprimer ce bloc ?'))) return;
    try {
      await deleteBlock(block.id);
      const next = blocksRef.current.filter((b) => b.id !== block.id);
      applyBlocks(next);
      pushHistory(next);
      setSelection((sel) => (sel?.blockId === block.id ? null : sel));
    } catch {
      setActionError('La suppression du bloc a échoué. Réessaie.');
    }
  }, [confirm, applyBlocks, pushHistory]);

  const handleDuplicateBlock = useCallback(async (block) => {
    try {
      const copy = await addBlock(selectedStepId, block.type, { ...block.content }, blocksRef.current.length);
      const next = [...blocksRef.current, copy];
      applyBlocks(next);
      pushHistory(next);
    } catch {
      setActionError('La duplication a échoué. Réessaie.');
    }
  }, [selectedStepId, applyBlocks, pushHistory]);

  const handleToggleLock = useCallback(async (block) => {
    const before = blocksRef.current;
    const nextLocked = !block.locked;
    const next = before.map((b) => (b.id === block.id ? { ...b, locked: nextLocked } : b));
    applyBlocks(next);
    try {
      await toggleBlockLock(block.id, nextLocked);
    } catch {
      applyBlocks(before);
      setActionError('Le verrouillage a échoué. Réessaie.');
    }
  }, [applyBlocks]);

  const handleRegenerateBlock = useCallback(async (block) => {
    if (regeneratingBlockId) return;
    setRegeneratingBlockId(block.id);
    setActionError('');
    setActionErrorCode('');
    try {
      const updated = await regenerateBlockWithAI(block.id);
      const next = blocksRef.current.map((b) => (b.id === block.id ? { ...b, content: updated.content } : b));
      applyBlocks(next);
      pushHistory(next);
    } catch (err) {
      // La bannière tout en haut de page (actionError) reste invisible tant
      // qu'on n'y remonte pas — un vendeur qui régénère un bloc en bas d'un
      // long tunnel n'a alors AUCUN signe qu'une erreur (ex. crédits
      // épuisés) s'est produite. Le toast, flottant en bas de l'écran, est
      // visible immédiatement quel que soit le défilement.
      const message = AI_ERROR_MESSAGES[err.message] || AI_ERROR_MESSAGES.server_error;
      setActionError(message);
      setActionErrorCode(err.message);
      toast.error(message);
    }
    setRegeneratingBlockId(null);
  }, [regeneratingBlockId, applyBlocks, pushHistory, toast]);

  const handleGenerateBlockImage = useCallback(async (blockId, imageType) => {
    if (imageGeneratingBlockId) return;
    setImageGeneratingBlockId(blockId);
    setActionError('');
    setActionErrorCode('');
    try {
      const updated = await generateBlockImageWithAI(blockId, imageType);
      const next = blocksRef.current.map((b) => (b.id === blockId ? { ...b, content: updated.content } : b));
      applyBlocks(next);
      pushHistory(next);
    } catch (err) {
      const message = IMAGE_ERROR_MESSAGES[err.message] || IMAGE_ERROR_MESSAGES.server_error;
      setActionError(message);
      setActionErrorCode(err.message);
      toast.error(message);
    }
    setImageGeneratingBlockId(null);
  }, [imageGeneratingBlockId, applyBlocks, pushHistory, toast]);

  const handleRegenerateSignatureVisual = useCallback(async (blockId) => {
    if (signatureVisualGeneratingBlockId) return;
    setSignatureVisualGeneratingBlockId(blockId);
    setActionError('');
    setActionErrorCode('');
    try {
      const updated = await regenerateSignatureVisualWithAI(blockId);
      const next = blocksRef.current.map((b) => (b.id === blockId ? { ...b, content: updated.content } : b));
      applyBlocks(next);
      pushHistory(next);
    } catch (err) {
      const message = AI_ERROR_MESSAGES[err.message] || AI_ERROR_MESSAGES.server_error;
      setActionError(message);
      setActionErrorCode(err.message);
      toast.error(message);
    }
    setSignatureVisualGeneratingBlockId(null);
  }, [signatureVisualGeneratingBlockId, applyBlocks, pushHistory, toast]);

  // Références stables (jamais recréées) passées telles quelles à chaque
  // BlockCard — condition nécessaire pour que React.memo les laisse
  // effectivement sauter le re-rendu des blocs non concernés par la frappe.
  const handleToggleExpand = useCallback((blockId) => {
    setExpandedBlockId((cur) => (cur === blockId ? null : blockId));
  }, []);

  const handleSelectElement = useCallback((blockId, elementKey, kind, label) => {
    setSelection({ blockId, elementKey, kind, label });
  }, []);

  const handleImproveElement = async (elementKey) => {
    if (improvingElementKey || !selection) return;
    setImprovingElementKey(elementKey);
    setActionError('');
    setActionErrorCode('');
    try {
      const updated = await improveElementWithAI(selection.blockId, elementKey);
      const next = blocks.map((b) => (b.id === selection.blockId ? { ...b, content: updated.content } : b));
      applyBlocks(next);
      pushHistory(next);
    } catch (err) {
      const message = AI_ERROR_MESSAGES[err.message] || AI_ERROR_MESSAGES.server_error;
      setActionError(message);
      setActionErrorCode(err.message);
      toast.error(message);
    }
    setImprovingElementKey(null);
  };

  // L'aperçu se met à jour tout de suite (applyBlocks, synchrone) — seul
  // l'ENREGISTREMENT réseau est différé de 600ms après la dernière frappe.
  // Avant ce correctif, chaque caractère tapé dans le panneau de réglages
  // d'un bloc (titre, prix...) déclenchait une vraie requête PATCH
  // immédiate : saisie hachée, lettre par lettre, avec des requêtes qui
  // s'empilaient au lieu de se remplacer.
  const handleBlockChange = useCallback((block, newContent) => {
    const next = blocksRef.current.map((b) => (b.id === block.id ? { ...b, content: newContent } : b));
    applyBlocks(next);

    if (blockSaveTimers.current[block.id]) {
      clearTimeout(blockSaveTimers.current[block.id]);
    }
    blockSaveTimers.current[block.id] = setTimeout(async () => {
      delete blockSaveTimers.current[block.id];
      try {
        await updateBlock(block.id, newContent);
      } catch (err) {
        setActionError(
          err.status === 413
            ? 'Ce bloc est trop volumineux pour être enregistré (trop de contenu). Réduis le texte ou le nombre d\'éléments.'
            : "L'enregistrement du bloc a échoué. Réessaie.",
        );
        return;
      }
      if (contentHistoryTimer.current) clearTimeout(contentHistoryTimer.current);
      contentHistoryTimer.current = setTimeout(() => pushHistory(next), 600);
    }, 600);
  }, [applyBlocks, pushHistory]);

  const handleElementStyleChange = useCallback(async (block, newStyles) => {
    handleBlockChange(block, { ...block.content, styles: newStyles });
  }, [handleBlockChange]);

  const handleSaveBrand = async (brand) => {
    try {
      await updateFunnel(funnelId, { brand });
      setFunnel((f) => ({ ...f, brand }));
      setShowBrandKit(false);
      setActionError('');
      setActionErrorCode('');
      // L'aperçu dans l'éditeur reflète le changement immédiatement, mais la
      // page publique reste figée sur le dernier snapshot publié (voir
      // FunnelsService.publish) — sans ce rappel explicite, le changement
      // avait l'air de "ne plus s'appliquer" pour qui vérifiait la page en
      // ligne sans avoir republié.
      if (funnel?.is_published) {
        toast.success('Brand Kit enregistré. Republie le tunnel pour que tes visiteurs voient ce changement.');
      }
    } catch {
      setActionError('L\'enregistrement du Brand Kit a échoué. Réessaie.');
    }
  };

  const handleSaveSettings = async (patch) => {
    try {
      await updateFunnel(funnelId, patch);
      setFunnel((f) => ({ ...f, ...patch }));
      // Un enregistrement réussi vient peut-être de corriger CE qui causait
      // une erreur précédente (ex. "aucun livrable configuré" avant de
      // publier) — sans ça, le message restait affiché tel quel après
      // correction, comme si rien n'avait changé alors que republier
      // fonctionnerait maintenant.
      setActionError('');
      setActionErrorCode('');
    } catch {
      setActionError('L\'enregistrement des réglages a échoué. Réessaie.');
    }
  };

  // Même correctif que pour les blocs (voir handleBlockChange) : l'aperçu et
  // les champs se mettaient à jour seulement APRÈS la réponse réseau
  // (await updateStep avant setSteps), donc chaque caractère tapé dans les
  // réglages de page (notification d'achat, pied de page collant, capture
  // à l'intention de sortie) attendait un aller-retour réseau complet avant
  // d'apparaître — d'où la saisie hachée, lettre par lettre.
  const chromeSaveTimers = useRef({});

  const handleSaveChrome = useCallback((chrome) => {
    const stepId = selectedStepId;
    setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, chrome } : s)));

    if (chromeSaveTimers.current[stepId]) {
      clearTimeout(chromeSaveTimers.current[stepId]);
    }
    chromeSaveTimers.current[stepId] = setTimeout(async () => {
      delete chromeSaveTimers.current[stepId];
      try {
        await updateStep(stepId, { chrome });
        setActionError('');
        setActionErrorCode('');
      } catch {
        setActionError('L\'enregistrement des réglages de page a échoué. Réessaie.');
      }
    }, 600);
  }, [selectedStepId]);

  // Action discrète (sélection dans un menu déroulant), pas une saisie
  // continue — enregistrement immédiat, pas besoin du debounce de
  // handleSaveChrome ci-dessus.
  const handleChangeStepType = useCallback(async (stepType) => {
    const stepId = selectedStepId;
    const before = steps;
    setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, stepType } : s)));
    try {
      await updateStep(stepId, { stepType });
    } catch {
      setSteps(before);
      setActionError('Le changement de type de page a échoué. Réessaie.');
    }
  }, [selectedStepId, steps]);

  const reconcileToSnapshot = useCallback(async (snapshot) => {
    const currentIds = new Set(blocks.map((b) => b.id));
    const snapshotIds = new Set(snapshot.map((b) => b.id));

    const toDelete = blocks.filter((b) => !snapshotIds.has(b.id));
    const toRecreate = snapshot.filter((b) => !currentIds.has(b.id));
    const toUpdate = snapshot.filter((b) => currentIds.has(b.id));

    try {
      await Promise.all(toDelete.map((b) => deleteBlock(b.id)));

      const idMap = {};
      for (const b of toRecreate) {
        const created = await addBlock(selectedStepId, b.type, b.content, b.position);
        idMap[b.id] = created.id;
      }

      await Promise.all(toUpdate.map((b) => updateBlock(b.id, b.content)));

      const resolvedSnapshot = snapshot.map((b) => (idMap[b.id] ? { ...b, id: idMap[b.id] } : b));
      await reorderBlocks(resolvedSnapshot.map((b) => b.id));

      if (Object.keys(idMap).length > 0) {
        setHistoryState((s) => ({
          ...s,
          stack: s.stack.map((snap) => snap.map((b) => (idMap[b.id] ? { ...b, id: idMap[b.id] } : b))),
        }));
      }

      applyBlocks(resolvedSnapshot);
    } catch {
      setActionError("L'annulation/rétablissement n'a pas pu être appliqué entièrement.");
    }
  }, [blocks, selectedStepId, applyBlocks]);

  const undo = useCallback(() => {
    if (historyState.index <= 0) return;
    const targetIndex = historyState.index - 1;
    const snapshot = historyState.stack[targetIndex];
    setHistoryState((s) => ({ ...s, index: targetIndex }));
    reconcileToSnapshot(snapshot);
  }, [historyState, reconcileToSnapshot]);

  const redo = useCallback(() => {
    if (historyState.index >= historyState.stack.length - 1) return;
    const targetIndex = historyState.index + 1;
    const snapshot = historyState.stack[targetIndex];
    setHistoryState((s) => ({ ...s, index: targetIndex }));
    reconcileToSnapshot(snapshot);
  }, [historyState, reconcileToSnapshot]);

  useEffect(() => {
    const handler = (e) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
      if (e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.key.toLowerCase() === 'z' && e.shiftKey) || e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const handleOpenLibraryTab = async () => {
    setPaletteTab('library');
    if (!plan.blockLibrary || libraryBlocks.length > 0) return;
    setLibraryLoading(true);
    setLibraryError('');
    try {
      const data = await fetchReusableBlocks(effectiveOwnerId);
      setLibraryBlocks(data);
    } catch {
      setLibraryError('Impossible de charger ta bibliothèque de blocs.');
    } finally {
      setLibraryLoading(false);
    }
  };

  const handleInsertFromLibrary = async (savedBlock) => {
    setShowPalette(false);
    try {
      const block = await addBlock(selectedStepId, savedBlock.type, savedBlock.content, blocks.length);
      const next = [...blocks, block];
      applyBlocks(next);
      pushHistory(next);
      setExpandedBlockId(block.id);
      incrementReusableBlockUsage(savedBlock.id, savedBlock.usage_count || 0).catch(() => {});
      setLibraryBlocks((prev) => prev.map((b) => (b.id === savedBlock.id ? { ...b, usage_count: (b.usage_count || 0) + 1 } : b)));
    } catch {
      setActionError("L'insertion depuis la bibliothèque a échoué.");
    }
  };

  const handleDeleteLibraryBlock = async (id) => {
    if (!(await confirm('Supprimer ce bloc de ta bibliothèque ?'))) return;
    try {
      await deleteReusableBlock(id);
      setLibraryBlocks((prev) => prev.filter((b) => b.id !== id));
    } catch {
      setActionError('La suppression depuis la bibliothèque a échoué.');
    }
  };

  const handleSaveToLibrary = useCallback(async (block) => {
    if (!plan.blockLibrary) {
      navigate('/app/billing');
      return;
    }
    const def = BLOCK_TYPES.find((b) => b.type === block.type);
    const name = window.prompt('Nom du bloc pour ta bibliothèque :', def?.label || block.type);
    if (!name || !name.trim()) return;
    try {
      const saved = await saveReusableBlock({ userId: effectiveOwnerId, name: name.trim(), type: block.type, content: block.content });
      setLibraryBlocks((prev) => [saved, ...prev]);
    } catch {
      setActionError("L'enregistrement dans la bibliothèque a échoué.");
    }
  }, [plan.blockLibrary, navigate, effectiveOwnerId]);

  // blocksByStepId ET steps changent tous deux de référence à chaque frappe
  // (voir applyBlocks pour l'édition de bloc, handleSaveChrome pour les
  // réglages de page) ; recalculer le score de santé (qui parcourt tous les
  // blocs de toutes les pages) de façon synchrone sur chaque caractère tapé
  // est un travail réel et inutile pendant la saisie. On ne recalcule donc
  // que 500ms après la dernière modification, sans retarder l'aperçu ni
  // l'enregistrement.
  const [healthSnapshot, setHealthSnapshot] = useState({ steps, blocksByStepId });
  useEffect(() => {
    const t = setTimeout(() => setHealthSnapshot({ steps, blocksByStepId }), 500);
    return () => clearTimeout(t);
  }, [steps, blocksByStepId]);
  const { score, checks } = useMemo(
    () => computeHealthScore(healthSnapshot.steps, healthSnapshot.blocksByStepId),
    [healthSnapshot],
  );

  // Transforme un point du Score de santé en action concrète : amène à la
  // page concernée, puis ouvre le bloc ou le panneau de réglages à corriger
  // — au lieu d'un simple indicateur passif (retour utilisateur : aucun
  // parcours guidé pour un débutant). Voir computeHealthScore pour la
  // provenance de stepId/blockId/target par point vérifié.
  const handleHealthCheckNavigate = async (check) => {
    if (!check.stepId) return;
    if (selectedStepId !== check.stepId) await selectStep(check.stepId);
    if (check.target === 'block' && check.blockId) {
      setShowSettings(false);
      setShowBrandKit(false);
      setShowPageSettings(false);
      setShowAiAssistant(false);
      setExpandedBlockId(check.blockId);
      setTimeout(() => {
        document.getElementById(`block-${check.blockId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    } else if (check.target === 'page') {
      setExpandedBlockId(null);
      setShowPageSettings(true);
      setShowSettings(false);
      setShowBrandKit(false);
      setShowAiAssistant(false);
    } else {
      setShowSettings(false);
      setShowBrandKit(false);
      setShowPageSettings(false);
      setShowAiAssistant(false);
      setExpandedBlockId(null);
    }
  };

  // dnd-kit's useSortable() (utilisé par chaque bloc) s'abonne au tableau
  // `items` de SortableContext via un contexte React : lui passer un
  // nouveau tableau à chaque frappe (blocks.map(...) recréé à chaque rendu)
  // force TOUS les blocs à se re-rendre, même ceux inchangés, court-
  // circuitant leur React.memo. On ne fait donc changer sa référence que
  // lorsque la liste d'ids elle-même change (ajout/suppression/réordre),
  // pas à chaque modification de contenu.
  const blockIdsKey = blocks.map((b) => b.id).join('|');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const blockIds = useMemo(() => (blockIdsKey ? blockIdsKey.split('|') : []), [blockIdsKey]);

  // Même piège que blockIds ci-dessus, avec un déclencheur différent : taper
  // dans les réglages de page (PageSettingsPanel, voir handleSaveChrome) met
  // `steps` à jour à chaque frappe (pour un aperçu instantané) — mais
  // `steps` sert aussi de siblingSteps pour CHAQUE bloc (VideoNavBlock,
  // sélecteur de page dans BlockEditorPanel...). Sans ce découplage, chaque
  // caractère tapé dans les réglages de page change la référence de
  // siblingSteps pour tous les blocs, contourne leur React.memo, et
  // re-rend toute la liste de blocs à chaque frappe — d'où le ralentissement
  // visible. Ces composants ne lisent que id/name/slug (jamais chrome), donc
  // on ne fait changer la référence que lorsque CES champs changent.
  const siblingStepsKey = steps.map((s) => `${s.id}:${s.name}:${s.slug}`).join('|');
  const buildSiblingSteps = () => steps.map((s) => ({ id: s.id, name: s.name, slug: s.slug, stepType: s.stepType, position: s.position }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const siblingSteps = useMemo(buildSiblingSteps, [siblingStepsKey]);

  const canUndo = historyState.index > 0;
  const canRedo = historyState.index < historyState.stack.length - 1;

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="text-center py-24">
        <h1 className="text-xl font-sans font-bold text-surface mb-2">Tunnel introuvable</h1>
        <p className="text-surface/60 mb-4">Il a peut-être été supprimé.</p>
        <Link to="/app" className="text-accent font-semibold hover:underline">Retour au tableau de bord</Link>
      </div>
    );
  }

  // Rendu identique à la page publiée (voir PublishedFunnelPage) : le
  // vendeur doit voir compte à rebours, notification d'achat et pied de
  // page collant pendant qu'il les configure, pas seulement après publication.
  const currentStepChrome = steps.find((s) => s.id === selectedStepId)?.chrome || {};

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/app" className="p-2 rounded-lg text-surface/50 hover:text-surface shrink-0"><ArrowLeft className="w-5 h-5" /></Link>
          {editingName ? (
            <input
              autoFocus
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              className="text-xl font-sans font-bold text-surface bg-transparent border-b border-accent focus:outline-none min-w-0"
            />
          ) : (
            <h1 onClick={() => setEditingName(true)} className="text-xl font-sans font-bold text-surface truncate cursor-pointer hover:text-accent transition-colors" title="Cliquer pour renommer">
              {funnel.name}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0 flex-wrap">
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-surface/50">
            <Users className="w-4 h-4" /> {leadsCount} lead(s)
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-2.5 rounded-xl border border-surface/10 text-surface/60 hover:text-surface disabled:opacity-30 disabled:hover:text-surface/60"
              aria-label="Annuler"
              title="Annuler (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-2.5 rounded-xl border border-surface/10 text-surface/60 hover:text-surface disabled:opacity-30 disabled:hover:text-surface/60"
              aria-label="Rétablir"
              title="Rétablir (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
          {funnel.is_published && (
            <a href={`/f/${funnel.slug}`} target="_blank" rel="noreferrer" className="hover-lift p-2.5 rounded-xl border border-surface/10 text-surface/60" aria-label="Voir la page publique">
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={() => setShowPreview(true)}
            className="magnetic-btn flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border border-surface/10 text-surface/70"
          >
            <Eye className="w-4 h-4" /> Aperçu
          </button>
          {/* Les 3 panneaux de réglages (Général/Design/Page) partageaient
              chacun leur propre bouton toggle en permanence visible — fusionnés
              en un seul bouton + menu déroulant pour désencombrer la barre
              d'outils (retour utilisateur : "trop d'onglets en haut"). */}
          <div ref={settingsMenuRef} className="relative">
            <button
              ref={settingsMenuTriggerRef}
              onClick={() => setShowSettingsMenu((v) => !v)}
              className={`magnetic-btn flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border ${showSettings || showBrandKit || showPageSettings ? 'bg-surface/15 border-surface/30 text-surface' : 'bg-surface/5 border-surface/10 text-surface/70'}`}
            >
              <Settings className="w-4 h-4" /> Réglages
            </button>
            {showSettingsMenu && settingsMenuPos && (
              <div
                style={{ position: 'fixed', top: settingsMenuPos.top, left: settingsMenuPos.left, width: 224, maxHeight: settingsMenuPos.maxHeight }}
                className="dropdown-panel z-30 bg-background border border-surface/10 rounded-2xl shadow-xl p-1.5 overflow-y-auto"
              >
                <button
                  onClick={() => selectSettingsPanel('general')}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${showSettings ? 'text-surface bg-surface/10' : 'text-surface/80 hover:bg-surface/5'}`}
                >
                  <Settings className="w-4 h-4 shrink-0" /> Général
                </button>
                <button
                  onClick={() => selectSettingsPanel('design')}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${showBrandKit ? 'text-accent bg-accent/10' : 'text-surface/80 hover:bg-accent/5 hover:text-accent'}`}
                >
                  <Palette className="w-4 h-4 shrink-0" /> Design
                </button>
                <button
                  onClick={() => selectSettingsPanel('page')}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-left transition-colors ${showPageSettings ? 'text-primary bg-primary/10' : 'text-surface/80 hover:bg-primary/5 hover:text-primary'}`}
                >
                  <Megaphone className="w-4 h-4 shrink-0" /> Page
                </button>
              </div>
            )}
          </div>
          {plan.aiAccess && (
            <button
              onClick={() => { setShowAiAssistant((v) => !v); setShowSettings(false); setShowBrandKit(false); setActionError(''); }}
              className={`magnetic-btn flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border ${showAiAssistant ? 'gradient-accent border-transparent text-background' : 'bg-accent/5 border-accent/15 text-accent/80'}`}
            >
              <Sparkles className="w-4 h-4" /> Assistant IA
            </button>
          )}
          <button
            onClick={togglePublish}
            className={`magnetic-btn flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold ${!needsPublish ? 'bg-surface/10 text-surface' : 'bg-accent text-background'}`}
          >
            {!needsPublish ? <><Check className="w-4 h-4" /> Publié</> : 'Publier'}
          </button>
        </div>
      </div>

      {actionError && (
        <div className="mb-6 flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-2xl px-4 py-3">
          <div className="flex items-center gap-3">
            <span>{actionError}</span>
            {actionErrorCode === 'insufficient_credits' && <RechargeCreditsButton />}
            {actionErrorCode?.includes('aucun moyen de paiement rattaché') && (
              <button
                type="button"
                onClick={() => {
                  const check = checks.find((c) => c.id === 'payment-method');
                  if (check) handleHealthCheckNavigate(check);
                  setActionError('');
                }}
                className="shrink-0 whitespace-nowrap text-xs font-semibold underline hover:opacity-70"
              >
                Configurer le paiement
              </button>
            )}
          </div>
          <button onClick={() => setActionError('')} className="shrink-0 hover:opacity-70"><X className="w-4 h-4" /></button>
        </div>
      )}

      {showBrandKit && (
        <div className="mb-6 max-w-2xl">
          <BrandKitPanel brand={funnel.brand} onSave={handleSaveBrand} userId={effectiveOwnerId} canUseBrandKit={plan.brandKit} canUseAdPixels={plan.adPixels} />
        </div>
      )}

      {showSettings && (
        <div className="mb-6 max-w-2xl">
          <FunnelSettingsPanel funnel={funnel} plan={plan} onSave={handleSaveSettings} />
        </div>
      )}

      {showPageSettings && (
        <div className="mb-6 max-w-2xl">
          <PageSettingsPanel
            step={steps.find((s) => s.id === selectedStepId)}
            steps={steps}
            plan={plan}
            onSave={handleSaveChrome}
            onChangeStepType={handleChangeStepType}
            blocksByStepId={blocksByStepId}
            currency={effectiveProfile?.currency || 'XOF'}
          />
        </div>
      )}

      {showAiAssistant && (
        <div className="mb-6 max-w-2xl bg-background border border-surface/10 rounded-[2rem] p-4 md:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-accent" />
            <h3 className="font-sans font-semibold text-surface text-sm">Assistant IA</h3>
          </div>
          <div className="space-y-3 max-h-[320px] overflow-y-auto mb-4">
            {aiMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === 'user' ? 'bg-primary text-background rounded-br-sm' : 'bg-surface/[0.03] border border-surface/10 text-surface rounded-bl-sm'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {aiGenerating && (
              <div className="flex justify-start">
                <div className="bg-surface/[0.03] border border-surface/10 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm text-surface/60 inline-flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-surface/20 border-t-accent rounded-full animate-spin" /> Modification en cours…
                </div>
              </div>
            )}
            {aiErrorCode === 'insufficient_credits' && (
              <div className="flex justify-start">
                <RechargeCreditsButton />
              </div>
            )}
          </div>
          <form onSubmit={handleAiSend} className="flex items-center gap-2">
            <input
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Ex : ajoute une section témoignages"
              disabled={aiGenerating}
              className="flex-1 bg-primary/5 border border-surface/10 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-accent transition-colors text-surface disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!aiInput.trim() || aiGenerating}
              className="magnetic-btn shrink-0 flex items-center justify-center gap-2 gradient-accent text-background w-10 h-10 rounded-full disabled:opacity-50"
              aria-label="Envoyer"
            >
              <Wand2 className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      <DndContext sensors={stepSensors} collisionDetection={closestCenter} onDragEnd={handleStepDragEnd}>
        <SortableContext items={steps.map((s) => s.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1">
            {steps.map((step) => (
              <SortableStepChip
                key={step.id}
                step={step}
                isSelected={selectedStepId === step.id}
                onSelect={() => selectStep(step.id)}
                onDelete={() => handleDeleteStep(step)}
              />
            ))}
            <button onClick={handleAddStep} className="shrink-0 flex items-center gap-1 rounded-full px-4 py-2 border border-dashed border-surface/20 text-sm text-surface/50 hover:border-accent hover:text-accent transition-colors">
              <Plus className="w-3.5 h-3.5" /> Page
            </button>
          </div>
        </SortableContext>
      </DndContext>

      <CountdownBar config={currentStepChrome.countdownBar} />

      <div className="max-w-2xl">
        <HealthScoreCard score={score} checks={checks} onNavigate={handleHealthCheckNavigate} />
      </div>

      <div
        className={`space-y-4 max-w-2xl ${currentStepChrome.stickyFooterCta?.enabled ? 'pb-24' : ''}`}
        style={brandStyleVars(funnel.brand)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
      >
        <DndContext sensors={blockSensors} collisionDetection={closestCenter} onDragEnd={handleBlockDragEnd}>
          <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {blocks.map((block, blockIndex) => (
                <SortableBlockCard
                  key={block.id}
                  block={block}
                  defaultBg={blockIndex % 2 === 0 ? 'primary' : 'primary-alt'}
                  siblingSteps={siblingSteps}
                  onDelete={handleDeleteBlock}
                  onDuplicate={handleDuplicateBlock}
                  isExpanded={expandedBlockId === block.id}
                  onToggle={handleToggleExpand}
                  onChange={handleBlockChange}
                  userId={effectiveOwnerId}
                  selectedElement={selection?.blockId === block.id ? selection.elementKey : null}
                  onSelectElement={handleSelectElement}
                  onSaveToLibrary={handleSaveToLibrary}
                  canUseLibrary={plan.blockLibrary}
                  onToggleLock={handleToggleLock}
                  onRegenerate={handleRegenerateBlock}
                  canRegenerate={plan.aiAccess}
                  regenerateCost={creditCosts?.BLOCK_REGENERATION}
                  isRegenerating={regeneratingBlockId === block.id}
                  onGenerateImage={plan.aiAccess ? handleGenerateBlockImage : undefined}
                  isGeneratingImage={imageGeneratingBlockId === block.id}
                  onRegenerateSignatureVisual={plan.aiAccess ? handleRegenerateSignatureVisual : undefined}
                  isGeneratingSignatureVisual={signatureVisualGeneratingBlockId === block.id}
                  currency={effectiveProfile?.currency || 'XOF'}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div ref={paletteRef} className="relative">
          <button
            onClick={() => setShowPalette((v) => !v)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-[2rem] border border-dashed border-surface/20 text-surface/60 hover:border-accent hover:text-accent transition-colors"
          >
            <Plus className="w-4 h-4" /> Ajouter un bloc
          </button>
          {showPalette && (
            <div className="dropdown-panel absolute z-20 mt-2 w-full bg-background border border-surface/10 rounded-2xl shadow-xl p-3">
              <div className="flex items-center gap-1 mb-2 bg-surface/5 rounded-full p-1 w-fit">
                <button
                  onClick={() => setPaletteTab('new')}
                  className={`hover-lift px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${paletteTab === 'new' ? 'bg-primary text-background' : 'text-surface/60'}`}
                >
                  Nouveau bloc
                </button>
                <button
                  onClick={handleOpenLibraryTab}
                  className={`hover-lift px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${paletteTab === 'library' ? 'bg-primary text-background' : 'text-surface/60'}`}
                >
                  Depuis ma bibliothèque
                </button>
              </div>

              {paletteTab === 'new' ? (
                <div className="grid grid-cols-2 gap-1 max-h-80 overflow-y-auto">
                  {BLOCK_TYPES.map(({ type, label, icon: Icon }) => {
                    const unlocked = plan.blocks.includes(type);
                    return (
                      <button
                        key={type}
                        onClick={() => handleAddBlock(type)}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors text-left ${
                          unlocked ? 'text-surface/80 hover:bg-accent/10 hover:text-accent' : 'text-surface/30 hover:bg-surface/5'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" /> {label}
                        {!unlocked && <Lock className="w-3 h-3 shrink-0 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              ) : !plan.blockLibrary ? (
                <div className="text-center py-6 px-2">
                  <Lock className="w-6 h-6 text-surface/30 mx-auto mb-2" />
                  <p className="text-xs text-surface/60 mb-3">La bibliothèque de blocs est réservée aux plans Pro et Entreprise.</p>
                  <Link to="/app/billing" className="text-accent text-xs font-semibold hover:underline">Voir les offres</Link>
                </div>
              ) : libraryLoading ? (
                <div className="flex justify-center py-6">
                  <Spinner size="sm" />
                </div>
              ) : libraryError ? (
                <p className="text-xs text-red-500 text-center py-4">{libraryError}</p>
              ) : libraryBlocks.length === 0 ? (
                <p className="text-xs text-surface/40 text-center py-6 px-2">Ta bibliothèque est vide. Enregistre un bloc depuis l'icône marque-page sur un bloc existant pour le retrouver ici.</p>
              ) : (
                <div className="max-h-80 overflow-y-auto space-y-1">
                  {libraryBlocks.map((lb) => {
                    const def = BLOCK_TYPES.find((b) => b.type === lb.type);
                    const Icon = def?.icon;
                    return (
                      <div key={lb.id} className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl hover:bg-accent/5">
                        <button onClick={() => handleInsertFromLibrary(lb)} className="flex items-center gap-2 text-left min-w-0 flex-1">
                          {Icon && <Icon className="w-4 h-4 shrink-0 text-accent" />}
                          <span className="min-w-0 truncate">
                            <span className="block text-sm text-surface/80 truncate">{lb.name}</span>
                            <span className="block text-xs text-surface/40">{def?.label || lb.type}</span>
                          </span>
                        </button>
                        <button onClick={() => handleDeleteLibraryBlock(lb.id)} className="p-1 text-surface/30 hover:text-red-500 shrink-0" aria-label="Supprimer de la bibliothèque">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <PurchaseNotification config={currentStepChrome.purchaseNotification} liftForFooter={Boolean(currentStepChrome.stickyFooterCta?.enabled)} />
      <StickyFooterCta
        config={{
          ...currentStepChrome.stickyFooterCta,
          price: resolveStickyFooterPrice(
            currentStepChrome.stickyFooterCta,
            Object.values(blocksByStepId).flat(),
            effectiveProfile?.currency || 'XOF',
          ),
        }}
        onNavigateToStep={() => {}}
        onAdvance={() => {}}
        editMode
      />
      {/* ExitIntentPopup n'est délibérément PAS rendu ici : il écoute le
          mouseleave du curseur vers le haut de la fenêtre, exactement ce que
          fait un créateur en visant la barre d'outils pendant qu'il édite —
          le rendre ici déclencherait la popup en boucle plutôt qu'un vrai
          test. Seule exception à la parité éditeur/publié pour cette raison
          précise ; réglable et testable via "Aperçu" (FunnelPreviewModal). */}

      {selection && (
        <ElementStylePanel
          block={blocks.find((b) => b.id === selection.blockId)}
          elementKey={selection.elementKey}
          kind={selection.kind}
          label={selection.label}
          onChange={(newStyles) => handleElementStyleChange(blocks.find((b) => b.id === selection.blockId), newStyles)}
          onClose={() => setSelection(null)}
          onImproveWithAI={handleImproveElement}
          improvingElement={Boolean(improvingElementKey)}
          canUseAI={plan.aiAccess}
        />
      )}

      {showPreview && (
        <FunnelPreviewModal
          funnel={funnel}
          steps={steps}
          blocksByStepId={blocksByStepId}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
