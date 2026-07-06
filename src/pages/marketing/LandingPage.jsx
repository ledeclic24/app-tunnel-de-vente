import React from 'react';

import Navbar from '../../components/Navbar';
import Hero from '../../components/Hero';
import Features from '../../components/Features';
import Philosophy from '../../components/Philosophy';
import Protocol from '../../components/Protocol';
import Pricing from '../../components/Pricing';
import Footer from '../../components/Footer';

export default function LandingPage() {
  return (
    <div className="relative w-full bg-background min-h-screen text-surface font-sans selection:bg-accent selection:text-background">
      <div className="noise-overlay" aria-hidden="true"></div>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Philosophy />
        <Protocol />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
