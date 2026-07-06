import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, ExternalLink, Plus, X, ChevronUp, ChevronDown,
  Pencil, Trash2, Users, Check, Lock, Palette,
} from 'lucide-react';
import {
  fetchFunnel, updateFunnel, fetchSteps, addStep, deleteStep, swapStepPositions,
  fetchBlocks, addBlock, updateBlock, deleteBlock, swapBlockPositions, countLeads,
} from '../../lib/funnelsApi';
import { BLOCK_TYPES, createDefaultContent } from '../../lib/blockTypes';
import { slugify } from '../../lib/slug';
import { useAuth } from '../../context/AuthContext';
import { getPlan } from '../../lib/plans';
import { brandStyleVars } from '../../lib/colorUtils';
import BlockRenderer from '../../components/blocks/BlockRenderer';
import BlockEditorPanel from '../../components/blocks/BlockEditorPanel';
import BrandKitPanel from '../../components/app/BrandKitPanel';

function BlockCard({ block, index, total, onMove, onDelete, isExpanded, onToggle, onChange, userId }) {
  const def = BLOCK_TYPES.find((b) => b.type === block.type);
  const Icon = def?.icon;

  return (
    <div className="bg-background border border-surface/10 rounded-[2rem] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-surface/10 bg-surface/[0.02]">
        <div className="flex items-center gap-2 text-sm font-medium text-surface/70">
          {Icon && <Icon className="w-4 h-4 text-accent" />}
          {def?.label || block.type}
        </div>
        <div className="flex items-center gap-1">
          <button disabled={index === 0} onClick={() => onMove(-1)} className="p-1.5 rounded-lg text-surface/40 hover:text-surface disabled:opacity-20 disabled:hover:text-surface/40">
            <ChevronUp className="w-4 h-4" />
          </button>
          <button disabled={index === total - 1} onClick={() => onMove(1)} className="p-1.5 rounded-lg text-surface/40 hover:text-surface disabled:opacity-20 disabled:hover:text-surface/40">
            <ChevronDown className="w-4 h-4" />
          </button>
          <button onClick={onToggle} className={`p-1.5 rounded-lg ${isExpanded ? 'text-accent' : 'text-surface/40 hover:text-surface'}`}>
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg text-surface/40 hover:text-red-500">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="pointer-events-none opacity-95 scale-[0.97] origin-top">
        <BlockRenderer block={block} onAdvance={() => {}} />
      </div>

      {isExpanded && (
        <div className="border-t border-surface/10 p-5 bg-surface/[0.02]">
          <BlockEditorPanel block={block} onChange={onChange} userId={userId} />
        </div>
      )}
    </div>
  );
}

export default function FunnelEditorPage() {
  const { funnelId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const plan = getPlan(profile?.plan);
  const [funnel, setFunnel] = useState(null);
  const [steps, setSteps] = useState([]);
  const [selectedStepId, setSelectedStepId] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [expandedBlockId, setExpandedBlockId] = useState(null);
  const [showPalette, setShowPalette] = useState(false);
  const [showBrandKit, setShowBrandKit] = useState(false);
  const [leadsCount, setLeadsCount] = useState(0);
  const [nameDraft, setNameDraft] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadBlocks = useCallback(async (stepId) => {
    if (!stepId) { setBlocks([]); return; }
    const data = await fetchBlocks(stepId);
    setBlocks(data);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    let f;
    try {
      f = await fetchFunnel(funnelId);
    } catch (err) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setFunnel(f);
    setNameDraft(f.name);
    const s = await fetchSteps(funnelId);
    setSteps(s);
    const firstStep = s[0]?.id || null;
    setSelectedStepId(firstStep);
    await loadBlocks(firstStep);
    const count = await countLeads(funnelId);
    setLeadsCount(count);
    setLoading(false);
  }, [funnelId, loadBlocks]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const selectStep = async (stepId) => {
    setSelectedStepId(stepId);
    setExpandedBlockId(null);
    await loadBlocks(stepId);
  };

  const handleSaveName = async () => {
    setEditingName(false);
    if (nameDraft.trim() && nameDraft !== funnel.name) {
      await updateFunnel(funnelId, { name: nameDraft.trim() });
      setFunnel((f) => ({ ...f, name: nameDraft.trim() }));
    }
  };

  const togglePublish = async () => {
    const next = !funnel.is_published;
    await updateFunnel(funnelId, { is_published: next });
    setFunnel((f) => ({ ...f, is_published: next }));
  };

  const handleAddStep = async () => {
    const name = window.prompt('Nom de la nouvelle page :');
    if (!name || !name.trim()) return;
    const step = await addStep(funnelId, { name: name.trim(), slug: slugify(name), position: steps.length });
    setSteps((prev) => [...prev, step]);
    selectStep(step.id);
  };

  const handleDeleteStep = async (step) => {
    if (steps.length <= 1) { window.alert('Un tunnel doit garder au moins une page.'); return; }
    if (!window.confirm(`Supprimer la page "${step.name}" ?`)) return;
    await deleteStep(step.id);
    const remaining = steps.filter((s) => s.id !== step.id);
    setSteps(remaining);
    if (selectedStepId === step.id) selectStep(remaining[0]?.id || null);
  };

  const moveStep = async (step, direction) => {
    const idx = steps.findIndex((s) => s.id === step.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= steps.length) return;
    const other = steps[swapIdx];
    await swapStepPositions(step, other);
    const next = [...steps];
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    setSteps(next);
  };

  const handleAddBlock = async (type) => {
    setShowPalette(false);
    if (!plan.blocks.includes(type)) {
      navigate('/app/billing');
      return;
    }
    const block = await addBlock(selectedStepId, type, createDefaultContent(type), blocks.length);
    setBlocks((prev) => [...prev, block]);
    setExpandedBlockId(block.id);
  };

  const handleDeleteBlock = async (block) => {
    if (!window.confirm('Supprimer ce bloc ?')) return;
    await deleteBlock(block.id);
    setBlocks((prev) => prev.filter((b) => b.id !== block.id));
  };

  const moveBlock = async (block, direction) => {
    const idx = blocks.findIndex((b) => b.id === block.id);
    const swapIdx = idx + direction;
    if (swapIdx < 0 || swapIdx >= blocks.length) return;
    const other = blocks[swapIdx];
    await swapBlockPositions(block, other);
    const next = [...blocks];
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    setBlocks(next);
  };

  const handleBlockChange = async (block, newContent) => {
    setBlocks((prev) => prev.map((b) => (b.id === block.id ? { ...b, content: newContent } : b)));
    await updateBlock(block.id, newContent);
  };

  const handleSaveBrand = async (brand) => {
    await updateFunnel(funnelId, { brand });
    setFunnel((f) => ({ ...f, brand }));
    setShowBrandKit(false);
  };

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
      {/* Top bar */}
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

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-surface/50">
            <Users className="w-4 h-4" /> {leadsCount} lead(s)
          </div>
          {funnel.is_published && (
            <a href={`/f/${funnel.slug}`} target="_blank" rel="noreferrer" className="hover-lift p-2.5 rounded-xl border border-surface/10 text-surface/60" aria-label="Voir la page publique">
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={() => setShowBrandKit((v) => !v)}
            className={`magnetic-btn flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold border ${showBrandKit ? 'bg-accent/10 border-accent text-accent' : 'border-surface/10 text-surface/70'}`}
          >
            <Palette className="w-4 h-4" /> Design
          </button>
          <button
            onClick={togglePublish}
            className={`magnetic-btn flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold ${funnel.is_published ? 'bg-surface/10 text-surface' : 'bg-accent text-background'}`}
          >
            {funnel.is_published ? <><Check className="w-4 h-4" /> Publié</> : 'Publier'}
          </button>
        </div>
      </div>

      {showBrandKit && (
        <div className="mb-6 max-w-2xl">
          <BrandKitPanel brand={funnel.brand} onSave={handleSaveBrand} userId={profile?.id} canUseBrandKit={plan.brandKit} />
        </div>
      )}

      {/* Steps chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 -mx-1 px-1">
        {steps.map((step) => (
          <div key={step.id} className={`group flex items-center gap-1 shrink-0 rounded-full pl-4 pr-1.5 py-1.5 border ${selectedStepId === step.id ? 'bg-primary text-background border-primary' : 'bg-background text-surface/70 border-surface/10'}`}>
            <button onClick={() => selectStep(step.id)} className="text-sm font-medium whitespace-nowrap">
              {step.name}
            </button>
            <button onClick={() => moveStep(step, -1)} className="p-1 opacity-50 hover:opacity-100"><ChevronUp className="w-3 h-3 -rotate-90" /></button>
            <button onClick={() => moveStep(step, 1)} className="p-1 opacity-50 hover:opacity-100"><ChevronUp className="w-3 h-3 rotate-90" /></button>
            <button onClick={() => handleDeleteStep(step)} className="p-1 opacity-50 hover:opacity-100 hover:text-red-400"><X className="w-3 h-3" /></button>
          </div>
        ))}
        <button onClick={handleAddStep} className="shrink-0 flex items-center gap-1 rounded-full px-4 py-2 border border-dashed border-surface/20 text-sm text-surface/50 hover:border-accent hover:text-accent transition-colors">
          <Plus className="w-3.5 h-3.5" /> Page
        </button>
      </div>

      {/* Blocks */}
      <div className="space-y-4 max-w-2xl" style={brandStyleVars(funnel.brand)}>
        {blocks.map((block, i) => (
          <BlockCard
            key={block.id}
            block={block}
            index={i}
            total={blocks.length}
            onMove={(dir) => moveBlock(block, dir)}
            onDelete={() => handleDeleteBlock(block)}
            isExpanded={expandedBlockId === block.id}
            onToggle={() => setExpandedBlockId(expandedBlockId === block.id ? null : block.id)}
            onChange={(content) => handleBlockChange(block, content)}
            userId={profile?.id}
          />
        ))}

        <div className="relative">
          <button
            onClick={() => setShowPalette((v) => !v)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-[2rem] border border-dashed border-surface/20 text-surface/60 hover:border-accent hover:text-accent transition-colors"
          >
            <Plus className="w-4 h-4" /> Ajouter un bloc
          </button>
          {showPalette && (
            <div className="absolute z-20 mt-2 w-full bg-background border border-surface/10 rounded-2xl shadow-xl p-2 grid grid-cols-2 gap-1">
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
          )}
        </div>
      </div>
    </div>
  );
}
