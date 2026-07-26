import React, { useRef, useState } from 'react';
import { Type, ImagePlus, Rows3, MousePointerClick, X, GripVertical, Upload } from 'lucide-react';
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
import { useToast } from '../app/Toast';

// Remplace BlockExtras.jsx : une section n'est plus "champs fixes puis
// extras ajoutés en bas", mais une liste ordonnée d'emplacements
// (`content.slots`) mêlant champs fixes du bloc (kind:'field', rendus par
// le bloc lui-même via `renderField`) et éléments libres ajoutés par
// glisser-déposer (kind:'text'|'image'|'button'|'container'). Absent par
// défaut (content.slots undefined) → chaque bloc calcule son ordre par
// défaut (DEFAULT_SLOTS), donc aucun changement visuel tant que
// l'utilisateur n'a rien déplacé/inséré — 100% rétrocompatible avec les
// tunnels déjà publiés et les contenus générés par l'IA.
//
// Les conteneurs peuvent eux-mêmes contenir un conteneur (MAX_CONTAINER_DEPTH
// niveaux de profondeur au total) : au-delà, on cesse de proposer/accepter
// "conteneur" comme enfant — une imbrication illimitée devient vite
// ingérable en glisser-déposer, surtout au doigt.
const MAX_CONTAINER_DEPTH = 1;

function newId() {
  return crypto.randomUUID();
}

function newExtra(kind) {
  if (kind === 'container') return { id: newId(), kind: 'container', items: [] };
  if (kind === 'button') return { id: newId(), kind: 'button', label: 'Nouveau bouton', url: '' };
  if (kind === 'text') return { id: newId(), kind: 'text', value: 'Nouveau texte — clique pour modifier' };
  if (kind === 'image') return { id: newId(), kind: 'image', value: '' };
  return null;
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

// Visible au survol (souris) ET dès que l'élément est sélectionné (clic) —
// la seule dépendance au survol rendait la suppression peu découvrable,
// en particulier au doigt sur mobile où "survoler" n'existe pas.
function RemoveButton({ onRemove, isSelected }) {
  if (!onRemove) return null;
  return (
    <button
      type="button"
      onClick={onRemove}
      className={cx(
        'absolute -right-2 -top-2 z-10 w-5 h-5 rounded-full bg-surface/80 text-background flex items-center justify-center transition-opacity',
        isSelected ? 'opacity-100' : 'opacity-0 group-hover/slot:opacity-100',
      )}
      aria-label="Supprimer"
    >
      <X className="w-3 h-3" />
    </button>
  );
}

// Élément texte/image/bouton libre — utilisé aussi bien comme emplacement
// de premier niveau que comme enfant d'un conteneur (à n'importe quel
// niveau d'imbrication).
function ExtraLeaf({ extra, bg, editable, onUpdate, userId, compact }) {
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();
  const kindLabel = extra.kind === 'text' ? 'Texte' : extra.kind === 'button' ? 'Bouton' : 'Image';
  const props = editable(`extra-${extra.id}`, extra.kind === 'button' ? 'button' : extra.kind === 'text' ? 'text' : 'image', kindLabel);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(userId, file);
      onUpdate({ value: url });
    } catch (err) {
      toast.error(err.message || "L'image n'a pas pu être importée.");
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
        onBlur={(e) => onUpdate({ value: e.currentTarget.textContent ?? '' })}
      >
        {extra.value}
      </p>
    );
  }

  if (extra.kind === 'button') {
    return (
      <div className={cx(compact && 'flex-1 min-w-0', 'space-y-1.5')}>
        <span
          className={cx(
            'inline-flex items-center justify-center px-4 py-2 rounded-full font-semibold text-sm outline-none bg-accent text-background',
            props.className,
          )}
          style={props.style}
          onClick={props.onClick}
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onUpdate({ label: e.currentTarget.textContent ?? '' })}
        >
          {extra.label}
        </span>
        <input
          type="text"
          value={extra.url || ''}
          onChange={(e) => onUpdate({ url: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          placeholder="https:// ou /nom-de-page"
          className={cx(
            'block w-full text-xs px-2 py-1 rounded-lg border bg-transparent outline-none',
            bg.isDark ? 'border-background/15 text-background/70 placeholder:text-background/30' : 'border-surface/15 text-surface/70 placeholder:text-surface/30',
          )}
        />
      </div>
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
        <button
          type="button"
          // <label>+<input type=file> ne transfère pas fiablement son clic
          // vers l'input imbriqué dans cette version de React (vérifié
          // empiriquement, voir EditableItemImage.jsx) : on déclenche
          // l'ouverture via la même ref que pour le remplacement d'image
          // existante ci-dessus.
          onClick={() => fileRef.current?.click()}
          className={cx(
            'w-full flex items-center justify-center gap-2 py-8 rounded-xl border border-dashed transition-colors cursor-pointer hover:border-accent hover:text-accent',
            uploading && 'opacity-50 pointer-events-none',
            bg.isDark ? 'border-background/20 text-background/50' : 'border-surface/20 text-surface/50',
          )}
        >
          <Upload className="w-4 h-4" /> {uploading ? 'Envoi...' : 'Choisir une image'}
        </button>
      )}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </>
  );
}

function ContainerChild({ child, bg, editable, userId, onUpdate, onRemove, dragHandleProps, isDragging, depth, selectedElement, onSelectElement, styles, editMode }) {
  const { setNodeRef, transform, transition } = dragHandleProps.sortable;
  const style = { transform: CSS.Transform.toString(transform), transition };
  const elementKey = child.kind === 'container' ? `container-${child.id}` : `extra-${child.id}`;
  const isSelected = selectedElement === elementKey;

  return (
    <div ref={setNodeRef} style={style} className={cx('relative group/slot flex-1 min-w-[140px]', isDragging && 'opacity-50')}>
      <GripHandle dragHandleProps={dragHandleProps.attributes} bg={bg} />
      <RemoveButton onRemove={onRemove} isSelected={isSelected} />
      {child.kind === 'container' ? (
        <ContainerSlot
          container={child}
          bg={bg}
          editable={editable}
          userId={userId}
          onUpdateItems={(items) => onUpdate({ items })}
          onRemoveContainer={onRemove}
          depth={depth}
          selectedElement={selectedElement}
          onSelectElement={onSelectElement}
          styles={styles}
          editMode={editMode}
        />
      ) : (
        <ExtraLeaf extra={child} bg={bg} editable={editable} onUpdate={onUpdate} userId={userId} compact />
      )}
    </div>
  );
}

function SortableContainerChild(props) {
  const { child } = props;
  const sortable = useSortable({ id: child.id });
  return <ContainerChild {...props} dragHandleProps={{ attributes: { ...sortable.attributes, ...sortable.listeners }, sortable }} isDragging={sortable.isDragging} />;
}

// Conteneur : un "groupe" qui range plusieurs extras côte à côte
// (desktop) / empilés (mobile) — peut lui-même contenir un conteneur
// jusqu'à MAX_CONTAINER_DEPTH niveaux. Zone de dépôt propre pour y ajouter
// des enfants, réordonnancement interne indépendant de la liste parente.
function ContainerSlot({ container, bg, editable, userId, onUpdateItems, onRemoveContainer, depth = 0, selectedElement, onSelectElement, styles, editMode }) {
  const [dragOver, setDragOver] = useState(false);
  const toast = useToast();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const canNestContainer = depth < MAX_CONTAINER_DEPTH;
  const elementKey = `container-${container.id}`;

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
        toast.error(err.message || "L'image n'a pas pu être importée.");
      }
      return;
    }
    const kind = e.dataTransfer.getData('application/x-vendeko-extra');
    if (kind === 'container' && !canNestContainer) return;
    const extra = newExtra(kind);
    if (extra) onUpdateItems([...container.items, extra]);
  };

  const containerProps = editable(elementKey, 'card', 'Conteneur');

  return (
    <div
      className={cx('border border-dashed rounded-xl p-3', bg.isDark ? 'border-background/15' : 'border-surface/15', containerProps.className)}
      style={containerProps.style}
      onClick={containerProps.onClick}
    >
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
                  depth={depth + 1}
                  selectedElement={selectedElement}
                  onSelectElement={onSelectElement}
                  styles={styles}
                  editMode={editMode}
                  onUpdate={(patch) => onUpdateItems(container.items.map((c) => (c.id === child.id ? { ...c, ...patch } : c)))}
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
        {container.items.length === 0
          ? `Conteneur vide — glisse un élément ici (texte, image, bouton${canNestContainer ? ', conteneur' : ''})`
          : 'Glisser ici pour ajouter au conteneur'}
      </div>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemoveContainer(); }}
        className={cx('mt-2 text-[11px] underline', bg.isDark ? 'text-background/40 hover:text-background' : 'text-surface/40 hover:text-surface')}
      >
        Supprimer ce conteneur
      </button>
    </div>
  );
}

function SortableSlotItem({ slot, bg, editable, userId, renderField, onUpdateFields, onUpdateContainerItems, onRemove, selectedElement, onSelectElement, styles, editMode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slot.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const dragHandleProps = { ...attributes, ...listeners };
  const elementKey = slot.kind === 'container' ? `container-${slot.id}` : slot.kind !== 'field' ? `extra-${slot.id}` : null;
  const isSelected = elementKey != null && selectedElement === elementKey;

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
        depth={0}
        selectedElement={selectedElement}
        onSelectElement={onSelectElement}
        styles={styles}
        editMode={editMode}
      />
    );
  } else {
    content = <ExtraLeaf extra={slot} bg={bg} editable={editable} onUpdate={onUpdateFields} userId={userId} />;
  }

  if (content == null) return null;

  return (
    <div ref={setNodeRef} style={style} className={cx('relative group/slot', isDragging && 'opacity-50')}>
      <GripHandle dragHandleProps={dragHandleProps} bg={bg} />
      {slot.kind !== 'field' && <RemoveButton onRemove={onRemove} isSelected={isSelected} />}
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
  if (slot.kind === 'button') {
    if (!slot.label) return null;
    const isInternal = slot.url && slot.url.startsWith('/');
    return (
      <a
        href={slot.url || undefined}
        target={isInternal || !slot.url ? undefined : '_blank'}
        rel={isInternal || !slot.url ? undefined : 'noreferrer'}
        className="inline-flex items-center justify-center px-4 py-2 rounded-full font-semibold text-sm bg-accent text-background"
      >
        {slot.label}
      </a>
    );
  }
  if (slot.kind === 'container') {
    return (
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {slot.items.map((child) => (
          <div key={child.id} className="flex-1 min-w-0">
            <SlotReadOnly slot={child} renderField={renderField} bg={bg} />
          </div>
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
      {chip('button', 'Bouton', MousePointerClick)}
      {chip('container', 'Conteneur', Rows3)}
    </div>
  );
}

export default function SlotList({ slots, onSlotsChange, renderField, bg, userId, styles, editMode, selectedElement, onSelectElement }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const toast = useToast();
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
  const updateExtraFields = (id, patch) => onSlotsChange(slots.map((s) => (s.id === id ? { ...s, ...patch } : s)));
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
        toast.error(err.message || "L'image n'a pas pu être importée.");
      }
      return;
    }
    const kind = e.dataTransfer.getData('application/x-vendeko-extra');
    const extra = newExtra(kind);
    if (extra) insertAt(index, extra);
  };

  const insertAtEnd = (kind) => {
    const extra = newExtra(kind);
    if (extra) insertAt(slots.length, extra);
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
                styles={styles}
                editMode={editMode}
                selectedElement={selectedElement}
                onSelectElement={onSelectElement}
                onUpdateFields={(patch) => updateExtraFields(slot.id, patch)}
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
