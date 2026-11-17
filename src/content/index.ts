/**
 * Chem-ElectroLabs - Content Barrel Export
 */

import modul1Data from './modul-1.json';
import modul2Data from './modul-2.json';
import modul3Data from './modul-3.json';
import modul4Data from './modul-4.json';
import modul5Data from './modul-5.json';
import glossaryData from './glossary.json';
import type { ModuleContent, GlossaryTerm } from './types.ts';

export const modul1: ModuleContent = modul1Data as ModuleContent;
export const modul2: ModuleContent = modul2Data as ModuleContent;
export const modul3: ModuleContent = modul3Data as ModuleContent;
export const modul4: ModuleContent = modul4Data as ModuleContent;
export const modul5: ModuleContent = modul5Data as ModuleContent;

export const modules: ModuleContent[] = [
  modul1,
  modul2,
  modul3,
  modul4,
  modul5
];

export const glossary: GlossaryTerm[] = glossaryData as unknown as GlossaryTerm[];

export * from './types.ts';
