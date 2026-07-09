import { describe, it, expect } from 'vitest';
import { BLOCK_TYPES, getBlockDef, createDefaultContent } from './blockTypes';

describe('getBlockDef', () => {
  it('finds a block definition by type', () => {
    expect(getBlockDef('hero')?.type).toBe('hero');
  });

  it('returns undefined for an unknown type', () => {
    expect(getBlockDef('not-a-block')).toBeUndefined();
  });
});

describe('createDefaultContent', () => {
  it('returns default content for every registered block type', () => {
    for (const block of BLOCK_TYPES) {
      const content = createDefaultContent(block.type);
      expect(content).toBeTypeOf('object');
      expect(content).not.toBeNull();
    }
  });

  it('returns an empty object for an unknown type', () => {
    expect(createDefaultContent('not-a-block')).toEqual({});
  });
});

describe('plan tiers', () => {
  it('only tags block types as starter or createur', () => {
    for (const block of BLOCK_TYPES) {
      expect(['starter', 'createur']).toContain(block.tier);
    }
  });

  it('keeps the essential blocks on the starter tier', () => {
    const starterTypes = BLOCK_TYPES.filter((b) => b.tier === 'starter').map((b) => b.type);
    expect(starterTypes).toEqual(expect.arrayContaining(['hero', 'text', 'image', 'form', 'cta']));
  });
});
