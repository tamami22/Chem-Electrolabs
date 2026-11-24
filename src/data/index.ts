/**
 * Chem-ElectroLabs - Data Barrel Export
 */

import standardPotentialsData from './standard-potentials.json';
import saltsData from './salts.json';
import type { StandardPotential, SaltSolution } from './types.ts';

export const standardPotentials: StandardPotential[] = standardPotentialsData as StandardPotential[];
export const salts: SaltSolution[] = saltsData as SaltSolution[];

export * from './types.ts';

