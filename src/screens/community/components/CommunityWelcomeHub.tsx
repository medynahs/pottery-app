import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { COMMUNITY_THEME } from '@/src/screens/community/communityTheme';
import {
  BookOpen,
  ChevronRight,
  HelpCircle,
  ImagePlus,
  Palette,
  Trophy,
  type LucideIcon,
} from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

type WelcomeAction = {
  id: string;
  label: string;
  subtitle: string;
  icon: LucideIcon;
  onPress: () => void;
};

type CommunityWelcomeHubProps = {
  hasPieces: boolean;
  onSharePiece: () => void;
  onAskCommunity: () => void;
  onJoinChallenge: () => void;
  onBrowseDiscover: () => void;
  onCreatePost: () => void;
};

function WelcomeActionRow({ label, subtitle, icon: Icon, onPress }: WelcomeAction) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.82}
      className="flex-row items-center gap-3 py-3 px-3 rounded-2xl border border-border bg-card"
    >
      <View
        className="w-10 h-10 rounded-xl items-center justify-center"
        style={{ backgroundColor: 'hsl(39 55% 96%)' }}
      >
        <Icon size={18} color="hsl(39 57% 51%)" />
      </View>
      <View className="flex-1 min-w-0">
        <Text className="text-sm font-semibold text-foreground">{label}</Text>
        <Text className="text-xs text-muted-foreground mt-0.5 leading-4">{subtitle}</Text>
      </View>
      <ChevronRight size={16} color="hsl(24 20% 55%)" />
    </TouchableOpacity>
  );
}

export function CommunityWelcomeHub({
  hasPieces,
  onSharePiece,
  onAskCommunity,
  onJoinChallenge,
  onBrowseDiscover,
  onCreatePost,
}: CommunityWelcomeHubProps) {
  const actions: WelcomeAction[] = [
    ...(hasPieces
      ? [{
          id: 'share-piece',
          label: 'Share a piece journal',
          subtitle: 'Pre-filled photo and caption from your studio',
          icon: BookOpen,
          onPress: onSharePiece,
        }]
      : [{
          id: 'create-post',
          label: 'Share your first post',
          subtitle: 'A photo, a caption, or an ask for advice',
          icon: ImagePlus,
          onPress: onCreatePost,
        }]),
    {
      id: 'ask',
      label: 'Ask a glaze question',
      subtitle: 'Text-only — no photo required',
      icon: HelpCircle,
      onPress: onAskCommunity,
    },
    {
      id: 'challenge',
      label: 'Join the challenge',
      subtitle: 'Monthly theme + community tag',
      icon: Trophy,
      onPress: onJoinChallenge,
    },
    {
      id: 'discover',
      label: 'Browse starter glaze recipes',
      subtitle: 'Nine recipes in Glaze Atlas · Discover',
      icon: Palette,
      onPress: onBrowseDiscover,
    },
  ];

  return (
    <Card
      className="p-4 mb-1"
      style={{ backgroundColor: COMMUNITY_THEME.cardBg, borderColor: COMMUNITY_THEME.cardBorder }}
    >
      <Text className="text-lg font-serif font-bold" style={{ color: COMMUNITY_THEME.ink }}>
        Welcome to the community
      </Text>
      <Text className="text-sm mt-1.5 leading-5" style={{ color: COMMUNITY_THEME.inkSoft }}>
        The feed grows as potters share work. Start here — or follow friends to see their posts.
      </Text>
      <View className="gap-2 mt-4">
        {actions.map((action) => (
          <WelcomeActionRow key={action.id} {...action} />
        ))}
      </View>
    </Card>
  );
}
