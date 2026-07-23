import React from 'react';
import HeroBlock from './HeroBlock';
import TextBlock from './TextBlock';
import ImageBlock from './ImageBlock';
import FeaturesBlock from './FeaturesBlock';
import TestimonialsBlock from './TestimonialsBlock';
import PricingBlock from './PricingBlock';
import FormBlock from './FormBlock';
import CountdownBlock from './CountdownBlock';
import FaqBlock from './FaqBlock';
import CtaBlock from './CtaBlock';
import QuizBlock from './QuizBlock';
import VideoBlock from './VideoBlock';
import VideoNavBlock from './VideoNavBlock';
import ProcessBlock from './ProcessBlock';
import BonusStackBlock from './BonusStackBlock';
import StatsBlock from './StatsBlock';
import TeamBlock from './TeamBlock';
import LogosBlock from './LogosBlock';
import { getEditableProps, buildDesktopStyleTag, cx } from '../../lib/blockStyle';
import useScrollReveal from '../../lib/useScrollReveal';

const COMPONENTS = {
  hero: HeroBlock,
  text: TextBlock,
  image: ImageBlock,
  features: FeaturesBlock,
  testimonials: TestimonialsBlock,
  pricing: PricingBlock,
  form: FormBlock,
  countdown: CountdownBlock,
  faq: FaqBlock,
  cta: CtaBlock,
  quiz: QuizBlock,
  video: VideoBlock,
  'video-nav': VideoNavBlock,
  process: ProcessBlock,
  'bonus-stack': BonusStackBlock,
  stats: StatsBlock,
  team: TeamBlock,
  logos: LogosBlock,
};

export default function BlockRenderer({
  block, onAdvance, onSubmitLead, onMonerooCheckout, editMode, selectedElement, onSelectElement, onContentChange, userId, defaultBg,
  siblingSteps, onNavigateToStep, currentStepSlug, onGenerateImage, isGeneratingImage,
}) {
  const Component = COMPONENTS[block.type];
  // Reçu depuis FunnelEditorPage lié à un blockId générique ; on le relie ici
  // à CE bloc précis pour que HeroBlock/ImageBlock puissent l'appeler
  // directement au clic sur l'image, sans connaître leur propre id.
  const generateImage = onGenerateImage ? (imageType) => onGenerateImage(block.id, imageType) : undefined;
  const reveal = useScrollReveal(editMode);
  if (!Component) return null;
  const sectionProps = getEditableProps({
    elementKey: 'section',
    kind: 'section',
    styles: block.content?.styles,
    editMode,
    selectedElement,
    onSelectElement,
    label: 'Section',
    blockId: block.id,
  });
  const responsiveCSS = buildDesktopStyleTag(block.id, block.content?.styles);
  return (
    <>
      {responsiveCSS && <style>{responsiveCSS}</style>}
      <div
        ref={reveal.ref}
        data-vk={sectionProps['data-vk']}
        className={cx(sectionProps.className, sectionProps.className ? 'rounded-[2rem]' : undefined, reveal.className)}
        style={sectionProps.style}
        onClick={sectionProps.onClick}
        onClickCapture={editMode ? (e) => e.preventDefault() : undefined}
      >
        <Component
          content={block.content}
          onAdvance={onAdvance}
          onSubmitLead={onSubmitLead}
          onMonerooCheckout={onMonerooCheckout}
          editMode={editMode}
          selectedElement={selectedElement}
          onSelectElement={onSelectElement}
          onContentChange={onContentChange}
          userId={userId}
          defaultBg={defaultBg}
          siblingSteps={siblingSteps}
          onNavigateToStep={onNavigateToStep}
          currentStepSlug={currentStepSlug}
          onGenerateImage={generateImage}
          imageGenerating={isGeneratingImage}
        />
      </div>
    </>
  );
}
