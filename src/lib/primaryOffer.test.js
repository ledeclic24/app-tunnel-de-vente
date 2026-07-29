import { describe, it, expect } from 'vitest';
import { resolvePrimaryOffer, resolveStickyFooterOffer } from './primaryOffer';

const plan = (name, price, hasLink = true) => ({
  name,
  price,
  paymentLinks: hasLink ? [{ method: 'Payer maintenant', url: 'https://pay.example/' + name }] : [],
});

describe('resolvePrimaryOffer', () => {
  it('returns null when the page has no pricing block', () => {
    expect(resolvePrimaryOffer([{ id: 'b1', type: 'hero', content: {} }])).toBeNull();
  });

  it('returns null when no plan has a payment link configured', () => {
    const blocks = [{ id: 'b1', type: 'pricing', content: { plans: [plan('Standard', '10000', false)] } }];
    expect(resolvePrimaryOffer(blocks)).toBeNull();
  });

  it('resolves the single unambiguous offer on the page', () => {
    const blocks = [{ id: 'b1', type: 'pricing', content: { plans: [plan('Standard', '10000')] } }];
    const offer = resolvePrimaryOffer(blocks);
    expect(offer).not.toBeNull();
    expect(offer.blockId).toBe('b1');
    expect(offer.planIndex).toBe(0);
    expect(offer.plan.name).toBe('Standard');
  });

  // Règle produit : une seule offre payable à la fois par tunnel — dès que
  // 2+ offres payables existent sur la page, on refuse de deviner laquelle
  // mettre en avant plutôt que de choisir arbitrairement pour le vendeur.
  it('returns null when several plans on the page are payable (ambiguous)', () => {
    const blocks = [
      { id: 'b1', type: 'pricing', content: { plans: [plan('Standard', '10000'), plan('Premium', '20000')] } },
    ];
    expect(resolvePrimaryOffer(blocks)).toBeNull();
  });

  it('only considers the first payment link of a plan', () => {
    const blocks = [{
      id: 'b1',
      type: 'pricing',
      content: {
        plans: [{
          name: 'Standard',
          paymentLinks: [{ method: 'Payer', url: 'https://a' }, { method: 'Payer', url: 'https://b' }],
        }],
      },
    }];
    expect(resolvePrimaryOffer(blocks).link.url).toBe('https://a');
  });
});

describe('resolveStickyFooterOffer', () => {
  const blocks = [
    { id: 'b1', type: 'pricing', content: { plans: [plan('Standard', '10000'), plan('Premium', '20000')] } },
    { id: 'b2', type: 'hero', content: {} },
  ];

  it('returns null when nothing is referenced yet', () => {
    expect(resolveStickyFooterOffer({}, blocks)).toBeNull();
    expect(resolveStickyFooterOffer(null, blocks)).toBeNull();
  });

  it('resolves the exact referenced plan, never ambiguous even with several payable offers', () => {
    const offer = resolveStickyFooterOffer({ priceBlockId: 'b1', planIndex: 1 }, blocks);
    expect(offer.plan.name).toBe('Premium');
  });

  it('returns null when the referenced block was deleted or is not a pricing block', () => {
    expect(resolveStickyFooterOffer({ priceBlockId: 'gone', planIndex: 0 }, blocks)).toBeNull();
    expect(resolveStickyFooterOffer({ priceBlockId: 'b2', planIndex: 0 }, blocks)).toBeNull();
  });

  it('returns null when the referenced plan has no payment link', () => {
    const noLinkBlocks = [{ id: 'b1', type: 'pricing', content: { plans: [plan('Standard', '10000', false)] } }];
    expect(resolveStickyFooterOffer({ priceBlockId: 'b1', planIndex: 0 }, noLinkBlocks)).toBeNull();
  });
});
