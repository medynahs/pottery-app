import { Text } from '@/src/components/ui/text';
import type { GlazeLibraryItem } from '@/src/screens/glazes/types';
import { Users } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

type CommunityProvenanceBannerProps = {
  glaze: GlazeLibraryItem;
};

export function CommunityProvenanceBanner({ glaze }: CommunityProvenanceBannerProps) {
  if (!glaze.communitySourcePostId) return null;

  const studio = glaze.communitySourceStudioName?.trim() || 'a community potter';
  const isGenericAuthor =
    studio.toLowerCase() === 'community member' || studio.toLowerCase() === 'a community potter';
  const attribution = isGenericAuthor
    ? 'Originally shared by a community potter'
    : `Originally shared by @${studio.replace(/\s+/g, '').toLowerCase()}`;

  return (
    <View className="rounded-2xl border border-primary/25 bg-primary/5 px-4 py-3 mb-4">
      <View className="flex-row items-center gap-2 mb-1">
        <Users size={14} color="hsl(39 57% 45%)" />
        <Text className="text-[11px] font-semibold uppercase tracking-wider text-primary">
          From Community
        </Text>
      </View>
      <Text className="text-sm text-foreground leading-5">
        {attribution}
      </Text>
      {glaze.communitySavedAt ? (
        <Text className="text-[11px] text-muted-foreground mt-1">
          Saved to your atlas {new Date(glaze.communitySavedAt).toLocaleDateString()}
        </Text>
      ) : null}
    </View>
  );
}
