export interface DistrictData {
  id: string;
  name: string;
  state: string;
  majorCrop: string;
  defaultNDVI: number;
  defaultEVI: number;
  defaultNDWI: number;
  defaultSAVI: number;
  rainfall: number; // mm
  temperature: number; // °C
  humidity: number; // %
  solarRadiation: number; // MJ/m²
  soilMoisture: number; // %
  soilPH: number;
  soilNitrogen: number; // kg/ha
  soilOrganicCarbon: number; // %
  historicalYield: number; // t/ha
  predictedYield: number; // t/ha
  confidence: number; // %
  healthScore: number; // %
  history: { year: number; yield: number }[];
  ndviTrend: { stage: string; ndvi: number; optimal: number }[];
}

export const DISTRICTS: DistrictData[] = [
  {
    id: 'pilibhit',
    name: 'Pilibhit',
    state: 'Uttar Pradesh (Terai Region)',
    majorCrop: 'Rice / Paddy (PR-126 & Basmati)',
    defaultNDVI: 0.76,
    defaultEVI: 0.58,
    defaultNDWI: 0.34,
    defaultSAVI: 0.62,
    rainfall: 842,
    temperature: 28.4,
    humidity: 78,
    solarRadiation: 19.8,
    soilMoisture: 68,
    soilPH: 6.8,
    soilNitrogen: 245,
    soilOrganicCarbon: 0.78,
    historicalYield: 4.31,
    predictedYield: 4.82,
    confidence: 96.4,
    healthScore: 92,
    history: [
      { year: 2021, yield: 4.02 },
      { year: 2022, yield: 4.15 },
      { year: 2023, yield: 4.28 },
      { year: 2024, yield: 4.21 },
      { year: 2025, yield: 4.31 },
      { year: 2026, yield: 4.82 },
    ],
    ndviTrend: [
      { stage: 'Tillering (Day 25)', ndvi: 0.38, optimal: 0.35 },
      { stage: 'Stem Elongation (Day 45)', ndvi: 0.58, optimal: 0.55 },
      { stage: 'Panicle Initiation (Day 65)', ndvi: 0.74, optimal: 0.72 },
      { stage: 'Flowering & Grain (Day 85)', ndvi: 0.81, optimal: 0.78 },
      { stage: 'Ripening / Golden (Day 110)', ndvi: 0.68, optimal: 0.65 },
    ],
  },
  {
    id: 'chandauli',
    name: 'Chandauli',
    state: 'Uttar Pradesh ("Rice Bowl of UP")',
    majorCrop: 'Rice / Paddy (Sarna & Hybrid 6444)',
    defaultNDVI: 0.82,
    defaultEVI: 0.64,
    defaultNDWI: 0.41,
    defaultSAVI: 0.69,
    rainfall: 915,
    temperature: 29.1,
    humidity: 82,
    solarRadiation: 20.4,
    soilMoisture: 72,
    soilPH: 7.2,
    soilNitrogen: 268,
    soilOrganicCarbon: 0.84,
    historicalYield: 4.55,
    predictedYield: 5.14,
    confidence: 97.8,
    healthScore: 96,
    history: [
      { year: 2021, yield: 4.25 },
      { year: 2022, yield: 4.41 },
      { year: 2023, yield: 4.38 },
      { year: 2024, yield: 4.52 },
      { year: 2025, yield: 4.55 },
      { year: 2026, yield: 5.14 },
    ],
    ndviTrend: [
      { stage: 'Tillering (Day 25)', ndvi: 0.42, optimal: 0.38 },
      { stage: 'Stem Elongation (Day 45)', ndvi: 0.63, optimal: 0.58 },
      { stage: 'Panicle Initiation (Day 65)', ndvi: 0.79, optimal: 0.74 },
      { stage: 'Flowering & Grain (Day 85)', ndvi: 0.86, optimal: 0.80 },
      { stage: 'Ripening / Golden (Day 110)', ndvi: 0.72, optimal: 0.68 },
    ],
  },
  {
    id: 'gorakhpur',
    name: 'Gorakhpur',
    state: 'Uttar Pradesh (Eastern Plains)',
    majorCrop: 'Rice / Paddy (MTU-7029)',
    defaultNDVI: 0.74,
    defaultEVI: 0.55,
    defaultNDWI: 0.36,
    defaultSAVI: 0.59,
    rainfall: 880,
    temperature: 28.8,
    humidity: 80,
    solarRadiation: 19.2,
    soilMoisture: 65,
    soilPH: 7.0,
    soilNitrogen: 232,
    soilOrganicCarbon: 0.72,
    historicalYield: 4.18,
    predictedYield: 4.65,
    confidence: 94.2,
    healthScore: 89,
    history: [
      { year: 2021, yield: 3.90 },
      { year: 2022, yield: 4.05 },
      { year: 2023, yield: 4.12 },
      { year: 2024, yield: 4.10 },
      { year: 2025, yield: 4.18 },
      { year: 2026, yield: 4.65 },
    ],
    ndviTrend: [
      { stage: 'Tillering (Day 25)', ndvi: 0.36, optimal: 0.35 },
      { stage: 'Stem Elongation (Day 45)', ndvi: 0.55, optimal: 0.54 },
      { stage: 'Panicle Initiation (Day 65)', ndvi: 0.72, optimal: 0.71 },
      { stage: 'Flowering & Grain (Day 85)', ndvi: 0.79, optimal: 0.77 },
      { stage: 'Ripening / Golden (Day 110)', ndvi: 0.65, optimal: 0.64 },
    ],
  },
  {
    id: 'lakhimpur_kheri',
    name: 'Lakhimpur Kheri',
    state: 'Uttar Pradesh (Upper Gangetic Plains)',
    majorCrop: 'Rice / Paddy (Sarjoo-52)',
    defaultNDVI: 0.79,
    defaultEVI: 0.61,
    defaultNDWI: 0.39,
    defaultSAVI: 0.65,
    rainfall: 865,
    temperature: 27.9,
    humidity: 76,
    solarRadiation: 20.1,
    soilMoisture: 70,
    soilPH: 6.9,
    soilNitrogen: 255,
    soilOrganicCarbon: 0.81,
    historicalYield: 4.40,
    predictedYield: 4.95,
    confidence: 95.8,
    healthScore: 94,
    history: [
      { year: 2021, yield: 4.10 },
      { year: 2022, yield: 4.22 },
      { year: 2023, yield: 4.35 },
      { year: 2024, yield: 4.31 },
      { year: 2025, yield: 4.40 },
      { year: 2026, yield: 4.95 },
    ],
    ndviTrend: [
      { stage: 'Tillering (Day 25)', ndvi: 0.40, optimal: 0.36 },
      { stage: 'Stem Elongation (Day 45)', ndvi: 0.60, optimal: 0.56 },
      { stage: 'Panicle Initiation (Day 65)', ndvi: 0.76, optimal: 0.73 },
      { stage: 'Flowering & Grain (Day 85)', ndvi: 0.83, optimal: 0.79 },
      { stage: 'Ripening / Golden (Day 110)', ndvi: 0.69, optimal: 0.66 },
    ],
  },
  {
    id: 'azamgarh',
    name: 'Azamgarh',
    state: 'Uttar Pradesh (Purvanchal)',
    majorCrop: 'Rice / Paddy (BPT-5204 / Samba)',
    defaultNDVI: 0.73,
    defaultEVI: 0.54,
    defaultNDWI: 0.32,
    defaultSAVI: 0.58,
    rainfall: 820,
    temperature: 29.5,
    humidity: 74,
    solarRadiation: 21.0,
    soilMoisture: 62,
    soilPH: 7.3,
    soilNitrogen: 220,
    soilOrganicCarbon: 0.69,
    historicalYield: 4.10,
    predictedYield: 4.55,
    confidence: 93.5,
    healthScore: 87,
    history: [
      { year: 2021, yield: 3.85 },
      { year: 2022, yield: 3.98 },
      { year: 2023, yield: 4.02 },
      { year: 2024, yield: 4.05 },
      { year: 2025, yield: 4.10 },
      { year: 2026, yield: 4.55 },
    ],
    ndviTrend: [
      { stage: 'Tillering (Day 25)', ndvi: 0.35, optimal: 0.34 },
      { stage: 'Stem Elongation (Day 45)', ndvi: 0.53, optimal: 0.53 },
      { stage: 'Panicle Initiation (Day 65)', ndvi: 0.70, optimal: 0.70 },
      { stage: 'Flowering & Grain (Day 85)', ndvi: 0.77, optimal: 0.76 },
      { stage: 'Ripening / Golden (Day 110)', ndvi: 0.64, optimal: 0.63 },
    ],
  },
];
