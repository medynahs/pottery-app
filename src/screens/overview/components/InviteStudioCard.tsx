import { Text } from '@/src/components/ui/text';
import { BrandColors } from '@/src/constants/theme';
import { Building2, ChevronRight, Share2 } from 'lucide-react-native';
import React from 'react';
import { Share, TouchableOpacity, View } from 'react-native';

type InviteStudioCardProps = {
  onOpenStudios: () => void;
};

const INVITE_MESSAGE =
  "I'm tracking my pottery in Pottery Nook. If you run our shared studio, Pottery Nook can help with firing queues, schedules, and member updates — ask me for a join code when you're set up.";

export function InviteStudioCard({ onOpenStudios }: InviteStudioCardProps) {
  const handleShare = async () => {
    try {
      await Share.share({ message: INVITE_MESSAGE });
    } catch {
      // User dismissed share sheet
    }
  };

  return (
    <View
      className="mb-4 rounded-[22px] border overflow-hidden"
      style={{ borderColor: 'rgba(82, 107, 67, 0.28)', backgroundColor: 'rgba(238, 245, 233, 0.92)' }}
    >
      <View className="px-4 pt-4 pb-3">
        <View className="flex-row items-start gap-3">
          <View
            className="w-10 h-10 rounded-2xl items-center justify-center"
            style={{ backgroundColor: 'rgba(82, 107, 67, 0.14)' }}
          >
            <Building2 size={18} color="#526b43" />
          </View>
          <View className="flex-1">
            <Text className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
              Shared studio
            </Text>
            <Text className="text-base font-serif font-bold text-foreground leading-5">
              Your studio isn't on Pottery Nook yet
            </Text>
            <Text className="text-sm text-muted-foreground mt-1.5 leading-5">
              Keep logging your own pieces — when the owner joins, you can link for firing schedules and queue
              updates.
            </Text>
          </View>
        </View>

        <View className="flex-row gap-2 mt-4">
          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.85}
            className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border bg-card"
          >
            <Share2 size={14} color={BrandColors.primary} />
            <Text className="text-sm font-semibold text-primary">Invite owner</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onOpenStudios}
            activeOpacity={0.85}
            className="flex-1 flex-row items-center justify-center gap-1 py-2.5 rounded-xl bg-primary"
          >
            <Text className="text-sm font-semibold text-primary-foreground">Have a code?</Text>
            <ChevronRight size={14} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
