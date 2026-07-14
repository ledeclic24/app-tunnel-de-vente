import React, { useRef, useState } from 'react';
import { Type, ImagePlus, X, GripVertical, Upload } from 'lucide-react';
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getEditableProps, cx } from '../../lib/blockStyle';
import { uploadImage } from '../../lib/storage';

// Éléments texte/image librement ajoutés par glisser-déposer à la fin
// d'une section, en plus de ses champs fixes (cahier des charges "plus de
// possibilités dans l'éditeur"). Un seul composant, branché en une ligne
// dans chacun des 14 composants de bloc, plutôt que dupliqué partout.
function ExtraItem({ extra, bg, editable, onUpdate, onRemove, userId, dragHandleProps, isDragging }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const props = editable(`extra-${extra.id}`, extra.type === 'text' ? 'text' : 'image', extra.type === 'text' ? 'Texte' : 'Image');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(userId, file);
      onUpdate(url);
    } catch (err) {
      window.alert(err.message || "L'image n'a pas pu être importée.");
    }
    setUploading(false);
  };

  return (
    <div className={cx('relative group/extra', isDragging && 'opacity-50')}>
      <div className="absolute -left-7 top-1/2 -translate-y-1/2 opacity-0 group-hover/extra:opacity-100 transition-opacity">
        <button
          type="button"
          {...dragHandleProps}
          className={cx(
            'p-1 rounded-lg cursor-grab active:cursor-grabbing touch-none',
            bg.isDark ? 'text-background/30 hover:text-background' : 'text-surface/30 hover:text-surface',
          )}
          aria-label="Réordonner cet élément"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute -right-2 -top-2 z-10 w-5 h-5 rounded-full bg-surface/80 text-background flex items-center justify-center opacity-0 group-hover/extra:opacity-100 transition-opacity"
        aria-label="Supprimer cet élément"
      >
        <X className="w-3 h-3" />
      </button>
      {extra.type === 'text' ? (
        <p
          className={cx('outline-none whitespace-pre-line', bg.bodyClassName, props.className)}
          style={props.style}
          onClick={props.onClick}
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onUpdate(e.currentTarget.textContent ?? '')}
        >
          {extra.value}
        </p>
      ) : extra.value ? (
        <img
          src={extra.value}
          alt=""
          loading="lazy"
          className={cx('max-w-full h-auto rounded-xl cursor-pointer', props.className)}
          style={props.style}
          onClick={(e) => { props.onClick?.(e); fileRef.current?.click(); }}
        />
      ) : (
        <label
          className={cx(
            'w-full flex items-center justify-center gap-2 py-8 rounded-xl border border-dashed transition-colors cursor-pointer hover:border-accent hover:text-accent',
            uploading && 'opacity-50 pointer-events-none',
            bg.isDark ? 'border-background/20 text-background/50' : 'border-surface/20 text-surface/50',
          )}
        >
          <Upload className="w-4 h-4" /> {uploading ? 'Envoi...' : 'Choisir une image'}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
      )}
      {extra.type === 'image' && extra.value && <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />}
    </div>
  );
}

function SortableExtraItem(props) {
  const { extra } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: extra.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style}>
      <ExtraItem {...props} dragHandleProps={{ ...attributes, ...listeners }} isDragging={isDragging} />
    </div>
  );
}

export default function BlockExtras({ extras = [], styles, onChange, editMode, selectedElement, onSelectElement, bg, userId }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const editable = (elementKey, kind, label) =>
    getEditableProps({ elementKey, kind, styles, editMode, selectedElement, onSelectElement, label });

  if (!editMode) {
    if (!extras.length) return null;
    return (
      <div className="space-y-4 mt-6">
        {extras.map((extra) => (
          extra.type === 'text' ? (
            <p key={extra.id} className={cx('whitespace-pre-line', bg.bodyClassName)}>{extra.value}</p>
          ) : extra.value ? (
            <img key={extra.id} src={extra.value} alt="" loading="lazy" className="max-w-full h-auto rounded-xl" />
          ) : null
        ))}
      </div>
    );
  }

  const insertExtra = (type, value = '') => {
    const id = crypto.randomUUID();
    onChange([...extras, { id, type, value: value || (type === 'text' ? 'Nouveau texte — clique pour modifier' : '') }]);
  };

  const updateExtra = (id, value) => onChange(extras.map((x) => (x.id === id ? { ...x, value } : x)));
  const removeExtra = (id) => onChange(extras.filter((x) => x.id !== id));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = extras.findIndex((x) => x.id === active.id);
    const newIndex = extras.findIndex((x) => x.id === over.id);
    onChange(arrayMove(extras, oldIndex, newIndex));
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files?.length > 0) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) return;
      setUploading(true);
      try {
        const url = await uploadImage(userId, file);
        insertExtra('image', url);
      } catch (err) {
        window.alert(err.message || "L'image n'a pas pu être importée.");
      }
      setUploading(false);
      return;
    }
    const type = e.dataTransfer.getData('application/x-vendeko-extra');
    if (type === 'text' || type === 'image') insertExtra(type);
  };

  return (
    <div className="mt-6 space-y-4" onClick={(e) => e.stopPropagation()}>
      {extras.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={extras.map((x) => x.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4 pl-7">
              {extras.map((extra) => (
                <SortableExtraItem
                  key={extra.id}
                  extra={extra}
                  bg={bg}
                  editable={editable}
                  onUpdate={(value) => updateExtra(extra.id, value)}
                  onRemove={() => removeExtra(extra.id)}
                  userId={userId}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cx(
          'flex flex-wrap items-center justify-center gap-2 py-3 px-3 rounded-xl border border-dashed transition-colors text-xs',
          dragOver
            ? 'border-accent text-accent bg-accent/5'
            : bg.isDark ? 'border-background/15 text-background/40' : 'border-surface/15 text-surface/40',
        )}
      >
        {uploading ? (
          <span>Envoi de l&apos;image...</span>
        ) : (
          <>
            <span>Glisse ou clique pour ajouter :</span>
            <button
              type="button"
              draggable
              onDragStart={(e) => e.dataTransfer.setData('application/x-vendeko-extra', 'text')}
              onClick={() => insertExtra('text')}
              className={cx(
                'flex items-center gap-1 px-2.5 py-1 rounded-full border cursor-grab active:cursor-grabbing transition-colors hover:border-accent hover:text-accent',
                bg.isDark ? 'border-background/15 text-background/60' : 'border-surface/15 text-surface/60',
              )}
            >
              <Type className="w-3 h-3" /> Texte
            </button>
            <button
              type="button"
              draggable
              onDragStart={(e) => e.dataTransfer.setData('application/x-vendeko-extra', 'image')}
              onClick={() => insertExtra('image')}
              className={cx(
                'flex items-center gap-1 px-2.5 py-1 rounded-full border cursor-grab active:cursor-grabbing transition-colors hover:border-accent hover:text-accent',
                bg.isDark ? 'border-background/15 text-background/60' : 'border-surface/15 text-surface/60',
              )}
            >
              <ImagePlus className="w-3 h-3" /> Image
            </button>
          </>
        )}
      </div>
    </div>
  );
}
