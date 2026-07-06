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
import { getEditableProps } from '../../lib/blockStyle';

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
};

export default function BlockRenderer({ block, onAdvance, onSubmitLead, editMode, selectedElement, onSelectElement }) {
  const Component = COMPONENTS[block.type];
  if (!Component) return null;
  const sectionProps = getEditableProps({
    elementKey: 'section',
    kind: 'card',
    styles: block.content?.styles,
    editMode,
    selectedElement,
    onSelectElement,
    label: 'Section',
  });
  return (
    <div
      className={sectionProps.className ? `${sectionProps.className} rounded-[2rem]` : undefined}
      style={sectionProps.style}
      onClick={sectionProps.onClick}
      onClickCapture={editMode ? (e) => e.preventDefault() : undefined}
    >
      <Component
        content={block.content}
        onAdvance={onAdvance}
        onSubmitLead={onSubmitLead}
        editMode={editMode}
        selectedElement={selectedElement}
        onSelectElement={onSelectElement}
      />
    </div>
  );
}
