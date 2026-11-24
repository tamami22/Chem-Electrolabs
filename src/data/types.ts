/**
 * Chem-ElectroLabs - Data Types
 * Definisi tipe data saintifik untuk potensial elektrode standar dan larutan garam.
 */

export interface StandardPotential {
  id: string;
  symbol: string;
  name: string;
  atomicNumber?: number;
  molarMass?: number;
  standardPotential: number; // Nilai E° dalam Volt (V) pada 298.15 K, 1 atm, 1 M
  ion: string;
  ionCharge: number;
  electrons: number;
  halfReactionReduction: string;
  halfReactionOxidation: string;
  isVoltaElectrode: boolean;
  colorHex: string;
  macroscopicVisual: string;
  notes?: string;
}

export interface Ion {
  formula: string;
  name: string;
  charge: number;
}

export type SaltCategory = 'volta' | 'salt_bridge' | 'electrolysis';

export interface SaltSolution {
  id: string;
  formula: string;
  name: string;
  formattedFormula: string;
  cation: Ion;
  anion: Ion;
  /**
   * Referensi ke ID spesi logam/kation pada standard-potentials.json.
   * Catatan penting: Pada larutan kation logam aktif (seperti Na+ pada NaCl/Na2SO4 atau K+ pada KI),
   * relatedMetalId hanyalah metadata referensi data saintifik, BUKAN penentu produk reaksi di katoda.
   * Pada elektrolisis larutan berair kation golongan IA/IIA/Al/Mn, molekul air (H2O) yang tereduksi menjadi gas H2.
   */
  relatedMetalId?: string | null;
  solutionColor: string; // CSS color representation
  colorDescription: string;
  category: SaltCategory[];
  description: string;
}

