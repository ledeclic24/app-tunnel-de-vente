import React from 'react';

import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import WhoItsFor from '../../components/WhoItsFor';
import Bento from '../../components/Bento';
import Philosophy from '../../components/Philosophy';
import Protocol from '../../components/Protocol';
import Testimonials from '../../components/Testimonials';
import Faq from '../../components/Faq';
import Pricing from '../../components/Pricing';
import CtaBanner from '../../components/CtaBanner';
import Footer from '../../components/Footer';

export default function LandingPage() {
  return (
    <div className="relative w-full bg-background min-h-screen text-surface font-sans selection:bg-accent selection:text-background">
      <div className="noise-overlay" aria-hidden="true"></div>
      <Navbar />
      <main>
        <Hero />
        <WhoItsFor />
        <Bento />
        <Protocol />
        <Philosophy />
        <Testimonials />
        <Faq />
        <Pricing />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
