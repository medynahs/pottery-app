import { GLAZE_ATLAS_TAB_ROUTE } from '@/src/config/appModules';
import { Text } from '@/src/components/ui/text';
import { Kilnkin } from '@/src/screens/overview/components/Kilnkin';
import { getStudioSignals } from '@/src/screens/overview/utils/getStudioSignals';
import { mapPiecesToStudioPositions, type StudioPiecePositions } from '@/src/screens/overview/utils/mapPiecesToStudioPositions';
import { useVisiblePieces, useAppStore } from '@/src/store';
import type { Piece } from '@/src/types/pieces';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Image, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { Polygon } from 'react-native-svg';
import { getStudioLayerManifest, type StudioDeviceVariant } from './studioScene/layerManifest';

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

type StudioSceneProps = {
  height: number;
};

type ScenePoint = {
  x: number;
  y: number;
};

type PolygonBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
};

function parsePolygonPoints(points: string): ScenePoint[] {
  return points
    .trim()
    .split(/\s+/)
    .map((pair) => {
      const [x, y] = pair.split(',').map(Number);
      return { x, y };
    })
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
}

function getPolygonBounds(points: ScenePoint[]): PolygonBounds | null {
  if (points.length === 0) {
    return null;
  }

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    minX,
    maxX,
    minY,
    maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function isPointInPolygon(point: ScenePoint, polygon: ScenePoint[]): boolean {
  let inside = false;

  for (let currentIndex = 0, previousIndex = polygon.length - 1; currentIndex < polygon.length; previousIndex = currentIndex++) {
    const currentPoint = polygon[currentIndex];
    const previousPoint = polygon[previousIndex];

    const intersects =
      currentPoint.y > point.y !== previousPoint.y > point.y &&
      point.x <
        ((previousPoint.x - currentPoint.x) * (point.y - currentPoint.y)) /
          ((previousPoint.y - currentPoint.y) || Number.EPSILON) +
          currentPoint.x;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

type Percent = `${number}%`;

type SceneTarget = {
  left: Percent;
  top: Percent;
  width: Percent;
  height: Percent;
};

type SceneQuickAction = {
  label: string;
  route: string;
};

type StudioHotspot = {
  id: string;
  label: string;
  route: string;
  left: Percent;
  top: Percent;
  width: Percent;
  height: Percent;
  pieceSlot?: keyof StudioPiecePositions;
  quickActions: SceneQuickAction[];
  popoverLeft?: Percent;
  popoverTop?: Percent;
};

function getStudioHotspots(companionName: string): StudioHotspot[] {
  return [
  {
    id: 'kiln',
    label: 'Kiln',
    route: '/(tabs)/kiln',
    left: '71%',
    top: '46%',
    width: '20%',
    height: '30%',
    pieceSlot: 'kilnArea',
    quickActions: [
      { label: 'Open Kiln', route: '/(tabs)/kiln' },
      { label: 'Rhythm', route: '/profile/studio-rhythm' },
    ],
    popoverLeft: '56%',
    popoverTop: '41%',
  },
  {
    id: 'drying-shelf',
    label: 'Drying Shelf',
    route: '/(tabs)/pieces?stage=drying',
    left: '11%',
    top: '35%',
    width: '20%',
    height: '20%',
    pieceSlot: 'dryingShelf',
    quickActions: [
      { label: 'Open Pieces', route: '/(tabs)/pieces?stage=drying' },
      { label: 'My profile', route: '/(tabs)/profile' },
    ],
    popoverLeft: '10%',
    popoverTop: '29%',
  },
  {
    id: 'work-table',
    label: 'Work Table',
    route: '/(tabs)/pieces?stage=in-progress',
    left: '34%',
    top: '49%',
    width: '30%',
    height: '24%',
    pieceSlot: 'workTable',
    quickActions: [
      { label: 'Open Pieces', route: '/(tabs)/pieces?stage=in-progress' },
      { label: 'Calendar', route: '/profile/studio-rhythm' },
    ],
    popoverLeft: '35%',
    popoverTop: '43%',
  },
  {
    id: 'glaze-rack',
    label: 'Glaze Rack',
    route: '/glaze-cone',
    left: '12%',
    top: '61%',
    width: '19%',
    height: '24%',
    pieceSlot: 'glazeRack',
    quickActions: [
      { label: 'Open Glazes', route: '/glaze-cone' },
      { label: 'Glaze Atlas', route: GLAZE_ATLAS_TAB_ROUTE },
    ],
    popoverLeft: '8%',
    popoverTop: '56%',
  },
  {
    id: 'reclaim-bucket',
    label: 'Reclaim Bucket',
    route: '/(tabs)/pieces?stage=trimming',
    left: '59%',
    top: '67%',
    width: '12%',
    height: '18%',
    quickActions: [
      { label: 'Open Pieces', route: '/(tabs)/pieces?stage=trimming' },
      { label: 'My profile', route: '/(tabs)/profile' },
    ],
    popoverLeft: '50%',
    popoverTop: '62%',
  },
  {
    id: 'finished-cabinet',
    label: 'Finished Cabinet',
    route: '/(tabs)/pieces?stage=finished',
    left: '73%',
    top: '13%',
    width: '18%',
    height: '25%',
    pieceSlot: 'finishedCabinet',
    quickActions: [
      { label: 'Open Pieces', route: '/(tabs)/pieces?stage=finished' },
      { label: 'My profile', route: '/(tabs)/profile' },
    ],
    popoverLeft: '62%',
    popoverTop: '9%',
  },
  {
    id: 'kilnkin',
    label: companionName,
    route: '/kilnkin',
    left: '46%',
    top: '76%',
    width: '12%',
    height: '16%',
    quickActions: [
      { label: `Meet ${companionName}`, route: '/kilnkin' },
      { label: 'Open Glaze Atlas', route: GLAZE_ATLAS_TAB_ROUTE },
    ],
    popoverLeft: '36%',
    popoverTop: '69%',
  },
  ];
}

export function StudioScene({ height }: StudioSceneProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const toteHitboxSizeRef = useRef({ width: 1, height: 1 });
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);
  const kilnkinCompanion = useAppStore((state) => state.kilnkinCompanion);
  const pieces = useVisiblePieces();
  const firings = useAppStore((state) => state.firings);
  const studioHotspots = useMemo(() => getStudioHotspots(kilnkinCompanion.name), [kilnkinCompanion.name]);
  const studioPiecePositions = useMemo(() => mapPiecesToStudioPositions(pieces), [pieces]);
  const studioSignals = useMemo(() => getStudioSignals({ pieces, firings }), [firings, pieces]);
  const dustOpacity = useRef(new Animated.Value(0.35)).current;
  const ambientPulse = useRef(new Animated.Value(0)).current;

  const ambientVeilOpacity = useMemo(
    () => ambientPulse.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.2] }),
    [ambientPulse]
  );
  const ambientGlowOpacity = useMemo(
    () => ambientPulse.interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.22] }),
    [ambientPulse]
  );
  // fillOpacity for the tote bag polygon highlight, low enough to be subtle, > 0 so SVG hit-tests it
  const totePolygonFillOpacity = useMemo(
    () => ambientPulse.interpolate({ inputRange: [0, 1], outputRange: [0.05, 0.15] }),
    [ambientPulse]
  );

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(dustOpacity, {
          toValue: 0.78,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(dustOpacity, {
          toValue: 0.3,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [dustOpacity]);

  useEffect(() => {
    const ambientAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(ambientPulse, {
          toValue: 1,
          duration: 4200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ambientPulse, {
          toValue: 0,
          duration: 4200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    ambientAnimation.start();

    return () => {
      ambientAnimation.stop();
    };
  }, [ambientPulse]);

  const getPieceImage = (piece: Piece) => piece.photo ?? piece.imgUrl;
  const readyPiecesForKiln = useMemo(
    () => pieces.filter((piece) => ['bone-dry', 'glaze-fired'].includes(piece.stage.trim().toLowerCase())).slice(0, 3),
    [pieces]
  );
  const activeHotspot = useMemo(
    () => studioHotspots.find((zone) => zone.id === activeHotspotId) ?? null,
    [activeHotspotId, studioHotspots]
  );
  const sceneVariant: StudioDeviceVariant = width >= 768 ? 'tablet' : 'phone';
  const studioLayers = useMemo(() => getStudioLayerManifest(sceneVariant), [sceneVariant]);
  const toteHitPolygon = useMemo(() => {
    const toteLayer = studioLayers.find((layer) => layer.id === 'apron-and-tote-tote-bag');

    if (!toteLayer?.hitPolygon) {
      return null;
    }

    return sceneVariant === 'tablet' ? toteLayer.hitPolygon.tablet : toteLayer.hitPolygon.phone;
  }, [sceneVariant, studioLayers]);
  const totePolygonPoints = useMemo(() => (toteHitPolygon ? parsePolygonPoints(toteHitPolygon) : []), [toteHitPolygon]);
  const totePolygonBounds = useMemo(() => getPolygonBounds(totePolygonPoints), [totePolygonPoints]);
  const sceneHeight = Math.max(height, 1);

  return (
    <View className="w-full overflow-hidden bg-muted" style={{ height: sceneHeight }}>
      <View className="w-full h-full overflow-hidden">
        {studioLayers.map((layer) => {
          return (
            <React.Fragment key={`${sceneVariant}-${layer.id}`}>
              <Image
                source={layer.source}
                className="absolute inset-0 w-full h-full"
                style={{ opacity: layer.opacity }}
                resizeMode="cover"
                accessibilityLabel={`Studio layer ${layer.id}`}
              />
            </React.Fragment>
          );
        })}

        {/* {toteHitPolygon ? (
          <Svg
            pointerEvents="none"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <AnimatedPolygon
              points={toteHitPolygon}
              fill="#A07040"
              fillOpacity={totePolygonFillOpacity}
              stroke="#A07040"
              strokeWidth={0.3}
              strokeOpacity={0.25}
            />
          </Svg>
        ) : null} */}

        {/* {totePolygonBounds ? (
          <TouchableOpacity
            activeOpacity={0.95}
            accessibilityRole="button"
            accessibilityLabel="Open Community from tote bag"
            className="absolute"
            style={{
              left: `${totePolygonBounds.minX}%`,
              top: `${totePolygonBounds.minY}%`,
              width: `${totePolygonBounds.width}%`,
              height: `${totePolygonBounds.height}%`,
            }}
            onLayout={(event) => {
              toteHitboxSizeRef.current = {
                width: Math.max(event.nativeEvent.layout.width, 1),
                height: Math.max(event.nativeEvent.layout.height, 1),
              };
            }}
            onPress={(event) => {
              const { width: hitboxWidth, height: hitboxHeight } = toteHitboxSizeRef.current;
              const touchX = totePolygonBounds.minX + (event.nativeEvent.locationX / hitboxWidth) * totePolygonBounds.width;
              const touchY = totePolygonBounds.minY + (event.nativeEvent.locationY / hitboxHeight) * totePolygonBounds.height;

              if (isPointInPolygon({ x: touchX, y: touchY }, totePolygonPoints)) {
                router.push('/(tabs)/community');
              }
            }}
          />
        ) : null} */}

        <Animated.View
          pointerEvents="none"
          className="absolute inset-0 bg-amber-100/25"
          style={{ opacity: ambientVeilOpacity }}
        />
        <Animated.View
          pointerEvents="none"
          className="absolute -left-20 top-8 h-56 w-56 rounded-full bg-amber-100/40"
          style={{ opacity: ambientGlowOpacity }}
        />
        <Animated.View
          pointerEvents="none"
          className="absolute right-8 bottom-12 h-44 w-44 rounded-full bg-primary/15/35"
          style={{ opacity: ambientGlowOpacity }}
        />

        <Kilnkin pieces={pieces} signals={studioSignals} />

        {activeHotspot ? (
          <TouchableOpacity className="absolute inset-0" activeOpacity={1} onPress={() => setActiveHotspotId(null)} />
        ) : null}
{/* 
      {studioHotspots.map((zone) => {
        const mappedPieces = zone.pieceSlot ? studioPiecePositions[zone.pieceSlot] : [];
        const previewPieces = mappedPieces.slice(0, 3);
        const remainingCount = Math.max(mappedPieces.length - previewPieces.length, 0);
        const isActive = activeHotspotId === zone.id;

        return (
          <TouchableOpacity
            key={zone.id}
            onPress={() => setActiveHotspotId((current) => (current === zone.id ? null : zone.id))}
            activeOpacity={0.25}
            accessibilityRole="button"
            accessibilityLabel={zone.label}
            className={`absolute rounded-2xl border ${isActive ? 'border-primary bg-primary/25' : 'border-primary/55 bg-primary/15'}`}
            style={{
              left: zone.left,
              top: zone.top,
              width: zone.width,
              height: zone.height,
            }}
          >
            <View className="self-start m-1 rounded-md bg-card/85 border border-border px-1.5 py-0.5">
              <Text className="text-[10px] text-foreground font-medium">{zone.label}</Text>
            </View>

            {zone.id === 'reclaim-bucket' && studioSignals.scrapOverflow ? (
              <View className="absolute left-0 right-0 bottom-0 h-[45%] rounded-b-2xl bg-amber-700/35" />
            ) : null}

            {zone.pieceSlot ? (
              <>
                <View className="absolute right-1.5 top-1.5 rounded-full border border-border bg-card/90 px-1.5 py-0.5">
                  <Text className="text-[9px] text-foreground">{mappedPieces.length}</Text>
                </View>

                {zone.id === 'drying-shelf' && studioSignals.dryingTooLong ? (
                  <Animated.View className="absolute right-1.5 bottom-8" style={{ opacity: dustOpacity }}>
                    <View className="flex-row gap-1">
                      <View className="w-1.5 h-1.5 rounded-full bg-amber-100/90" />
                      <View className="w-1 h-1 rounded-full bg-amber-100/70" />
                      <View className="w-1.5 h-1.5 rounded-full bg-amber-100/80" />
                    </View>
                  </Animated.View>
                ) : null}

                {zone.id === 'kiln' && studioSignals.kilnReady ? (
                  <>
                    <View className="absolute inset-0 rounded-2xl border border-amber-200/70" />

                    {readyPiecesForKiln.length > 0 ? (
                      <View className="absolute left-1.5 right-1.5 bottom-8 flex-row items-center">
                        <View className="flex-row items-center">
                          {readyPiecesForKiln.map((piece, index) => (
                            <View
                              key={`ready-${piece.id}`}
                              className="w-4.5 h-4.5 rounded-full border border-background overflow-hidden bg-card"
                              style={{ marginLeft: index === 0 ? 0 : -5 }}
                            >
                              {getPieceImage(piece) ? (
                                <Image source={{ uri: getPieceImage(piece) }} className="w-full h-full" resizeMode="cover" />
                              ) : (
                                <View className="flex-1 items-center justify-center bg-primary/20">
                                  <Text className="text-[8px] text-foreground font-medium">
                                    {piece.name.charAt(0).toUpperCase()}
                                  </Text>
                                </View>
                              )}
                            </View>
                          ))}
                        </View>
                      </View>
                    ) : null}
                  </>
                ) : null}

                {previewPieces.length > 0 ? (
                  <View className="absolute left-1.5 right-1.5 bottom-1.5 flex-row items-center">
                    <View className="flex-row items-center">
                      {previewPieces.map((piece, index) => (
                        <View
                          key={piece.id}
                          className="w-5 h-5 rounded-full border border-background overflow-hidden bg-card"
                          style={{ marginLeft: index === 0 ? 0 : -6 }}
                        >
                          {getPieceImage(piece) ? (
                            <Image source={{ uri: getPieceImage(piece) }} className="w-full h-full" resizeMode="cover" />
                          ) : (
                            <View className="flex-1 items-center justify-center bg-primary/20">
                              <Text className="text-[9px] text-foreground font-medium">
                                {piece.name.charAt(0).toUpperCase()}
                              </Text>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>

                    {remainingCount > 0 ? (
                      <View className="ml-1 rounded-full border border-border bg-card/90 px-1.5 py-0.5">
                        <Text className="text-[9px] text-foreground">+{remainingCount}</Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </>
            ) : null}
          </TouchableOpacity>
        );
      })} */}

        {activeHotspot ? (
          <View
            className="absolute z-50"
            style={{
              left: activeHotspot.popoverLeft ?? activeHotspot.left,
              top: activeHotspot.popoverTop ?? activeHotspot.top,
            }}
          >
            <View className="rounded-2xl border border-border bg-card/95 p-2">
              <Text className="text-[11px] font-medium text-foreground px-1 pb-1">{activeHotspot.label}</Text>
              <View className="flex-row gap-2">
                {activeHotspot.quickActions.slice(0, 2).map((action) => (
                  <TouchableOpacity
                    key={`${activeHotspot.id}-${action.label}`}
                    activeOpacity={0.8}
                    onPress={() => {
                      setActiveHotspotId(null);
                      router.push(action.route as never);
                    }}
                    className="rounded-xl border border-border bg-background px-3 py-2"
                  >
                    <Text className="text-[11px] text-foreground font-medium">{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}
