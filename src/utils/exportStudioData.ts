import type { GlazeLibraryItem, GlazeTestTile } from '@/src/screens/glazes/types';
import type { Firing, Kiln } from '@/src/types/kiln';
import type { Piece } from '@/src/types/pieces';
import { Share } from 'react-native';

export type StudioExportPayload = {
  version: 1;
  exportedAt: string;
  pieces: Piece[];
  firings: Firing[];
  kilns: Kiln[];
  glazes: GlazeLibraryItem[];
  glazeTests: GlazeTestTile[];
  glazeCollectionNames: string[];
};

export function buildStudioExportPayload(input: {
  pieces: Piece[];
  firings: Firing[];
  kilns: Kiln[];
  glazes: GlazeLibraryItem[];
  glazeTests: GlazeTestTile[];
  glazeCollectionNames: string[];
}): StudioExportPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    pieces: input.pieces,
    firings: input.firings,
    kilns: input.kilns,
    glazes: input.glazes,
    glazeTests: input.glazeTests,
    glazeCollectionNames: input.glazeCollectionNames,
  };
}

export function summarizeExport(payload: StudioExportPayload): string {
  const { pieces, firings, glazes, glazeTests } = payload;
  return [
    `${pieces.length} piece${pieces.length === 1 ? '' : 's'}`,
    `${firings.length} firing${firings.length === 1 ? '' : 's'}`,
    `${glazes.length} glaze batch${glazes.length === 1 ? '' : 'es'}`,
    `${glazeTests.length} test tile${glazeTests.length === 1 ? '' : 's'}`,
  ].join(' · ');
}

export async function shareStudioExport(payload: StudioExportPayload): Promise<void> {
  const json = JSON.stringify(payload, null, 2);
  const summary = summarizeExport(payload);

  await Share.share({
    title: 'Pottery Life Studio Export',
    message: `Pottery Life export (${summary})\n\n${json}`,
  });
}
