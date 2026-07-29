import { describe, it, expect } from 'vitest';
import { computeHealthScore } from './healthScore';

function check(result, id) {
  return result.checks.find((c) => c.id === id);
}

describe('computeHealthScore', () => {
  it('with no steps, only checks that require actual content fail (the rest pass vacuously)', () => {
    const result = computeHealthScore([], {});
    expect(check(result, 'conversion-point').passed).toBe(false);
    expect(check(result, 'social-proof').passed).toBe(false);
    expect(check(result, 'urgency').passed).toBe(false);
    expect(check(result, 'objection-handling').passed).toBe(false);
    expect(check(result, 'reassurance').passed).toBe(false);
    expect(check(result, 'no-empty-steps').passed).toBe(true);
    expect(check(result, 'closing-step').passed).toBe(true);
  });

  it('flags a step with no blocks and points at that exact step', () => {
    const steps = [{ id: 's1' }, { id: 's2' }];
    const blocksByStepId = { s1: [{ id: 'b1', type: 'hero', content: { heading: 'Titre' } }], s2: [] };
    const result = computeHealthScore(steps, blocksByStepId);
    const c = check(result, 'no-empty-steps');
    expect(c.passed).toBe(false);
    expect(c.stepId).toBe('s2');
  });

  it('passes conversion-point when a form or cta block exists anywhere', () => {
    const steps = [{ id: 's1' }];
    const blocksByStepId = { s1: [{ id: 'b1', type: 'cta', content: {} }] };
    expect(check(computeHealthScore(steps, blocksByStepId), 'conversion-point').passed).toBe(true);
  });

  it('fails hero-heading when a hero block has an empty heading, and points at it', () => {
    const steps = [{ id: 's1' }];
    const blocksByStepId = { s1: [{ id: 'b1', type: 'hero', content: { heading: '   ' } }] };
    const c = check(computeHealthScore(steps, blocksByStepId), 'hero-heading');
    expect(c.passed).toBe(false);
    expect(c.blockId).toBe('b1');
  });

  it('flags a form still using the default "Envoyer" button text', () => {
    const steps = [{ id: 's1' }];
    const blocksByStepId = { s1: [{ id: 'b1', type: 'form', content: { buttonText: 'Envoyer' } }] };
    expect(check(computeHealthScore(steps, blocksByStepId), 'form-cta-text').passed).toBe(false);
  });

  it('does not penalize form-cta-text when there is no form block at all', () => {
    const steps = [{ id: 's1' }];
    const blocksByStepId = { s1: [{ id: 'b1', type: 'hero', content: {} }] };
    expect(check(computeHealthScore(steps, blocksByStepId), 'form-cta-text').passed).toBe(true);
  });

  it('flags a step with more than two CTA blocks', () => {
    const steps = [{ id: 's1' }];
    const blocksByStepId = { s1: [1, 2, 3].map((n) => ({ id: `b${n}`, type: 'cta', content: {} })) };
    const c = check(computeHealthScore(steps, blocksByStepId), 'cta-not-overloaded');
    expect(c.passed).toBe(false);
    expect(c.stepId).toBe('s1');
  });

  it('passes urgency only when the countdown bar is enabled on a step chrome', () => {
    const steps = [{ id: 's1', chrome: { countdownBar: { enabled: true } } }];
    expect(check(computeHealthScore(steps, { s1: [] }), 'urgency').passed).toBe(true);
    const stepsOff = [{ id: 's1', chrome: null }];
    expect(check(computeHealthScore(stepsOff, { s1: [] }), 'urgency').passed).toBe(false);
  });

  it('reaches a 100% score when every check passes', () => {
    const steps = [{ id: 's1', chrome: { countdownBar: { enabled: true } } }];
    const blocksByStepId = {
      s1: [
        { id: 'hero1', type: 'hero', content: { heading: 'Bienvenue', url: 'https://img', alt: 'texte' } },
        { id: 'form1', type: 'form', content: { buttonText: 'Je réserve ma place' } },
        { id: 'testi1', type: 'testimonials', content: {} },
        { id: 'faq1', type: 'faq', content: {} },
        { id: 'trust1', type: 'trust-badges', content: {} },
        { id: 'cta1', type: 'cta', content: { buttonText: "J'en profite" } },
        { id: 'text1', type: 'text', content: {} },
      ],
    };
    const result = computeHealthScore(steps, blocksByStepId);
    expect(result.score).toBe(100);
    expect(result.checks.every((c) => c.passed)).toBe(true);
  });
});
