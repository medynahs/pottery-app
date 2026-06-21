import { Text } from '@/src/components/ui/text';
import { Image } from 'expo-image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react-native';
import React from 'react';
import {
  FlatList,
  Modal,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { PiecePhotoItem } from '../utils/piecePhotos';

type PiecePhotoGalleryModalProps = {
  visible: boolean;
  title: string;
  photos: PiecePhotoItem[];
  initialIndex?: number;
  onClose: () => void;
};

export function PiecePhotoGalleryModal({
  visible,
  title,
  photos,
  initialIndex = 0,
  onClose,
}: PiecePhotoGalleryModalProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const listRef = React.useRef<FlatList<PiecePhotoItem>>(null);
  const [activeIndex, setActiveIndex] = React.useState(initialIndex);

  React.useEffect(() => {
    if (!visible) return;
    const clamped = Math.max(0, Math.min(initialIndex, photos.length - 1));
    setActiveIndex(clamped);
    requestAnimationFrame(() => {
      if (photos.length > 0) {
        listRef.current?.scrollToIndex({ index: clamped, animated: false });
      }
    });
  }, [visible, initialIndex, photos.length]);

  if (!visible || photos.length === 0) return null;

  const activePhoto = photos[activeIndex];

  const goTo = (index: number) => {
    const clamped = Math.max(0, Math.min(index, photos.length - 1));
    setActiveIndex(clamped);
    listRef.current?.scrollToIndex({ index: clamped, animated: true });
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={onClose} statusBarTranslucent>
      <View className="flex-1 bg-background" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
          <View className="flex-1 pr-3">
            <Text className="text-base font-serif font-bold text-foreground" numberOfLines={1}>
              {title}
            </Text>
            <Text className="text-xs text-muted-foreground mt-0.5">
              {activeIndex + 1} of {photos.length}
            </Text>
          </View>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityLabel="Close gallery"
            className="w-9 h-9 rounded-full bg-muted/60 items-center justify-center"
          >
            <X size={18} color="hsl(24 20% 40%)" />
          </TouchableOpacity>
        </View>

        <View className="flex-1 justify-center">
          <FlatList
            ref={listRef}
            data={photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item, index) => `${item.uri}-${index}`}
            getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setActiveIndex(Math.max(0, Math.min(index, photos.length - 1)));
            }}
            renderItem={({ item }) => (
              <View style={{ width, flex: 1, justifyContent: 'center', paddingHorizontal: 16 }}>
                <Image
                  source={{ uri: item.uri }}
                  style={{ width: width - 32, height: width - 32, alignSelf: 'center', borderRadius: 16 }}
                  contentFit="contain"
                />
              </View>
            )}
          />

          {photos.length > 1 ? (
            <>
              {activeIndex > 0 ? (
                <TouchableOpacity
                  onPress={() => goTo(activeIndex - 1)}
                  activeOpacity={0.8}
                  accessibilityLabel="Previous photo"
                  className="absolute left-3 top-1/2 -mt-5 w-10 h-10 rounded-full bg-foreground/70 items-center justify-center"
                >
                  <ChevronLeft size={20} color="hsl(34 35% 92%)" />
                </TouchableOpacity>
              ) : null}
              {activeIndex < photos.length - 1 ? (
                <TouchableOpacity
                  onPress={() => goTo(activeIndex + 1)}
                  activeOpacity={0.8}
                  accessibilityLabel="Next photo"
                  className="absolute right-3 top-1/2 -mt-5 w-10 h-10 rounded-full bg-foreground/70 items-center justify-center"
                >
                  <ChevronRight size={20} color="hsl(34 35% 92%)" />
                </TouchableOpacity>
              ) : null}
            </>
          ) : null}
        </View>

        <View className="px-6 py-4 border-t border-border">
          <Text className="text-sm font-medium text-foreground text-center" numberOfLines={2}>
            {activePhoto?.caption ?? ''}
          </Text>
          {photos.length > 1 ? (
            <View className="flex-row items-center justify-center gap-1.5 mt-3">
              {photos.map((photo, index) => (
                <TouchableOpacity
                  key={`${photo.uri}-${index}`}
                  onPress={() => goTo(index)}
                  activeOpacity={0.8}
                  accessibilityLabel={`Go to photo ${index + 1}`}
                  className={`rounded-full ${index === activeIndex ? 'w-2.5 h-2.5 bg-primary' : 'w-2 h-2 bg-muted-foreground/30'}`}
                />
              ))}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
