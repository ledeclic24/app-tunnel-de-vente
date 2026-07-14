import React, { useRef, useState } from 'react';
import { Type, ImagePlus, Rows3, X, GripVertical, Upload } from 'lucide-react';
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable,
  verticalListSortingStrategy, horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getEditableProps, cx } from '../../lib/blockStyle';
import { uploadImage } from '../../lib/storage';

// Remplace BlockExtras.jsx : une section n'est plus "champs fixes puis
// extras ajoutés en bas", mais une liste ordonnée d'emplacements
// (`content.slots`) mêlant champs fixes du bloc (kind:'field', rendus par
// le bloc lui-même via `renderField`) et éléments libres ajoutés par
// glisser-déposer (kind:'text'|'image'|'container'). Absent par défaut
// (content.slots undefined) → chaque bloc calcule son ordre par défaut
// (DEFAULT_SLOTS), donc aucun changement visuel tant que l'utilisateur
// n'a rien déplacé/inséré — 100% rétrocompatible avec les tunnels déjà
// publiés et les contenus générés par l'IA.
function newId() {
  return crypto.randomUUID();
}

function GripHandle({ dragHandleProps, bg }) {
  if (!dragHandleProps) return null;
  return (
    <div className="absolute -left-7 top-1/2 -translate-y-1/2 opacity-0 group-hover/slot:opacity-100 transition-opacity">
      <button
        type="button"
        {...dragHandleProps}
        className={cx(
          'p-1 rounded-lg cursor-grab active:cursor-grabbing touch-none',
          bg.isDark ? 'text-background/30 hover:text-background' : 'text-surface/30 hover:text-surface',
        )}
        aria-label="Réordonner"
      >
        <GripVertical className="w-4 h-4" />
      </button>
    </div>
  );
}

function RemoveButton({ onRemove }) {
  if (!onRemove) return null;
  return (
    <button
      type="button"
      onClick={onRemove}
      className="absolute -right-2 -top-2 z-10 w-5 h-5 rounded-full bg-surface/80 text-background flex items-center justify-center opacity-0 group-hover/slot:opacity-100 transition-opacity"
      aria-label="Supprimer"
    >
      <X className="w-3 h-3" />
    </button>
  );
}

// Élément texte/image libre — utilisé aussi bien comme emplacement de
// premier niveau que comme enfant d'un conteneur.
function ExtraLeaf({ extra, bg, editable, onUpdate, userId, compact }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const props = editable(`extra-${extra.id}`, extra.kind === 'text' ? 'text' : 'image', extra.kind === 'text' ? 'Texte' : 'Image');

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

  if (extra.kind === 'text') {
    return (
      <p
        className={cx('outline-none whitespace-pre-line', compact && 'flex-1 min-w-0', bg.bodyClassName, props.className)}
        style={props.style}
        onClick={props.onClick}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => onUpdate(e.currentTarget.textContent ?? '')}
      >
        {extra.value}
      </p>
    );
  }
  return (
    <>
      {extra.value ? (
        <img
          src={extra.value}
          alt=""
          loading="lazy"
          className={cx('max-w-full h-auto rounded-xl cursor-pointer', compact && 'flex-1 min-w-0', props.className)}
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
      {/* Dédié au clic sur une image déjà présente (ci-dessus) : preventDefault
          y est nécessaire pour la sélection d'élément, ce qui empêcherait le
          transfert de clic natif d'un <label> vers son input — on garde donc
          un input séparé déclenché via ref pour ce seul cas. */}
      {extra.value && <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />}
    </>
  );
}

function ContainerChild({ child, bg, editable, userId, onUpdate, onRemove, dragHandleProps, isDragging }) {
  const { setNodeRef, transform, transition } = dragHandleProps.sortable;
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className={cx('relative group/slot flex-1 min-w-[140px]', isDragging && 'opacity-50')}>
      <GripHandle dragHandleProps={dragHandleProps.attributes} bg={bg} />
      <RemoveButton onRemove={onRemove} />
      <ExtraLeaf extra={child} bg={bg} editable={editable} onUpdate={onUpdate} userId={userId} compact />
    </div>
  );
}

function SortableContainerChild(props) {
  const { child } = props;
  const sortable = useSortable({ id: child.id });
  return <ContainerChild {...props} dragHandleProps={{ attributes: { ...sortable.attributes, ...sortable.listeners }, sortable }} isDragging={sortable.isDragging} />;
}

// Conteneur : un "groupe" qui range plusieurs extras côte à côte
// (desktop) / empilés (mobile). Zone de dépôt propre pour y ajouter des
// enfants, réordonnancement interne indépendant de la liste parente.
function ContainerSlot({ container, bg, editable, userId, onUpdateItems, onRemoveContainer }) {
  const [dragOver, setDragOver] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = container.items.findIndex((x) => x.id === active.id);
    const newIndex = container.items.findIndex((x) => x.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onUpdateItems(arrayMove(container.items, oldIndex, newIndex));
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files?.length > 0) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) return;
      try {
        const url = await uploadImage(userId, file);
        onUpdateItems([...container.items, { id: newId(), kind: 'image', value: url }]);
      } catch (err) {
        window.alert(err.message || "L'image n'a pas pu être importée.");
      }
      return;
    }
    const kind = e.dataTransfer.getData('application/x-vendeko-extra');
    if (kind === 'text' || kind === 'image') {
      onUpdateItems([...container.items, { id: newId(), kind, value: kind === 'text' ? 'Nouveau texte — clique pour modifier' : '' }]);
    }
  };

  return (
    <div className={cx('border border-dashed rounded-xl p-3', bg.isDark ? 'border-background/15' : 'border-surface/15')}>
      {container.items.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={container.items.map((x) => x.id)} strategy={horizontalListSortingStrategy}>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {container.items.map((child) => (
                <SortableContainerChild
                  key={child.id}
                  child={child}
                  bg={bg}
                  editable={editable}
                  userId={userId}
                  onUpdate={(value) => onUpdateItems(container.items.map((c) => (c.id === child.id ? { ...c, value } : c)))}
                  onRemove={() => onUpdateItems(container.items.filter((c) => c.id !== child.id))}
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
          'py-2 rounded-lg border border-dashed text-center text-[11px] transition-colors',
          container.items.length > 0 && 'mt-3',
          dragOver ? 'border-accent text-accent bg-accent/5' : (bg.isDark ? 'border-background/10 text-background/30' : 'border-surface/10 text-surface/30'),
        )}
      >
        {container.items.length === 0 ? 'Conteneur vide — glisse un élément texte ou image ici' : 'Glisser ici pour ajouter au conteneur'}
      </div>
      <button
        type="button"
        onClick={onRemoveContainer}
        className={cx('mt-2 text-[11px] underline', bg.isDark ? 'text-background/40 hover:text-background' : 'text-surface/40 hover:text-surface')}
      >
        Supprimer ce conteneur
      </button>
    </div>
  );
}

function SortableSlotItem({ slot, bg, editable, userId, renderField, onUpdateValue, onUpdateContainerItems, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slot.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const dragHandleProps = { ...attributes, ...listeners };

  let content;
  if (slot.kind === 'field') {
    content = renderField(slot.field);
  } else if (slot.kind === 'container') {
    content = (
      <ContainerSlot
        container={slot}
        bg={bg}
        editable={editable}
        userId={userId}
        onUpdateItems={onUpdateContainerItems}
        onRemoveContainer={onRemove}
      />
    );
  } else {
    content = <ExtraLeaf extra={slot} bg={bg} editable={editable} onUpdate={onUpdateValue} userId={userId} />;
  }

  if (content == null) return null;

  return (
    <div ref={setNodeRef} style={style} className={cx('relative group/slot', isDragging && 'opacity-50')}>
      <GripHandle dragHandleProps={dragHandleProps} bg={bg} />
      {slot.kind !== 'field' && <RemoveButton onRemove={onRemove} />}
      {content}
    </div>
  );
}

// Exporté pour que les blocs qui appliquent leur propre classe de
// wrapper en lecture seule (grille, lignes...) puissent réutiliser le
// même rendu d'emplacement sans le dupliquer.
export function SlotReadOnly({ slot, renderField, bg }) {
  if (slot.kind === 'field') return renderField(slot.field);
  if (slot.kind === 'text') return slot.value ? <p className={cx('whitespace-pre-line', bg.bodyClassName)}>{slot.value}</p> : null;
  if (slot.kind === 'image') return slot.value ? <img src={slot.value} alt="" loading="lazy" className="max-w-full h-auto rounded-xl" /> : null;
  if (slot.kind === 'container') {
    return (
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {slot.items.map((child) => (
          child.kind === 'text' ? (
            child.value && <p key={child.id} className={cx('whitespace-pre-line flex-1 min-w-0', bg.bodyClassName)}>{child.value}</p>
          ) : (
            child.value && <img key={child.id} src={child.value} alt="" loading="lazy" className="flex-1 min-w-0 max-w-full h-auto rounded-xl" />
          )
        ))}
      </div>
    );
  }
  return null;
}

function Gap({ onDrop, bg }) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { setOver(false); onDrop(e); }}
      className={cx('h-2 -my-1 rounded transition-all', over && (bg.isDark ? 'bg-background/20' : 'bg-accent/30') && 'h-4')}
    />
  );
}

function Palette({ bg, onInsert }) {
  const chip = (kind, label, Icon) => (
    <button
      type="button"
      draggable
      onDragStart={(e) => e.dataTransfer.setData('application/x-vendeko-extra', kind)}
      onClick={() => onInsert(kind)}
      className={cx(
        'flex items-center gap-1 px-2.5 py-1 rounded-full border cursor-grab active:cursor-grabbing transition-colors hover:border-accent hover:text-accent',
        bg.isDark ? 'border-background/15 text-background/60' : 'border-surface/15 text-surface/60',
      )}
    >
      <Icon className="w-3 h-3" /> {label}
    </button>
  );

  return (
    <div
      className={cx(
        'flex flex-wrap items-center justify-center gap-2 py-3 px-3 rounded-xl border border-dashed text-xs mt-2',
        bg.isDark ? 'border-background/15 text-background/40' : 'border-surface/15 text-surface/40',
      )}
    >
      <span>Glisse un élément à l&apos;endroit voulu, ou clique pour l&apos;ajouter en fin de section :</span>
      {chip('text', 'Texte', Type)}
      {chip('image', 'Image', ImagePlus)}
      {chip('container', 'Conteneur', Rows3)}
    </div>
  );
}

export default function SlotList({ slots, onSlotsChange, renderField, bg, userId, styles, editMode, selectedElement, onSelectElement }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const editable = (elementKey, kind, label) =>
    getEditableProps({ elementKey, kind, styles, editMode, selectedElement, onSelectElement, label });

  if (!editMode) {
    return (
      <>
        {slots.map((slot) => <SlotReadOnly key={slot.id} slot={slot} renderField={renderField} bg={bg} />)}
      </>
    );
  }

  const insertAt = (index, slot) => {
    const next = [...slots];
    next.splice(index, 0, slot);
    onSlotsChange(next);
  };
  const removeSlot = (id) => onSlotsChange(slots.filter((s) => s.id !== id));
  const updateExtraValue = (id, value) => onSlotsChange(slots.map((s) => (s.id === id ? { ...s, value } : s)));
  const updateContainerItems = (id, items) => onSlotsChange(slots.map((s) => (s.id === id ? { ...s, items } : s)));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = slots.findIndex((s) => s.id === active.id);
    const newIndex = slots.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onSlotsChange(arrayMove(slots, oldIndex, newIndex));
  };

  const handleGapDrop = async (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files?.length > 0) {
      const file = e.dataTransfer.files[0];
      if (!file.type.startsWith('image/')) return;
      try {
        const url = await uploadImage(userId, file);
        insertAt(index, { id: newId(), kind: 'image', value: url });
      } catch (err) {
        window.alert(err.message || "L'image n'a pas pu être importée.");
      }
      return;
    }
    const kind = e.dataTransfer.getData('application/x-vendeko-extra');
    if (kind === 'text' || kind === 'image') {
      insertAt(index, { id: newId(), kind, value: kind === 'text' ? 'Nouveau texte — clique pour modifier' : '' });
    } else if (kind === 'container') {
      insertAt(index, { id: newId(), kind: 'container', items: [] });
    }
  };

  const insertAtEnd = (kind) => {
    if (kind === 'container') insertAt(slots.length, { id: newId(), kind: 'container', items: [] });
    else insertAt(slots.length, { id: newId(), kind, value: kind === 'text' ? 'Nouveau texte — clique pour modifier' : '' });
  };

  return (
    <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={slots.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <Gap bg={bg} onDrop={(e) => handleGapDrop(0, e)} />
          {slots.map((slot, i) => (
            <React.Fragment key={slot.id}>
              <SortableSlotItem
                slot={slot}
                bg={bg}
                editable={editable}
                userId={userId}
                renderField={renderField}
                onUpdateValue={(value) => updateExtraValue(slot.id, value)}
                onUpdateContainerItems={(items) => updateContainerItems(slot.id, items)}
                onRemove={slot.kind !== 'field' ? () => removeSlot(slot.id) : undefined}
              />
              <Gap bg={bg} onDrop={(e) => handleGapDrop(i + 1, e)} />
            </React.Fragment>
          ))}
        </SortableContext>
      </DndContext>
      <Palette bg={bg} onInsert={insertAtEnd} />
    </div>
  );
}
