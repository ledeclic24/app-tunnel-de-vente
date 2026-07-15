import React, { useState } from 'react';
import { ArrowRight, ImagePlus, Upload, Image as LibraryIcon, Wand2 } from 'lucide-react';
import { getButtonStyle, getEditableProps, getContentEditableProps, cx } from '../../lib/blockStyle';
import { uploadImage } from '../../lib/storage';
import SlotList from './SlotList';
import ImagePickerModal from '../app/ImagePickerModal';
import { TUNNEL_IMAGE_TYPES } from './BlockEditorPanel';
import { useToast } from '../app/Toast';

// L'image de Hero reste hors du système d'emplacements dans les deux
// mises en page : en plein cadre (overlay) c'est un arrière-plan absolu,
// pas un élément de flux ; en côte-à-côte (split) elle occupe sa propre
// colonne de grille, pas une position "avant/après" par rapport au
// texte. Seuls les éléments de la colonne de texte (eyebrow, titre,
// sous-titre, bouton, badges de confiance) sont réordonnables entre eux
// et avec des extras insérés.
function buildDefaultSlots(hasTrustBadges) {
  const slots = [
    { id: 'field-eyebrow', kind: 'field', field: 'eyebrow' },
    { id: 'field-heading', kind: 'field', field: 'heading' },
    { id: 'field-subheading', kind: 'field', field: 'subheading' },
    { id: 'field-cta', kind: 'field', field: 'cta' },
  ];
  if (hasTrustBadges) slots.push({ id: 'field-trustBadges', kind: 'field', field: 'trustBadges' });
  return slots;
}

function isSlotsValid(slots, hasTrustBadges) {
  const fieldSlots = slots.filter((s) => s.kind === 'field').map((s) => s.field);
  const expected = ['eyebrow', 'heading', 'subheading', 'cta', ...(hasTrustBadges ? ['trustBadges'] : [])];
  return expected.every((f) => fieldSlots.includes(f)) && fieldSlots.length === expected.length;
}

export default function HeroBlock({ content, onAdvance, editMode, selectedElement, onSelectElement, onContentChange, userId, onGenerateImage, imageGenerating }) {
  const { eyebrow, heading, subheading, imageUrl, ctaText, externalUrl, layout, trustBadges = [], slots } = content;
  const isSplit = layout === 'split';
  // Hero est toujours sombre (bg-primary), quelle que soit sa position —
  // pas de calcul via getSectionBackground ici, donc un objet "bg" de
  // substitution pour que SlotList hérite du bon contraste de texte.
  const heroBg = { headingClassName: 'text-background', bodyClassName: 'text-background/70', isDark: true };
  const editable = (elementKey, kind, label) =>
    getEditableProps({ elementKey, kind, styles: content.styles, editMode, selectedElement, onSelectElement, label });
  const editableText = (field, multiline) => getContentEditableProps({ editMode, onContentChange, content, field, multiline });

  const headingProps = editable('heading', 'text', 'Titre');
  const subheadingProps = editable('subheading', 'text', 'Sous-titre');
  const imageProps = editable('image', 'image', 'Image');
  const buttonProps = editable('button', 'button', 'Bouton');
  const buttonStyle = { ...getButtonStyle(content.style), ...buttonProps.style };

  const [uploading, setUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const toast = useToast();

  const handleImageClick = (e) => {
    imageProps.onClick?.(e);
    if (editMode) setShowMenu((v) => !v);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(userId, file);
      onContentChange?.({ ...content, imageUrl: url });
    } catch (err) {
      toast.error(err.message || "L'image n'a pas pu être importée.");
    }
    setUploading(false);
  };

  const cta = ctaText && (
    externalUrl ? (
      <a
        href={externalUrl}
        target="_blank"
        rel="noreferrer"
        style={buttonStyle}
        className={cx('magnetic-btn btn-fill-slide group relative inline-flex items-center gap-2 bg-accent text-background px-8 py-4 rounded-full text-base font-medium', buttonProps.className)}
        onClick={editMode ? buttonProps.onClick : undefined}
      >
        <span className="relative z-10 outline-none" {...editableText('ctaText')}>{ctaText}</span>
        <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        <div className="fill-layer bg-white/30 rounded-full"></div>
      </a>
    ) : (
      <button
        onClick={editMode ? buttonProps.onClick : onAdvance}
        style={buttonStyle}
        className={cx('magnetic-btn btn-fill-slide group relative inline-flex items-center gap-2 bg-accent text-background px-8 py-4 rounded-full text-base font-medium', buttonProps.className)}
      >
        <span className="relative z-10 outline-none" {...editableText('ctaText')}>{ctaText}</span>
        <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
        <div className="fill-layer bg-white/30 rounded-full"></div>
      </button>
    )
  );

  const imageMenu = editMode && (
    <>
      {showMenu && (
        <div
          className="absolute top-3 right-3 z-30 bg-background border border-surface/10 rounded-xl shadow-lg overflow-hidden min-w-[220px]"
          onClick={(e) => e.stopPropagation()}
        >
          <label
            // Fermeture DIFFÉRÉE du menu (voir EditableItemImage.jsx) :
            // le démonter de façon synchrone dans ce clic empêche le
            // navigateur d'ouvrir le sélecteur de fichier natif sur
            // l'input imbriqué (qui n'existe déjà plus quand il essaie).
            onClick={() => setTimeout(() => setShowMenu(false), 0)}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-surface/80 hover:bg-primary/5 hover:text-accent text-left cursor-pointer"
          >
            <Upload className="w-4 h-4 shrink-0" /> {uploading ? 'Envoi...' : 'Importer depuis mon ordinateur'}
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
          <button
            type="button"
            onClick={() => { setShowMenu(false); setShowPicker(true); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-surface/80 hover:bg-primary/5 hover:text-accent text-left"
          >
            <LibraryIcon className="w-4 h-4 shrink-0" /> Choisir dans ma bibliothèque
          </button>
          {onGenerateImage && (
            <button
              type="button"
              onClick={() => { setShowMenu(false); setShowTypeMenu(true); }}
              disabled={imageGenerating}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-surface/80 hover:bg-primary/5 hover:text-accent text-left disabled:opacity-50"
            >
              <Wand2 className="w-4 h-4 shrink-0" /> {imageGenerating ? 'Génération...' : "Générer avec l'IA"}
            </button>
          )}
        </div>
      )}
      {showTypeMenu && (
        <div
          className="absolute top-3 right-3 z-30 bg-background border border-surface/10 rounded-xl shadow-lg overflow-hidden min-w-[180px]"
          onClick={(e) => e.stopPropagation()}
        >
          {TUNNEL_IMAGE_TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => { setShowTypeMenu(false); onGenerateImage(t.key); }}
              className="w-full text-left px-3 py-2 text-sm text-surface/80 hover:bg-primary/5 hover:text-accent"
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
      <ImagePickerModal
        open={showPicker}
        onClose={() => setShowPicker(false)}
        multiple={false}
        onConfirm={([url]) => onContentChange?.({ ...content, imageUrl: url })}
      />
    </>
  );

  const renderField = (field) => {
    if (field === 'eyebrow') return eyebrow ? (
      <span className="inline-block mb-4 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-mono uppercase tracking-wider">{eyebrow}</span>
    ) : null;
    if (field === 'heading') return (
      <h1
        className={cx('font-sans font-bold text-3xl leading-tight mb-4 outline-none', isSplit ? 'md:text-4xl' : 'md:text-5xl', headingProps.className)}
        style={headingProps.style}
        onClick={headingProps.onClick}
        {...editableText('heading')}
      >
        {heading}
      </h1>
    );
    if (field === 'subheading') return subheading ? (
      <p
        className={cx('text-background/70 text-lg outline-none', isSplit ? 'mb-6' : 'mb-8 max-w-xl', subheadingProps.className)}
        style={subheadingProps.style}
        onClick={subheadingProps.onClick}
        {...editableText('subheading', true)}
      >
        {subheading}
      </p>
    ) : null;
    if (field === 'cta') return cta;
    if (field === 'trustBadges') return trustBadges.length > 0 ? (
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-6 text-xs text-background/60">
        {trustBadges.map((b, i) => <span key={i}>{b}</span>)}
      </div>
    ) : null;
    return null;
  };

  const effectiveSlots = slots && isSlotsValid(slots, isSplit) ? slots : buildDefaultSlots(isSplit);

  const textColumn = (
    <SlotList
      slots={effectiveSlots}
      onSlotsChange={(next) => onContentChange?.({ ...content, slots: next })}
      renderField={renderField}
      bg={heroBg}
      userId={userId}
      styles={content.styles}
      editMode={editMode}
      selectedElement={selectedElement}
      onSelectElement={onSelectElement}
    />
  );

  if (isSplit) {
    return (
      <section className="rounded-[2rem] bg-primary text-background overflow-hidden">
        <div className="grid md:grid-cols-2 items-center">
          <div className="relative group/img aspect-[4/3] md:aspect-auto md:h-full min-h-[280px] bg-primary/60">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                className={cx('w-full h-full object-cover', imageProps.className)}
                style={imageProps.style}
                onClick={handleImageClick}
              />
            ) : (
              editMode && (
                <button type="button" onClick={handleImageClick} className="absolute inset-0 flex items-center justify-center text-background/50 text-sm">
                  <ImagePlus className="w-5 h-5 mr-2" /> {uploading ? 'Import...' : 'Ajouter une image'}
                </button>
              )
            )}
            {imageUrl && editMode && (
              <button
                type="button"
                onClick={handleImageClick}
                className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface/70 text-background text-xs font-medium opacity-0 group-hover/img:opacity-100 transition-opacity"
              >
                <ImagePlus className="w-3.5 h-3.5" /> {uploading ? 'Import...' : "Changer l'image"}
              </button>
            )}
            {imageMenu}
          </div>
          <div className="px-6 py-12 md:px-12 md:py-16">
            {textColumn}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-primary text-background">
      {imageUrl && (
        <div className="absolute inset-0 group/img">
          <img
            src={imageUrl}
            alt=""
            className={cx('w-full h-full object-cover opacity-50', imageProps.className)}
            style={imageProps.style}
            onClick={handleImageClick}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-transparent"></div>
          {editMode && (
            <button
              type="button"
              onClick={handleImageClick}
              className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface/70 text-background text-xs font-medium opacity-0 group-hover/img:opacity-100 transition-opacity"
            >
              <ImagePlus className="w-3.5 h-3.5" /> {uploading ? 'Import...' : "Changer l'image"}
            </button>
          )}
          {imageMenu}
        </div>
      )}
      <div className="relative z-10 px-6 py-16 md:px-16 md:py-24 max-w-3xl">
        {textColumn}
      </div>
    </section>
  );
}
