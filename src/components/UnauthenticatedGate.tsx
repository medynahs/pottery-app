import { MainTabHeader } from '@/src/components/MainTabHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { StudioTabScreen } from '@/src/components/StudioTabScreen';
import { Text } from '@/src/components/ui/text';
import { BrandColors } from '@/src/constants/theme';
import { useRouter } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

export interface UnauthenticatedGateProps {
  tabTitle: string;
  tabDescription: string;
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
}

/**
 * Full-tab sign-in prompt shared by Community and Profile when no session exists.
 */
export function UnauthenticatedGate({
  tabTitle,
  tabDescription,
  icon: Icon,
  title,
  description,
  features,
}: UnauthenticatedGateProps) {
  const router = useRouter();
  return (
    <StudioTabScreen>
      <MainTabHeader title={tabTitle} description={tabDescription} />
      <View className="flex-1 items-center justify-center px-8 gap-6">
        <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center">
          <Icon size={36} color={BrandColors.primary} />
        </View>
        <View className="items-center gap-2">
          <Text className="text-xl font-serif font-bold text-foreground text-center">
            {title}
          </Text>
          <Text className="text-sm text-muted-foreground text-center leading-relaxed">
            {description}
          </Text>
        </View>
        <View className="w-full gap-3">
          <PrimaryButton label="Create a free account" onPress={() => router.push('/register')} />
          <PrimaryButton variant="outline" label="Sign in" onPress={() => router.push('/login')} />
        </View>
        <View className="flex-row flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
          {features.map((f) => (
            <Text key={f} className="text-xs text-muted-foreground">✦ {f}</Text>
          ))}
        </View>
      </View>
    </StudioTabScreen>
  );
}
