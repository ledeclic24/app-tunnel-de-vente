import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-primary text-background rounded-t-[4rem] pt-20 pb-10 px-6 md:px-16 mt-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 relative z-10">

        {/* Brand & Status */}
        <div className="md:col-span-2 flex flex-col items-start">
          <h2 className="text-3xl font-sans font-bold mb-4">Vendeko</h2>
          <p className="text-background/60 text-sm max-w-sm mb-8">
            Crée un tunnel de vente complet en quelques minutes, même si tu n'as jamais vendu en ligne.
          </p>

          <div className="flex items-center gap-3 bg-background/5 px-4 py-2 rounded-full border border-background/10">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="font-mono text-xs text-background/80 tracking-widest uppercase">Système Opérationnel</span>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="font-sans font-semibold mb-6 text-accent">Produit</h4>
          <ul className="space-y-3">
            <li><a href="#features" className="text-background/60 hover:text-background transition-colors text-sm">Fonctionnalités</a></li>
            <li><a href="#philosophy" className="text-background/60 hover:text-background transition-colors text-sm">Philosophie</a></li>
            <li><a href="#protocol" className="text-background/60 hover:text-background transition-colors text-sm">Protocole</a></li>
            <li><a href="#pricing" className="text-background/60 hover:text-background transition-colors text-sm">Tarifs</a></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-sans font-semibold mb-6 text-accent">Légal</h4>
          <ul className="space-y-3">
            <li><a href="#" className="text-background/60 hover:text-background transition-colors text-sm">Mentions légales</a></li>
            <li><a href="#" className="text-background/60 hover:text-background transition-colors text-sm">Politique de confidentialité</a></li>
            <li><a href="#" className="text-background/60 hover:text-background transition-colors text-sm">CGV</a></li>
            <li><a href="#" className="text-background/60 hover:text-background transition-colors text-sm">Contact</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-background/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 relative z-10 text-xs text-background/40">
        <p>© {new Date().getFullYear()} Vendeko. Tous droits réservés.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-background transition-colors">LinkedIn</a>
          <a href="#" className="hover:text-background transition-colors">Instagram</a>
        </div>
      </div>
    </footer>
  );
}
