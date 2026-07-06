import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-6 relative overflow-hidden">
      <div className="noise-overlay" aria-hidden="true"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(123,97,255,0.15),transparent_50%)]"></div>

      <div className="relative z-10 w-full max-w-md">
        <Link to="/" className="flex justify-center mb-8 font-sans font-bold text-2xl text-background">
          Vendeko
        </Link>

        <div className="bg-background rounded-[2rem] shadow-2xl border border-surface/10 p-8 md:p-10">
          <h1 className="text-2xl font-sans font-bold text-surface mb-1">{title}</h1>
          {subtitle && <p className="text-surface/60 text-sm mb-8">{subtitle}</p>}
          {children}
        </div>

        {footer && <div className="text-center mt-6 text-sm text-background/60">{footer}</div>}
      </div>
    </div>
  );
}
