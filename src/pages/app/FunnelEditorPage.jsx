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
  fetchFunnel, updateFunnel, fetchSteps, addStep, deleteStep, reorderSteps, updateStep,
  fetchBlocks, addBlock, updateBlock, deleteBlock, reorderBlocks, countLeads, toggleBlockLock,
} from '../../lib/funnelsApi';
import { BLOCK_TYPES, createDefaultContent } from '../../lib/blockTypes';
import { slugify } from '../../lib/slug';
import { useAuth } from '../../context/AuthContext';
import { getPlan } from '../../lib/plans';
import { brandStyleVars } from '../../lib/colorUtils';
import { computeHealthScore } from '../../lib/healthScore';
import { fetchReusableBlocks, saveReusableBlock, deleteReusableBlock, incrementReusableBlockUsage } from '../../lib/growthApi';
import { editFunnelWithAI, regenerateBlockWithAI, generateBlockImageWithAI } from '../../lib/aiApi';
import BlockRenderer from '../../components/blocks/BlockRenderer';
import BlockEditorPanel from '../../components/blocks/BlockEditorPanel';
import ElementStylePanel from '../../components/blocks/ElementStylePanel';
import BrandKitPanel from '../../components/app/BrandKitPanel';
import FunnelSettingsPanel from '../../components/app/FunnelSettingsPanel';
import PageSettingsPanel from '../../components/app/PageSettingsPanel';
import FunnelPreviewModal from '../../components/app/FunnelPreviewModal';
import HealthScoreCard from '../../components/app/HealthScoreCard';

const HISTORY_LIMIT = 20;

function BlockCard({
  block, onDelete, onDuplicate, isExpanded, onToggle, onChange, userId, selectedElement, onSelectElement,
  dragHandleProps, onSaveToLibrary, canUseLibrary, onToggleLock, onRegenerate, canRegenerate, isRegenerating,
  onGenerateImage, isGeneratingImage, defaultBg, siblingSteps,
}) {
  const def = BLOCK_TYPES.find((b) => b.type === block.type);
  const Icon = def?.icon;
  const locked = Boolean(block.locked);

  return (
    <div className={`bg-background border rounded-[2rem] overflow-hidden ${locked ? 'border-accent/30' : 'border-surface/10'}`}>
      <div className="flex items-center justify-between px-5 py-3 border-b border-surface/10 bg-surface/[0.02]">
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
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="p-1.5 rounded-lg text-surface/40 hover:text-accent disabled:opacity-50"
              aria-label="Régénérer ce bloc avec l'IA"
              title="Régénérer ce bloc avec l'IA"
            >
              {isRegenerating ? (
                <span className="block w-4 h-4 border-2 border-surface/20 border-t-accent rounded-full animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
            </button>
          )}
          <button
            onClick={onToggleLock}
            className={`p-1.5 rounded-lg ${locked ? 'text-accent hover:text-accent/70' : 'text-surface/40 hover:text-surface'}`}
            aria-label={locked ? 'Déverrouiller ce bloc' : 'Verrouiller ce bloc'}
            title={locked ? "Déverrouiller (l'IA pourra à nouveau le modifier)" : "Verrouiller (protège ce bloc des régénérations IA)"}
          >
            {locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
          <button onClick={onToggle} className={`p-1.5 rounded-lg ${isExpanded ? 'text-accent' : 'text-surface/40 hover:text-surface'}`}>
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={onDuplicate} className="p-1.5 rounded-lg text-surface/40 hover:text-surface" aria-label="Dupliquer">
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={onSaveToLibrary}
            className={`p-1.5 rounded-lg ${canUseLibrary ? 'text-surface/40 hover:text-accent' : 'text-surface/20 hover:text-surface/40'}`}
            aria-label="Enregistrer dans ma bibliothèque"
            title={canUseLibrary ? 'Enregistrer dans ma bibliothèque' : 'Bibliothèque réservée aux plans payants'}
          >
            <BookmarkPlus className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg text-surface/40 hover:text-red-500">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="opacity-95 scale-[0.97] origin-top">
        <BlockRenderer
          block={block}
          onAdvance={() => {}}
          editMode
          selectedElement={selectedElement}
          onSelectElement={onSelectElement}
          onContentChange={onChange}
          userId={userId}
          defaultBg={defaultBg}
          siblingSteps={siblingSteps}
        />
      </div>

      {isExpanded && (
        <div className="border-t border-surface/10 p-5 bg-surface/[0.02]">
          <BlockEditorPanel
            block={block}
            onChange={onChange}
            userId={userId}
            onGenerateImage={onGenerateImage}
            imageGenerating={isGeneratingImage}
            steps={siblingSteps}
          />
        </div>
      )}
    </div>
  );
}

function SortableBlockCard(props) {
  const { block } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style}>
      <BlockCard {...props} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

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
      <button onClick={onSelect} className="text-sm font-medium whitespace-nowrap px-1.5">
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
  const [showPreview, setShowPreview] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    { role: 'assistant', text: "Décris ce que tu veux changer sur ce tunnel (ex. « ajoute une section témoignages », « rends le titre plus percutant »)." },
  ]);
  const [aiInput, setAiInput] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [regeneratingBlockId, setRegeneratingBlockId] = useState(null);
  const [imageGeneratingBlockId, setImageGeneratingBlockId] = useState(null);
  const [leadsCount, setLeadsCount] = useState(0);
  const [nameDraft, setNameDraft] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [actionError, setActionError] = useState('');
  const [libraryBlocks, setLibraryBlocks] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState('');
  const [historyState, setHistoryState] = useState({ stack: [], index: -1 });

  const contentHistoryTimer = useRef(null);

  const loadAllBlocks = useCallback(async (stepList) => {
    const entries = await Promise.all(stepList.map(async (s) => [s.id, await fetchBlocks(s.id)]));
    const map = Object.fromEntries(entries);
    setBlocksByStepId(map);
    return map;
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    let f;
    try {
      f = await fetchFunnel(funnelId);
    } catch {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setFunnel(f);
    setNameDraft(f.name);
    const s = await fetchSteps(funnelId);
    setSteps(s);
    const map = await loadAllBlocks(s);
    const firstStep = s[0]?.id || null;
    setSelectedStepId(firstStep);
    const initialBlocks = map[firstStep] || [];
    setBlocks(initialBlocks);
    setHistoryState({ stack: [initialBlocks], index: 0 });
    const count = await countLeads(funnelId);
    setLeadsCount(count);
    setLoading(false);
  }, [funnelId, loadAllBlocks]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const AI_ERROR_MESSAGES = {
    plan_required: "L'édition par IA nécessite le plan Pro ou Entreprise.",
    limit_reached: 'Tu as atteint ta limite de générations IA ce mois-ci.',
    invalid_input: 'Précise un peu plus ta demande.',
    ai_error: "L'IA n'a pas pu répondre pour le moment. Réessaie dans quelques instants.",
    parse_error: 'La modification a échoué. Réessaie avec une formulation différente.',
    block_locked: 'Déverrouille ce bloc avant de le régénérer.',
    server_error: 'Une erreur est survenue. Réessaie.',
  };

  // Messages dédiés au quota d'images (distinct du quota IA/texte ci-dessus)
  // : un utilisateur avec du quota IA restant mais plus de quota image ne
  // doit pas voir un message trompeur sur la limite de génération de texte.
  const IMAGE_ERROR_MESSAGES = {
    plan_required: "La génération d'images nécessite le plan Pro ou Entreprise.",
    limit_reached: "Tu as atteint ta limite de générations d'images ce mois-ci.",
    invalid_input: "Ce type de bloc ne supporte pas la génération d'image.",
    ai_error: "Le générateur d'images n'a pas pu répondre. Réessaie dans quelques instants.",
    parse_error: 'La génération a échoué. Réessaie.',
    server_error: 'Une erreur est survenue. Réessaie.',
  };

  const handleAiSend = async (e) => {
    e.preventDefault();
    if (!aiInput.trim() || aiGenerating) return;
    const instruction = aiInput.trim();
    setAiInput('');
    setAiMessages((prev) => [...prev, { role: 'user', text: instruction }]);
    setAiGenerating(true);
    try {
      await editFunnelWithAI(funnelId, instruction);
      await loadAll();
      setAiMessages((prev) => [...prev, { role: 'assistant', text: 'Modifications appliquées — regarde le résultat ci-dessous.' }]);
    } catch (err) {
      setAiMessages((prev) => [...prev, { role: 'assistant', text: AI_ERROR_MESSAGES[err.message] || AI_ERROR_MESSAGES.server_error }]);
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

  const togglePublish = async () => {
    const next = !funnel.is_published;
    try {
      await updateFunnel(funnelId, { is_published: next });
      setFunnel((f) => ({ ...f, is_published: next }));
    } catch {
      setActionError('La publication a échoué. Réessaie.');
    }
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
    if (steps.length <= 1) { window.alert('Un tunnel doit garder au moins une page.'); return; }
    if (!window.confirm(`Supprimer la page "${step.name}" ?`)) return;
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
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
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
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
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

  const handleDeleteBlock = async (block) => {
    if (!window.confirm('Supprimer ce bloc ?')) return;
    try {
      await deleteBlock(block.id);
      const next = blocks.filter((b) => b.id !== block.id);
      applyBlocks(next);
      pushHistory(next);
      setSelection((sel) => (sel?.blockId === block.id ? null : sel));
    } catch {
      setActionError('La suppression du bloc a échoué. Réessaie.');
    }
  };

  const handleDuplicateBlock = async (block) => {
    try {
      const copy = await addBlock(selectedStepId, block.type, { ...block.content }, blocks.length);
      const next = [...blocks, copy];
      applyBlocks(next);
      pushHistory(next);
    } catch {
      setActionError('La duplication a échoué. Réessaie.');
    }
  };

  const handleToggleLock = async (block) => {
    const nextLocked = !block.locked;
    const next = blocks.map((b) => (b.id === block.id ? { ...b, locked: nextLocked } : b));
    applyBlocks(next);
    try {
      await toggleBlockLock(block.id, nextLocked);
    } catch {
      applyBlocks(blocks);
      setActionError('Le verrouillage a échoué. Réessaie.');
    }
  };

  const handleRegenerateBlock = async (block) => {
    if (regeneratingBlockId) return;
    setRegeneratingBlockId(block.id);
    setActionError('');
    try {
      const updated = await regenerateBlockWithAI(block.id);
      const next = blocks.map((b) => (b.id === block.id ? { ...b, content: updated.content } : b));
      applyBlocks(next);
      pushHistory(next);
    } catch (err) {
      setActionError(AI_ERROR_MESSAGES[err.message] || AI_ERROR_MESSAGES.server_error);
    }
    setRegeneratingBlockId(null);
  };

  const handleGenerateBlockImage = async (blockId, imageType) => {
    if (imageGeneratingBlockId) return;
    setImageGeneratingBlockId(blockId);
    setActionError('');
    try {
      const updated = await generateBlockImageWithAI(blockId, imageType);
      const next = blocks.map((b) => (b.id === blockId ? { ...b, content: updated.content } : b));
      applyBlocks(next);
      pushHistory(next);
    } catch (err) {
      setActionError(IMAGE_ERROR_MESSAGES[err.message] || IMAGE_ERROR_MESSAGES.server_error);
    }
    setImageGeneratingBlockId(null);
  };

  const handleBlockChange = async (block, newContent) => {
    const next = blocks.map((b) => (b.id === block.id ? { ...b, content: newContent } : b));
    applyBlocks(next);
    try {
      await updateBlock(block.id, newContent);
    } catch {
      setActionError("L'enregistrement du bloc a échoué. Réessaie.");
      return;
    }
    if (contentHistoryTimer.current) clearTimeout(contentHistoryTimer.current);
    contentHistoryTimer.current = setTimeout(() => pushHistory(next), 600);
  };

  const handleElementStyleChange = async (block, newStyles) => {
    await handleBlockChange(block, { ...block.content, styles: newStyles });
  };

  const handleSaveBrand = async (brand) => {
    try {
      await updateFunnel(funnelId, { brand });
      setFunnel((f) => ({ ...f, brand }));
      setShowBrandKit(false);
    } catch {
      setActionError('L\'enregistrement du Brand Kit a échoué. Réessaie.');
    }
  };

  const handleSaveSettings = async (patch) => {
    await updateFunnel(funnelId, patch);
    setFunnel((f) => ({ ...f, ...patch }));
  };

  const handleSaveChrome = async (chrome) => {
    await updateStep(selectedStepId, { chrome });
    setSteps((prev) => prev.map((s) => (s.id === selectedStepId ? { ...s, chrome } : s)));
  };

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
    if (!window.confirm('Supprimer ce bloc de ta bibliothèque ?')) return;
    try {
      await deleteReusableBlock(id);
      setLibraryBlocks((prev) => prev.filter((b) => b.id !== id));
    } catch {
      setActionError('La suppression depuis la bibliothèque a échoué.');
    }
  };

  const handleSaveToLibrary = async (block) => {
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
  };

  const { score, checks } = useMemo(() => computeHealthScore(steps, blocksByStepId), [steps, blocksByStepId]);

  const canUndo = historyState.index > 0;
  const canRedo = historyState.index < historyState.stack.length - 1;

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-2 border-surface/20 border-t-accent rounded-full animate-spin" />
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
          <button
            onClick={() => { setShowSettings((v) => !v); setShowBrandKit(false); setShowAiAssistant(false); }}
            className={`magnetic-btn flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border ${showSettings ? 'bg-accent/10 border-accent text-accent' : 'border-surface/10 text-surface/70'}`}
          >
            <Settings className="w-4 h-4" /> Réglages
          </button>
          <button
            onClick={() => { setShowBrandKit((v) => !v); setShowSettings(false); setShowAiAssistant(false); setShowPageSettings(false); }}
            className={`magnetic-btn flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border ${showBrandKit ? 'bg-accent/10 border-accent text-accent' : 'border-surface/10 text-surface/70'}`}
          >
            <Palette className="w-4 h-4" /> Design
          </button>
          <button
            onClick={() => { setShowPageSettings((v) => !v); setShowSettings(false); setShowBrandKit(false); setShowAiAssistant(false); }}
            className={`magnetic-btn flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border ${showPageSettings ? 'bg-accent/10 border-accent text-accent' : 'border-surface/10 text-surface/70'}`}
          >
            <Megaphone className="w-4 h-4" /> Page
          </button>
          {plan.aiAccess && (
            <button
              onClick={() => { setShowAiAssistant((v) => !v); setShowSettings(false); setShowBrandKit(false); }}
              className={`magnetic-btn flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border ${showAiAssistant ? 'bg-accent/10 border-accent text-accent' : 'border-surface/10 text-surface/70'}`}
            >
              <Sparkles className="w-4 h-4" /> Assistant IA
            </button>
          )}
          <button
            onClick={togglePublish}
            className={`magnetic-btn flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold ${funnel.is_published ? 'bg-surface/10 text-surface' : 'bg-accent text-background'}`}
          >
            {funnel.is_published ? <><Check className="w-4 h-4" /> Publié</> : 'Publier'}
          </button>
        </div>
      </div>

      {actionError && (
        <div className="mb-6 flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-2xl px-4 py-3">
          <span>{actionError}</span>
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
          <PageSettingsPanel step={steps.find((s) => s.id === selectedStepId)} steps={steps} plan={plan} onSave={handleSaveChrome} />
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

      <div className="max-w-2xl">
        <HealthScoreCard score={score} checks={checks} />
      </div>

      <div
        className="space-y-4 max-w-2xl"
        style={brandStyleVars(funnel.brand)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
      >
        <DndContext sensors={blockSensors} collisionDetection={closestCenter} onDragEnd={handleBlockDragEnd}>
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {blocks.map((block, blockIndex) => (
                <SortableBlockCard
                  key={block.id}
                  block={block}
                  defaultBg={blockIndex % 2 === 0 ? 'primary' : 'white'}
                  siblingSteps={steps}
                  onDelete={() => handleDeleteBlock(block)}
                  onDuplicate={() => handleDuplicateBlock(block)}
                  isExpanded={expandedBlockId === block.id}
                  onToggle={() => setExpandedBlockId(expandedBlockId === block.id ? null : block.id)}
                  onChange={(content) => handleBlockChange(block, content)}
                  userId={effectiveOwnerId}
                  selectedElement={selection?.blockId === block.id ? selection.elementKey : null}
                  onSelectElement={(elementKey, kind, label) => setSelection({ blockId: block.id, elementKey, kind, label })}
                  onSaveToLibrary={() => handleSaveToLibrary(block)}
                  canUseLibrary={plan.blockLibrary}
                  onToggleLock={() => handleToggleLock(block)}
                  onRegenerate={() => handleRegenerateBlock(block)}
                  canRegenerate={plan.aiAccess}
                  isRegenerating={regeneratingBlockId === block.id}
                  onGenerateImage={plan.aiAccess ? handleGenerateBlockImage : undefined}
                  isGeneratingImage={imageGeneratingBlockId === block.id}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        <div className="relative">
          <button
            onClick={() => setShowPalette((v) => !v)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-[2rem] border border-dashed border-surface/20 text-surface/60 hover:border-accent hover:text-accent transition-colors"
          >
            <Plus className="w-4 h-4" /> Ajouter un bloc
          </button>
          {showPalette && (
            <div className="absolute z-20 mt-2 w-full bg-background border border-surface/10 rounded-2xl shadow-xl p-3">
              <div className="flex items-center gap-1 mb-2 bg-surface/5 rounded-full p-1 w-fit">
                <button
                  onClick={() => setPaletteTab('new')}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${paletteTab === 'new' ? 'bg-primary text-background' : 'text-surface/60'}`}
                >
                  Nouveau bloc
                </button>
                <button
                  onClick={handleOpenLibraryTab}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${paletteTab === 'library' ? 'bg-primary text-background' : 'text-surface/60'}`}
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
                  <div className="w-5 h-5 border-2 border-surface/20 border-t-accent rounded-full animate-spin" />
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

      {selection && (
        <ElementStylePanel
          block={blocks.find((b) => b.id === selection.blockId)}
          elementKey={selection.elementKey}
          kind={selection.kind}
          label={selection.label}
          onChange={(newStyles) => handleElementStyleChange(blocks.find((b) => b.id === selection.blockId), newStyles)}
          onClose={() => setSelection(null)}
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
