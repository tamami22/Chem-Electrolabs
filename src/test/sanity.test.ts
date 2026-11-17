import { describe, it, expect } from 'vitest';
import { standardPotentials, salts } from '../data/index.ts';
import { modules, glossary } from '../content/index.ts';

describe('Sanity & Environment Tests', () => {
  it('loads scientific data correctly', () => {
    expect(standardPotentials.length).toBeGreaterThan(0);
    expect(salts.length).toBe(14);
  });

  it('loads content modules and glossary', () => {
    expect(modules.length).toBe(5);
    expect(glossary.length).toBe(20);
  });

  it('verifies standard cell calculation for Zn-Cu Daniell cell', () => {
    const zn = standardPotentials.find((p) => p.id === 'zn');
    const cu = standardPotentials.find((p) => p.id === 'cu');
    expect(zn).toBeDefined();
    expect(cu).toBeDefined();
    if (zn && cu) {
      const eCell = cu.standardPotential - zn.standardPotential;
      expect(Number(eCell.toFixed(2))).toBe(1.10);
    }
  });
});

