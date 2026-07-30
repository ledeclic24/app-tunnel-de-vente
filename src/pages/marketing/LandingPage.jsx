import React from 'react';

import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import WhoItsFor from '../../components/WhoItsFor';
import TemplateShowcase from '../../components/TemplateShowcase';
import Bento from '../../components/Bento';
import Philosophy from '../../components/Philosophy';
import Protocol from '../../components/Protocol';
import Comparison from '../../components/Comparison';
import Testimonials from '../../components/Testimonials';
import Faq from '../../components/Faq';
import TrustBar from '../../components/TrustBar';
import Pricing from '../../components/Pricing';
import CtaBanner from '../../components/CtaBanner';
import Footer from '../../components/Footer';
import SocialProofToast from '../../components/SocialProofToast';
import StickyMobileCta from '../../components/StickyMobileCta';

export default function LandingPage() {
  return (
    <div className="relative w-full bg-background min-h-screen text-surface font-sans selection:bg-accent selection:text-background">
      <div className="noise-overlay" aria-hidden="true"></div>
      <Navbar />
      <main>
        <Hero />
        <WhoItsFor />
        <TemplateShowcase />
        <Bento />
        <Protocol />
        <Philosophy />
        <Comparison />
        <Testimonials />
        <Faq />
        <TrustBar />
        <Pricing />
        <CtaBanner />
      </main>
      <Footer />
      <SocialProofToast />
      <StickyMobileCta />
    </div>
  );
}
