import {
  ModalCard,
  ModalSheetFooter,
  ModalSheetHeader,
  ModalShell,
  MODAL_SHEET_RADIUS,
  useModalSheetHeight,
} from '@/src/components/AppSheets';
import { Banner } from '@/src/components/Banner';
import { UserAvatar } from '@/src/components/UserAvatar';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { useUploadAvatar, useUploadCover } from '@/src/hooks/useCurrentUser';
import { usePhotoPicker } from '@/src/hooks/usePhotoPicker';
import { usePremiumGate } from '@/src/hooks/usePremiumGate';
import { useAppStore } from '@/src/store/appStore';
import { canUploadProfileMedia } from '@/src/utils/cloudStorage';
import { PremiumFeature } from '@/src/utils/premiumGate';
import { Camera, ImageIcon } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  ScrollView,
  TouchableOpacity,
  View
} from 'react-native';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export function EditProfileModal({ visible, onClose }: EditProfileModalProps) {
  const sheetHeight = useModalSheetHeight();
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const sessionToken = useAppStore((s) => s.sessionToken);
  const uploadAvatar = useUploadAvatar();
  const uploadCover = useUploadCover();
  const avatarPicker = usePhotoPicker({ aspect: [1, 1], quality: 0.85 });
  const coverPicker = usePhotoPicker({ aspect: [16, 9], quality: 0.85 });
  const { requestAccess, PaywallGate } = usePremiumGate();

  const [name, setName] = useState('');
  const [studioName, setStudioName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [avatarImageUri, setAvatarImageUri] = useState<string | undefined>(undefined);
  const [avatarMimeType, setAvatarMimeType] = useState<string>('image/jpeg');
  const [coverImageUri, setCoverImageUri] = useState<string | undefined>(undefined);
  // Track whether a new local image was picked (so we only upload when there's a change)
  const avatarChanged = useRef(false);
  const coverChanged = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Sync form state when modal opens
  useEffect(() => {
    if (visible) {
      setName(user.name ?? '');
      setStudioName(user.studioName ?? '');
      setLocation(user.location ?? '');
      setBio(user.bio ?? '');
      setAvatarImageUri(user.avatarImageUri);
      setCoverImageUri(user.coverImageUri);
      avatarChanged.current = false;
      coverChanged.current = false;
      setUploadError(null);
      setUploadSuccess(false);
      setIsSaving(false);
    }
  }, [visible]);

  const pickAvatar = () => {
    if (!canUploadProfileMedia()) {
      requestAccess(PremiumFeature.CloudStorage);
      return;
    }
    avatarPicker.openPickSheet((uri) => {
      setAvatarImageUri(uri);
      setAvatarMimeType('image/jpeg');
      avatarChanged.current = true;
    });
  };

  const pickCover = () => {
    if (!canUploadProfileMedia()) {
      requestAccess(PremiumFeature.CloudStorage);
      return;
    }
    coverPicker.openPickSheet((uri) => {
      setCoverImageUri(uri);
      coverChanged.current = true;
    });
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    setUser({
      name: trimmedName || user.name,
      avatarInitial: (trimmedName || user.name).charAt(0).toUpperCase(),
      studioName: studioName.trim() || undefined,
      location: location.trim() || undefined,
      bio: bio.trim() || undefined,
      avatarImageUri,
      coverImageUri,
    });

    const shouldUploadAvatar = avatarChanged.current && !!avatarImageUri;
    const shouldUploadCover = coverChanged.current && !!coverImageUri;

    if (sessionToken && (shouldUploadAvatar || shouldUploadCover)) {
      setIsSaving(true);
      setUploadError(null);
      try {
        if (shouldUploadAvatar) await uploadAvatar(avatarImageUri!, avatarMimeType);
        if (shouldUploadCover) await uploadCover(coverImageUri!, 'image/jpeg');
        setUploadSuccess(true);
        setTimeout(onClose, 800);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Photo upload failed';
        if (__DEV__) console.warn('[uploadProfilePhotos]', msg);
        setUploadError(msg);
        setIsSaving(false);
      }
      return;
    }

    onClose();
  };

  const avatarInitial = ((name.trim() || user.name || 'U')[0] ?? 'U').toUpperCase();

  return (
    <>
      {PaywallGate}
      <ModalShell visible={visible} onClose={onClose}>
      <ModalCard radius={MODAL_SHEET_RADIUS} height={sheetHeight} maxHeight={sheetHeight} withHandle={false}>
        <ModalSheetHeader>
          <Text className="text-2xl font-serif font-bold text-foreground">Edit Profile</Text>
        </ModalSheetHeader>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              style={{ flex: 1, minHeight: 0 }}
              contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8 }}
              showsVerticalScrollIndicator={false}
            >
              {uploadError ? (
                <Banner message={uploadError} className="mb-4" />
              ) : null}
              {uploadSuccess ? (
                <Banner intent="success" message="Profile photos updated successfully" className="mb-4" />
              ) : null}
              {/* Cover photo picker */}
              <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Cover Photo
              </Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={pickCover}
                className="w-full h-28 rounded-2xl overflow-hidden mb-5 items-center justify-center border border-border"
                style={{ backgroundColor: coverImageUri ? undefined : 'hsl(260 15% 48%)' }}
              >
                {coverImageUri ? (
                  <Image source={{ uri: coverImageUri }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <View className="items-center gap-1.5">
                    <ImageIcon size={22} color="rgba(255,255,255,0.8)" />
                    <Text className="text-xs text-white/80 font-medium">Tap to choose cover</Text>
                  </View>
                )}
                {/* Edit overlay */}
                <View
                  className="absolute bottom-2 right-2 bg-black/40 rounded-full p-1.5"
                >
                  <Camera size={14} color="white" />
                </View>
              </TouchableOpacity>

              {/* Avatar picker */}
              <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Profile Picture
              </Text>
              <View className="flex-row items-center gap-4 mb-5">
                <TouchableOpacity activeOpacity={0.8} onPress={pickAvatar} className="relative">
                  <View className="rounded-full border-4 border-background overflow-hidden">
                    <UserAvatar
                      name={name}
                      initial={avatarInitial}
                      imageUri={avatarImageUri}
                      size={80}
                      serif
                    />
                  </View>
                  <View className="absolute bottom-0 right-0 bg-black/50 rounded-full p-1.5 border-2 border-background">
                    <Camera size={12} color="white" />
                  </View>
                </TouchableOpacity>
                <View className="flex-1">
                  <Text className="text-sm text-muted-foreground leading-relaxed">
                    Tap the avatar to upload a profile picture from your photo library.
                  </Text>
                </View>
              </View>

              {/* Name */}
              <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                Name
              </Text>
              <Input
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                className="mb-4"
                autoCorrect={false}
              />

              {/* Studio name */}
              <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                Studio Name
              </Text>
              <Input
                value={studioName}
                onChangeText={setStudioName}
                placeholder="e.g. My Studio"
                className="mb-4"
                autoCorrect={false}
              />

              {/* Location */}
              <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                Location
              </Text>
              <Input
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. Portland, OR"
                className="mb-4"
                autoCorrect={false}
              />

              {/* Bio */}
              <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                Bio
              </Text>
              <Input
                value={bio}
                onChangeText={setBio}
                placeholder="Tell us about your pottery practice…"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="mb-6"
                style={{ minHeight: 80, paddingTop: 10 }}
              />
            </ScrollView>

            <ModalSheetFooter>
              <Button onPress={handleSave} disabled={!name.trim() || isSaving} className="w-full">
                <Text className="text-primary-foreground font-semibold">
                  {isSaving ? 'Saving…' : 'Save Changes'}
                </Text>
              </Button>
            </ModalSheetFooter>
      </ModalCard>
    </ModalShell>
    </>
  );
}
