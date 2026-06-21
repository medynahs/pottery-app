import type { ImageSourcePropType } from 'react-native';

export type StudioDeviceVariant = 'phone' | 'tablet';

export type StudioLayerFolder = 'base' | 'workstations' | 'furniture' | 'decor' | 'overlays';

export type StudioLayerId =
  | 'base-env-walls-and-floors'
  | 'throwing-wheel-body'
  | 'throwing-wheel-head'
  | 'throwing-stool'
  | 'pet-bed'
  | 'apron-and-tote-tote-bag'
  | 'apron-and-tote-apron'
  | 'shelves-rack'
  | 'shelves-vases'
  | 'wall-art'
  | 'frame-picture-2'
  | 'frame-picture-1'
  | 'memorial'
  | 'pedestal'
  | 'glaze-table-table'
  | 'glaze-table-crystal'
  | 'glaze-table-tools'
  | 'handbuilding-table-forming-tools-table'
  | 'handbuilding-table-forming-tools-plant'
  | 'handbuilding-table-forming-tools-books'
  | 'handbuilding-table-clay-blob-3'
  | 'handbuilding-table-clay-blob-2'
  | 'handbuilding-table-clay-blob-1'
  | 'furniture-reclaim-bucket'
  | 'furniture-kiln'
  | 'furniture-plant'
  | 'dragon-pet'
  | 'global-shadows'
  | 'global-light';

export type StudioLayerManifestEntry = {
  id: StudioLayerId;
  folder: StudioLayerFolder;
  fileName: `${string}.png`;
  zIndex: number;
  animated: boolean;
  opacity: number;
  assetPath: string;
  source: ImageSourcePropType;
  /**
   * SVG polygon points in "x,y" pairs (space-separated) using a 0–100 percentage
   * coordinate space matching the full scene canvas. Set only on interactive layers.
   * Calibrate these from Procreate once the real exports land.
   */
  hitPolygon?: { phone: string; tablet: string };
};

type StudioLayerTemplate = Omit<StudioLayerManifestEntry, 'assetPath' | 'source' | 'opacity'>;

const LAYER_TEMPLATES: StudioLayerTemplate[] = [
  { id: 'base-env-walls-and-floors', folder: 'base', fileName: 'base-env-walls-and-floors.png', zIndex: 10, animated: false },

  { id: 'throwing-wheel-body', folder: 'workstations', fileName: 'throwing-wheel-body.png', zIndex: 20, animated: false },
  { id: 'throwing-wheel-head', folder: 'workstations', fileName: 'throwing-wheel-head.png', zIndex: 30, animated: true },
  { id: 'throwing-stool', folder: 'workstations', fileName: 'throwing-stool.png', zIndex: 40, animated: false },

  { id: 'pet-bed', folder: 'decor', fileName: 'pet-bed.png', zIndex: 50, animated: false },
  {
    id: 'apron-and-tote-tote-bag',
    folder: 'decor',
    fileName: 'apron-and-tote-tote-bag.png',
    zIndex: 60,
    animated: true,
    // Rough polygon, replace with real Procreate coordinates after export.
    // Points are "x,y" in 0-100 percentage space (x = % of scene width, y = % of scene height).
    // Traces: left handle → gap → right handle → bag body, clockwise.
    hitPolygon: {
      phone: '7,29 9.5,29 9.5,34 14,34 14,29 16.5,29 17.5,34 17.5,46 5.5,46 5.5,34',
      tablet: '7.5,31 9,31 9,34 11.5,34 11.5,31 13,31 14.5,34 14.5,45 6,45 6,34',
    },
  },
  { id: 'apron-and-tote-apron', folder: 'decor', fileName: 'apron-and-tote-apron.png', zIndex: 70, animated: true },

  { id: 'shelves-rack', folder: 'furniture', fileName: 'shelves-rack.png', zIndex: 80, animated: false },
  { id: 'shelves-vases', folder: 'furniture', fileName: 'shelves-vases.png', zIndex: 90, animated: true },

  { id: 'wall-art', folder: 'decor', fileName: 'wall-art.png', zIndex: 100, animated: false },
  { id: 'frame-picture-2', folder: 'decor', fileName: 'frame-picture-2.png', zIndex: 110, animated: false },
  { id: 'frame-picture-1', folder: 'decor', fileName: 'frame-picture-1.png', zIndex: 120, animated: false },
  { id: 'memorial', folder: 'decor', fileName: 'memorial.png', zIndex: 130, animated: false },
  { id: 'pedestal', folder: 'decor', fileName: 'pedestal.png', zIndex: 140, animated: false },

  { id: 'glaze-table-table', folder: 'workstations', fileName: 'glaze-table-table.png', zIndex: 150, animated: false },
  { id: 'glaze-table-crystal', folder: 'workstations', fileName: 'glaze-table-crystal.png', zIndex: 160, animated: true },
  { id: 'glaze-table-tools', folder: 'workstations', fileName: 'glaze-table-tools.png', zIndex: 170, animated: true },

  {
    id: 'handbuilding-table-forming-tools-table',
    folder: 'workstations',
    fileName: 'handbuilding-table-forming-tools-table.png',
    zIndex: 180,
    animated: false,
  },
  {
    id: 'handbuilding-table-forming-tools-plant',
    folder: 'workstations',
    fileName: 'handbuilding-table-forming-tools-plant.png',
    zIndex: 190,
    animated: true,
  },
  {
    id: 'handbuilding-table-forming-tools-books',
    folder: 'workstations',
    fileName: 'handbuilding-table-forming-tools-books.png',
    zIndex: 200,
    animated: false,
  },
  { id: 'handbuilding-table-clay-blob-3', folder: 'workstations', fileName: 'handbuilding-table-clay-blob-3.png', zIndex: 210, animated: true },
  { id: 'handbuilding-table-clay-blob-2', folder: 'workstations', fileName: 'handbuilding-table-clay-blob-2.png', zIndex: 220, animated: true },
  { id: 'handbuilding-table-clay-blob-1', folder: 'workstations', fileName: 'handbuilding-table-clay-blob-1.png', zIndex: 230, animated: true },

  { id: 'furniture-reclaim-bucket', folder: 'furniture', fileName: 'furniture-reclaim-bucket.png', zIndex: 240, animated: true },
  { id: 'furniture-kiln', folder: 'furniture', fileName: 'furniture-kiln.png', zIndex: 250, animated: true },
  { id: 'furniture-plant', folder: 'furniture', fileName: 'furniture-plant.png', zIndex: 260, animated: true },

  { id: 'dragon-pet', folder: 'decor', fileName: 'dragon-pet.png', zIndex: 270, animated: true },
  { id: 'global-shadows', folder: 'overlays', fileName: 'global-shadows.png', zIndex: 280, animated: true },
  { id: 'global-light', folder: 'overlays', fileName: 'global-light.png', zIndex: 290, animated: true },
];

const PHONE_LAYER_SOURCES: Record<StudioLayerId, ImageSourcePropType> = {
  'base-env-walls-and-floors': require('../../../../../assets/images/studio/phone/base/base-env-walls-and-floors.png'),
  'throwing-wheel-body': require('../../../../../assets/images/studio/phone/workstations/throwing-wheel-body.png'),
  'throwing-wheel-head': require('../../../../../assets/images/studio/phone/workstations/throwing-wheel-head.png'),
  'throwing-stool': require('../../../../../assets/images/studio/phone/workstations/throwing-stool.png'),
  'pet-bed': require('../../../../../assets/images/studio/phone/decor/pet-bed.png'),
  'apron-and-tote-tote-bag': require('../../../../../assets/images/studio/phone/decor/apron-and-tote-tote-bag.png'),
  'apron-and-tote-apron': require('../../../../../assets/images/studio/phone/decor/apron-and-tote-apron.png'),
  'shelves-rack': require('../../../../../assets/images/studio/phone/furniture/shelves-rack.png'),
  'shelves-vases': require('../../../../../assets/images/studio/phone/furniture/shelves-vases.png'),
  'wall-art': require('../../../../../assets/images/studio/phone/decor/wall-art.png'),
  'frame-picture-2': require('../../../../../assets/images/studio/phone/decor/frame-picture-2.png'),
  'frame-picture-1': require('../../../../../assets/images/studio/phone/decor/frame-picture-1.png'),
  memorial: require('../../../../../assets/images/studio/phone/decor/memorial.png'),
  pedestal: require('../../../../../assets/images/studio/phone/decor/pedestal.png'),
  'glaze-table-table': require('../../../../../assets/images/studio/phone/workstations/glaze-table-table.png'),
  'glaze-table-crystal': require('../../../../../assets/images/studio/phone/workstations/glaze-table-crystal.png'),
  'glaze-table-tools': require('../../../../../assets/images/studio/phone/workstations/glaze-table-tools.png'),
  'handbuilding-table-forming-tools-table': require('../../../../../assets/images/studio/phone/workstations/handbuilding-table-forming-tools-table.png'),
  'handbuilding-table-forming-tools-plant': require('../../../../../assets/images/studio/phone/workstations/handbuilding-table-forming-tools-plant.png'),
  'handbuilding-table-forming-tools-books': require('../../../../../assets/images/studio/phone/workstations/handbuilding-table-forming-tools-books.png'),
  'handbuilding-table-clay-blob-3': require('../../../../../assets/images/studio/phone/workstations/handbuilding-table-clay-blob-3.png'),
  'handbuilding-table-clay-blob-2': require('../../../../../assets/images/studio/phone/workstations/handbuilding-table-clay-blob-2.png'),
  'handbuilding-table-clay-blob-1': require('../../../../../assets/images/studio/phone/workstations/handbuilding-table-clay-blob-1.png'),
  'furniture-reclaim-bucket': require('../../../../../assets/images/studio/phone/furniture/furniture-reclaim-bucket.png'),
  'furniture-kiln': require('../../../../../assets/images/studio/phone/furniture/furniture-kiln.png'),
  'furniture-plant': require('../../../../../assets/images/studio/phone/furniture/furniture-plant.png'),
  'dragon-pet': require('../../../../../assets/images/studio/phone/decor/dragon-pet.png'),
  'global-shadows': require('../../../../../assets/images/studio/phone/overlays/global-shadows.png'),
  'global-light': require('../../../../../assets/images/studio/phone/overlays/global-light.png'),
};

const TABLET_LAYER_SOURCES: Record<StudioLayerId, ImageSourcePropType> = {
  'base-env-walls-and-floors': require('../../../../../assets/images/studio/tablet/base/base-env-walls-and-floors.png'),
  'throwing-wheel-body': require('../../../../../assets/images/studio/tablet/workstations/throwing-wheel-body.png'),
  'throwing-wheel-head': require('../../../../../assets/images/studio/tablet/workstations/throwing-wheel-head.png'),
  'throwing-stool': require('../../../../../assets/images/studio/tablet/workstations/throwing-stool.png'),
  'pet-bed': require('../../../../../assets/images/studio/tablet/decor/pet-bed.png'),
  'apron-and-tote-tote-bag': require('../../../../../assets/images/studio/tablet/decor/apron-and-tote-tote-bag.png'),
  'apron-and-tote-apron': require('../../../../../assets/images/studio/tablet/decor/apron-and-tote-apron.png'),
  'shelves-rack': require('../../../../../assets/images/studio/tablet/furniture/shelves-rack.png'),
  'shelves-vases': require('../../../../../assets/images/studio/tablet/furniture/shelves-vases.png'),
  'wall-art': require('../../../../../assets/images/studio/tablet/decor/wall-art.png'),
  'frame-picture-2': require('../../../../../assets/images/studio/tablet/decor/frame-picture-2.png'),
  'frame-picture-1': require('../../../../../assets/images/studio/tablet/decor/frame-picture-1.png'),
  memorial: require('../../../../../assets/images/studio/tablet/decor/memorial.png'),
  pedestal: require('../../../../../assets/images/studio/tablet/decor/pedestal.png'),
  'glaze-table-table': require('../../../../../assets/images/studio/tablet/workstations/glaze-table-table.png'),
  'glaze-table-crystal': require('../../../../../assets/images/studio/tablet/workstations/glaze-table-crystal.png'),
  'glaze-table-tools': require('../../../../../assets/images/studio/tablet/workstations/glaze-table-tools.png'),
  'handbuilding-table-forming-tools-table': require('../../../../../assets/images/studio/tablet/workstations/handbuilding-table-forming-tools-table.png'),
  'handbuilding-table-forming-tools-plant': require('../../../../../assets/images/studio/tablet/workstations/handbuilding-table-forming-tools-plant.png'),
  'handbuilding-table-forming-tools-books': require('../../../../../assets/images/studio/tablet/workstations/handbuilding-table-forming-tools-books.png'),
  'handbuilding-table-clay-blob-3': require('../../../../../assets/images/studio/tablet/workstations/handbuilding-table-clay-blob-3.png'),
  'handbuilding-table-clay-blob-2': require('../../../../../assets/images/studio/tablet/workstations/handbuilding-table-clay-blob-2.png'),
  'handbuilding-table-clay-blob-1': require('../../../../../assets/images/studio/tablet/workstations/handbuilding-table-clay-blob-1.png'),
  'furniture-reclaim-bucket': require('../../../../../assets/images/studio/tablet/furniture/furniture-reclaim-bucket.png'),
  'furniture-kiln': require('../../../../../assets/images/studio/tablet/furniture/furniture-kiln.png'),
  'furniture-plant': require('../../../../../assets/images/studio/tablet/furniture/furniture-plant.png'),
  'dragon-pet': require('../../../../../assets/images/studio/tablet/decor/dragon-pet.png'),
  'global-shadows': require('../../../../../assets/images/studio/tablet/overlays/global-shadows.png'),
  'global-light': require('../../../../../assets/images/studio/tablet/overlays/global-light.png'),
};

const VARIANT_LAYER_SOURCE_MAP: Record<StudioDeviceVariant, Record<StudioLayerId, ImageSourcePropType>> = {
  phone: PHONE_LAYER_SOURCES,
  tablet: TABLET_LAYER_SOURCES,
};

function getDefaultLayerOpacity(layerId: StudioLayerId): number {
  if (layerId === 'global-shadows') {
    return 0.22;
  }

  if (layerId === 'global-light') {
    return 0.18;
  }

  return 1;
}

function buildManifestForVariant(variant: StudioDeviceVariant): StudioLayerManifestEntry[] {
  return LAYER_TEMPLATES.map((layer) => {
    const source = VARIANT_LAYER_SOURCE_MAP[variant][layer.id];

    return {
      ...layer,
      opacity: getDefaultLayerOpacity(layer.id),
      assetPath: `assets/images/studio/${variant}/${layer.folder}/${layer.fileName}`,
      source,
    };
  }).sort((left, right) => left.zIndex - right.zIndex);
}

export const STUDIO_LAYER_MANIFEST: Record<StudioDeviceVariant, StudioLayerManifestEntry[]> = {
  phone: buildManifestForVariant('phone'),
  tablet: buildManifestForVariant('tablet'),
};

export function getStudioLayerManifest(variant: StudioDeviceVariant): StudioLayerManifestEntry[] {
  return STUDIO_LAYER_MANIFEST[variant];
}
