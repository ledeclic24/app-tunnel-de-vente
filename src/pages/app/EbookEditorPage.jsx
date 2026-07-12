import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Download, GripVertical, Pencil, Plus, Sparkles, Trash2, Wand2, X,
} from 'lucide-react';
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  fetchEbook, updateEbook, addChapter, updateChapter, deleteChapter,
  reorderChapters, generateChapterContent, downloadEbookPdf,
} from '../../lib/ebooksApi';

const ERROR_MESSAGES = {
  plan_required: "Le générateur d'ebook nécessite le plan Pro ou Entreprise.",
  limit_reached: 'Tu as atteint ta limite de générations ce mois-ci.',
  invalid_input: 'Précise un peu plus ce chapitre.',
  ai_error: "L'IA n'a pas pu répondre pour le moment. Réessaie dans quelques instants.",
  parse_error: 'La génération a échoué. Réessaie.',
  server_error: 'Une erreur est survenue. Réessaie.',
};

const TONES = [
  { key: 'pro', label: 'Professionnel' },
  { key: 'storytelling', label: 'Storytelling' },
  { key: 'direct', label: 'Direct' },
];

function ChapterCard({ chapter, index, onGenerate, onUpdate, onDelete, generating, dragHandleProps }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(chapter.title);
  const [description, setDescription] = useState(chapter.description);

  const saveEdit = () => {
    onUpdate(chapter.id, { title, description });
    setEditing(false);
  };

  return (
    <div className="bg-background border border-surface/10 rounded-[1.5rem] p-4">
      <div className="flex items-start gap-3">
        <button {...dragHandleProps} className="p-1.5 mt-0.5 rounded-lg text-surface/30 hover:text-surface cursor-grab active:cursor-grabbing touch-none shrink-0" aria-label="Réordonner">
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-2">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-primary/5 border border-surface/10 rounded-lg px-3 py-2 text-sm font-semibold text-surface" />
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full bg-primary/5 border border-surface/10 rounded-lg px-3 py-2 text-sm text-surface" />
              <div className="flex gap-2">
                <button onClick={saveEdit} className="text-xs font-semibold text-accent">Enregistrer</button>
                <button onClick={() => setEditing(false)} className="text-xs text-surface/50">Annuler</button>
              </div>
            </div>
          ) : (
            <>
              <p className="font-semibold text-surface">{index + 1}. {chapter.title}</p>
              <p className="text-sm text-surface/50 mt-0.5">{chapter.description}</p>
              {chapter.content && (
                <p className="text-xs text-surface/40 mt-2 line-clamp-3 whitespace-pre-line">{chapter.content}</p>
              )}
            </>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => setEditing((v) => !v)} className="p-1.5 rounded-lg text-surface/40 hover:text-surface" aria-label="Modifier">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => onDelete(chapter.id)} className="p-1.5 rounded-lg text-surface/40 hover:text-red-500" aria-label="Supprimer">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <button
        onClick={() => onGenerate(chapter.id)}
        disabled={generating}
        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-accent disabled:opacity-50"
      >
        {generating ? (
          <span className="w-3.5 h-3.5 border-2 border-surface/20 border-t-accent rounded-full animate-spin" />
        ) : (
          <Wand2 className="w-3.5 h-3.5" />
        )}
        {chapter.content ? 'Régénérer le contenu' : 'Générer le contenu de ce chapitre'}
      </button>
    </div>
  );
}

function SortableChapterCard(props) {
  const { chapter } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: chapter.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style}>
      <ChapterCard {...props} dragHandleProps={{ ...attributes, ...listeners }} />
    </div>
  );
}

export default function EbookEditorPage() {
  const { ebookId } = useParams();
  const navigate = useNavigate();

  const [ebook, setEbook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [generatingId, setGeneratingId] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const load = useCallback(async () => {
    const data = await fetchEbook(ebookId);
    setEbook(data.ebook);
    setChapters(data.chapters);
  }, [ebookId]);

  useEffect(() => { load(); }, [load]);

  if (!ebook) return <p className="text-sm text-surface/40 text-center py-16">Chargement...</p>;

  const handleGenerateChapter = async (chapterId) => {
    setGeneratingId(chapterId);
    setError('');
    try {
      const updated = await generateChapterContent(chapterId);
      setChapters((prev) => prev.map((c) => (c.id === chapterId ? updated : c)));
    } catch (err) {
      setError(ERROR_MESSAGES[err.message] || ERROR_MESSAGES.server_error);
    }
    setGeneratingId(null);
  };

  const handleUpdateChapter = async (chapterId, patch) => {
    const updated = await updateChapter(chapterId, patch);
    setChapters((prev) => prev.map((c) => (c.id === chapterId ? updated : c)));
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm('Supprimer ce chapitre ?')) return;
    await deleteChapter(chapterId);
    setChapters((prev) => prev.filter((c) => c.id !== chapterId));
  };

  const handleAddChapter = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const chapter = await addChapter(ebookId, { title: newTitle.trim(), description: newDescription.trim() || newTitle.trim() });
    setChapters((prev) => [...prev, chapter]);
    setNewTitle(''); setNewDescription(''); setShowAddChapter(false);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = chapters.findIndex((c) => c.id === active.id);
    const newIndex = chapters.findIndex((c) => c.id === over.id);
    const next = arrayMove(chapters, oldIndex, newIndex);
    setChapters(next);
    await reorderChapters(next.map((c) => c.id));
  };

  const handleSaveSettings = async (patch) => {
    const updated = await updateEbook(ebookId, patch);
    setEbook(updated);
  };

  const handleDownload = async () => {
    setDownloading(true);
    setError('');
    try {
      await downloadEbookPdf(ebookId, `${ebook.title}.pdf`);
    } catch {
      setError(ERROR_MESSAGES.server_error);
    }
    setDownloading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/app/ebooks" className="inline-flex items-center gap-2 text-sm text-surface/60 hover:text-surface mb-6">
        <ArrowLeft className="w-4 h-4" /> Retour aux ebooks
      </Link>

      <div className="flex items-start justify-between mb-2">
        <div>
          <h1 className="text-2xl font-sans font-bold text-surface">{ebook.title}</h1>
          {ebook.subtitle && <p className="text-surface/50">{ebook.subtitle}</p>}
        </div>
        <button onClick={() => setShowSettings((v) => !v)} className="p-2 rounded-lg text-surface/40 hover:text-surface shrink-0" aria-label="Réglages">
          <Pencil className="w-4 h-4" />
        </button>
      </div>

      {showSettings && (
        <div className="bg-background border border-surface/10 rounded-[1.5rem] p-4 mb-6 space-y-3">
          <input
            defaultValue={ebook.title}
            onBlur={(e) => handleSaveSettings({ title: e.target.value })}
            placeholder="Titre"
            className="w-full bg-primary/5 border border-surface/10 rounded-lg px-3 py-2 text-sm text-surface"
          />
          <input
            defaultValue={ebook.subtitle || ''}
            onBlur={(e) => handleSaveSettings({ subtitle: e.target.value })}
            placeholder="Sous-titre"
            className="w-full bg-primary/5 border border-surface/10 rounded-lg px-3 py-2 text-sm text-surface"
          />
          <input
            defaultValue={ebook.authorName || ''}
            onBlur={(e) => handleSaveSettings({ authorName: e.target.value })}
            placeholder="Nom de l'auteur"
            className="w-full bg-primary/5 border border-surface/10 rounded-lg px-3 py-2 text-sm text-surface"
          />
          <div className="flex gap-2">
            {TONES.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => handleSaveSettings({ tone: t.key })}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${ebook.tone === t.key ? 'bg-primary text-background' : 'bg-primary/5 text-surface/60'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleDownload}
        disabled={downloading || chapters.length === 0}
        className="magnetic-btn inline-flex items-center gap-2 bg-accent text-background px-5 py-3 rounded-full text-sm font-semibold disabled:opacity-50 mb-6"
      >
        <Download className="w-4 h-4" /> {downloading ? 'Génération du PDF...' : 'Exporter en PDF'}
      </button>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      <div className="flex items-center gap-2 text-xs font-semibold text-surface/50 uppercase tracking-wider mb-3">
        <Sparkles className="w-3.5 h-3.5" /> Sommaire
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={chapters.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {chapters.map((chapter, i) => (
              <SortableChapterCard
                key={chapter.id}
                chapter={chapter}
                index={i}
                onGenerate={handleGenerateChapter}
                onUpdate={handleUpdateChapter}
                onDelete={handleDeleteChapter}
                generating={generatingId === chapter.id}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {showAddChapter ? (
        <form onSubmit={handleAddChapter} className="bg-background border border-surface/10 rounded-[1.5rem] p-4 mt-4 space-y-2">
          <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Titre du chapitre" className="w-full bg-primary/5 border border-surface/10 rounded-lg px-3 py-2 text-sm text-surface" />
          <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder="Brief pour ce chapitre" rows={2} className="w-full bg-primary/5 border border-surface/10 rounded-lg px-3 py-2 text-sm text-surface" />
          <div className="flex gap-2">
            <button type="submit" className="text-xs font-semibold text-accent">Ajouter</button>
            <button type="button" onClick={() => setShowAddChapter(false)} className="text-xs text-surface/50 inline-flex items-center gap-1"><X className="w-3 h-3" /> Annuler</button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowAddChapter(true)}
          className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] border border-dashed border-surface/20 text-surface/60 hover:border-accent hover:text-accent transition-colors"
        >
          <Plus className="w-4 h-4" /> Ajouter un chapitre
        </button>
      )}
    </div>
  );
}
