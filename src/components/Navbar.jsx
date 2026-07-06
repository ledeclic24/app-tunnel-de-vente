import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth() || {};

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50 transition-all duration-300
      ${scrolled ? 'bg-background/90 backdrop-blur-lg border-b border-surface/10' : 'bg-transparent border-b border-transparent'}
    `}>
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-sans font-bold text-lg text-surface">
          <span className="w-7 h-7 rounded-lg gradient-accent flex items-center justify-center text-background text-sm">V</span>
          Vendeko
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-surface/70">
          <a href="#produit" className="hover:text-surface transition-colors">Produit</a>
          <a href="#comment-ca-marche" className="hover:text-surface transition-colors">Comment ça marche</a>
          <a href="#pricing" className="hover:text-surface transition-colors">Tarifs</a>
        </div>
        <div className="flex items-center gap-4">
          {!user && (
            <Link to="/connexion" className="hidden md:inline-block text-sm font-medium text-surface/70 hover:text-surface transition-colors">
              Connexion
            </Link>
          )}
          <Link
            to={user ? '/app' : '/inscription'}
            className="group inline-flex items-center gap-2 bg-surface text-background px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary transition-colors"
          >
            {user ? 'Tableau de bord' : 'Essayer gratuitement'}
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
