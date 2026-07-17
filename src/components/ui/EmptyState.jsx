import React from 'react';
import { cx } from '../../lib/blockStyle';

// État vide partagé — remplace les traitements ad hoc incohérents d'une
// page à l'autre (certaines pages n'avaient même pas de bordure/icône).
export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cx('flex flex-col items-center text-center py-16 px-6 border border-dashed border-surface/15 rounded-2xl', className)}>
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
          <Icon className="w-5 h-5" />
        </div>
      )}
      {title && <p className="font-sans font-semibold text-surface mb-1">{title}</p>}
      {description && <p className="text-sm text-surface/50 max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
