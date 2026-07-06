import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth() || {};

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-500">
      <nav className={`
        flex items-center justify-between px-6 py-3 rounded-[2rem] w-full max-w-4xl transition-all duration-500
        ${scrolled
          ? 'bg-background/80 backdrop-blur-xl border border-surface/10 shadow-lg text-surface'
          : 'bg-transparent text-background'}
      `}>
        <Link to="/" className="font-sans font-bold tracking-tight text-xl">
          Vendeko
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#features" className="hover-lift hover:text-accent transition-colors duration-300 inline-block">Fonctionnalités</a>
          <a href="#philosophy" className="hover-lift hover:text-accent transition-colors duration-300 inline-block">Philosophie</a>
          <a href="#protocol" className="hover-lift hover:text-accent transition-colors duration-300 inline-block">Protocole</a>
          <a href="#pricing" className="hover-lift hover:text-accent transition-colors duration-300 inline-block">Tarifs</a>
        </div>
        <div className="flex items-center gap-4">
          {!user && (
            <Link to="/connexion" className="hidden md:inline-block hover-lift text-sm font-medium hover:text-accent transition-colors duration-300">
              Connexion
            </Link>
          )}
          <Link
            to={user ? '/app' : '/inscription'}
            className={`
              magnetic-btn btn-fill-slide group relative px-5 py-2 rounded-full text-sm font-semibold transition-colors duration-300
              ${scrolled ? 'bg-accent text-background' : 'bg-background text-primary'}
            `}
          >
            <span className="relative z-10 flex items-center gap-2">
              {user ? 'Tableau de bord' : 'Essayer gratuitement'}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="fill-layer bg-white/20"></div>
          </Link>
        </div>
      </nav>
    </div>
  );
}
