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

export default function BlockRenderer({ block, onAdvance, onSubmitLead }) {
  const Component = COMPONENTS[block.type];
  if (!Component) return null;
  return <Component content={block.content} onAdvance={onAdvance} onSubmitLead={onSubmitLead} />;
}
