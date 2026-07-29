import { useEffect, useRef } from 'react';

// Ferme un menu déroulant au clic en dehors de son conteneur (bouton +
// panneau, tous deux à l'intérieur du même ref) — écouteur uniquement
// actif tant que le menu est ouvert, pour ne pas alourdir chaque clic de
// la page quand rien n'est déplié. Avant ce hook, aucun menu de l'appli
// ne se refermait au clic ailleurs (ni même en ouvrant un AUTRE menu à
// côté), ce qui laissait plusieurs panneaux ouverts en même temps.
export function useClickOutside(enabled, onClose) {
  const ref = useRef(null);
  useEffect(() => {
    if (!enabled) return undefined;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [enabled, onClose]);
  return ref;
}
