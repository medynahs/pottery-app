import { PREVIEW } from './recipes';
import type { DiscoverInspiration } from './types';

export const DISCOVER_INSPIRATIONS: DiscoverInspiration[] = [
  {
    id: 'combo-green-tea-alabaster',
    title: 'Green Tea over Alabaster',
    description:
      'Soft celadon-green break over a warm white base. Works on stoneware and buff clays — Green Tea pools slightly in texture.',
    applicationNotes:
      'Brush 2× Alabaster on the full piece. When dry, brush 2× Green Tea on the body and rim. Wipe the foot clean before firing cone 5–6.',
    cone: 'cone-6',
    coneLabel: 'Cone 5–6',
    colorFamily: 'green',
    finish: 'glossy',
    colorHex: '#A8CBB7',
    previewUri: PREVIEW.green,
    products: [
      { brand: 'Amaco', name: 'Alabaster', role: 'base', layers: 2, method: 'brush' },
      { brand: 'Amaco', name: 'Green Tea', role: 'accent', layers: 2, method: 'brush' },
    ],
  },
  {
    id: 'inspo-honey-rose-quartz',
    title: 'Honey Flux over Rose Quartz',
    description:
      'Warm amber break over a soft pink base. Works on stoneware and buff clays, the flux pulls color to edges.',
    applicationNotes:
      'Brush Amaco Rose Quartz ×2 on the body. When dry, brush Honey Flux ×1 on rim and raised texture only. Fire cone 5–6.',
    cone: 'cone-6',
    coneLabel: 'Cone 5–6',
    colorFamily: 'amber',
    finish: 'glossy',
    colorHex: '#D4A574',
    previewUri: PREVIEW.amber,
    products: [
      { brand: 'Amaco', name: 'Rose Quartz', role: 'base', layers: 2, method: 'brush' },
      { brand: 'Amaco', name: 'Honey Flux', role: 'accent', layers: 1, method: 'brush' },
    ],
  },
  {
    id: 'inspo-sea-glass-clear',
    title: 'Clear liner + Sea Glass exterior',
    description:
      'Food-safe interior with a satin green outside. Clean separation at the foot with wax resist.',
    applicationNotes:
      'Dip interior in clear liner. Wax foot and lower third. Dip exterior in sea-glass satin once, medium thickness.',
    cone: 'cone-6',
    coneLabel: 'Cone 6',
    colorFamily: 'green',
    finish: 'satin',
    colorHex: '#8FBFA0',
    previewUri: PREVIEW.green,
    products: [
      { brand: 'Studio blend', name: 'Clear liner', role: 'liner', layers: 1, method: 'dip' },
      { brand: 'Mid-Fire Favorite', name: 'Sea Glass Satin', role: 'accent', layers: 1, method: 'dip' },
    ],
  },
  {
    id: 'inspo-oatmeal-floating',
    title: 'Oatmeal matte + Floating Blue accent',
    description:
      'Buttery matte body with blue pooling in carves and rim dips. Mid-fire classic for textured mugs.',
    applicationNotes:
      'Dip or brush oatmeal matte on full piece ×2. Dip rim and carved lines in floating blue. Wipe feet clean.',
    cone: 'cone-6',
    coneLabel: 'Cone 6',
    colorFamily: 'blue',
    finish: 'matte',
    colorHex: '#7BA7CC',
    previewUri: PREVIEW.blue,
    products: [
      { brand: 'Classic Cone 6', name: 'Oatmeal Matte', role: 'base', layers: 2, method: 'brush' },
      { brand: 'Classic Cone 6', name: 'Floating Blue', role: 'accent', layers: 1, method: 'dip' },
    ],
  },
  {
    id: 'inspo-shino-foot',
    title: 'Shino body, tenmoku foot wipe',
    description:
      'High-fire reduction stack. Orange shino flash on rim; iron foot ring grounds the piece.',
    applicationNotes:
      'Apply shino thick over textured surface. Wipe tenmoku on foot ring only before loading. Reduction at peak.',
    cone: 'cone-10',
    coneLabel: 'Cone 10 · Reduction',
    colorFamily: 'amber',
    finish: 'matte',
    colorHex: '#C48B5A',
    previewUri: PREVIEW.amber,
    products: [
      { brand: 'High Fire Classic', name: 'Malcolm Davis Shino', role: 'base', layers: 2, method: 'brush' },
      { brand: 'High Fire Staple', name: 'Simple Tenmoku', role: 'accent', layers: 1, method: 'brush' },
    ],
  },
  {
    id: 'inspo-celadon-liner',
    title: 'Pale celadon over white stoneware',
    description:
      'Translucent green with clear inside. Best on light clay, thin application keeps the celadon airy.',
    applicationNotes:
      'Clear liner inside. Single thin dip celadon outside. Sponge any drips at the foot before firing.',
    cone: 'cone-6',
    coneLabel: 'Cone 6',
    colorFamily: 'green',
    finish: 'glossy',
    colorHex: '#A8CBB7',
    previewUri: PREVIEW.green,
    products: [
      { brand: 'Studio blend', name: 'Clear liner', role: 'liner', layers: 1, method: 'dip' },
      { brand: 'Mid-Fire Favorite', name: 'Pale Celadon', role: 'accent', layers: 1, method: 'dip' },
    ],
  },
  {
    id: 'inspo-matte-black-accent',
    title: 'Matte body, gloss black details',
    description:
      'Contrast stack for handles, stamps, or feet. Keeps the body soft while details read sharp.',
    applicationNotes:
      'Apply matte base ×2. Wax resist where matte should stay. Brush or dip obsidian gloss on handles and stamped marks only.',
    cone: 'cone-6',
    coneLabel: 'Cone 6',
    colorFamily: 'black',
    finish: 'matte',
    colorHex: '#2A2018',
    previewUri: PREVIEW.black,
    products: [
      { brand: 'Mid-Fire Favorite', name: 'Oatmeal Matte', role: 'base', layers: 2, method: 'brush' },
      { brand: 'Mid-Fire Favorite', name: 'Obsidian Gloss', role: 'accent', layers: 1, method: 'brush' },
    ],
  },
];
