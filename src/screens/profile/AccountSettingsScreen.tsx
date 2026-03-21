import { Text } from '@/src/components/ui/text';
import { useRouter } from 'expo-router';
import {
    ChevronDown,
    Globe,
    HelpCircle,
    Lock,
    LogOut,
    Mail,
    Shield,
    Skull,
} from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SectionLabel, SettingsGroup, SettingsRow } from './shared';

export default function AccountSettingsScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background">
      <View className="flex-row items-center px-4 pt-14 pb-4 border-b border-border">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center rounded-full bg-muted/60 mr-3"
        >
          <ChevronDown size={20} color="hsl(24 30% 40%)" style={{ transform: [{ rotate: '90deg' }] }} />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground">Account Settings</Text>
          <Text className="text-xs text-muted-foreground mt-0.5">Profile security and account controls</Text>
        </View>
      </View>

      <ScrollView className="flex-1 mt-6" showsVerticalScrollIndicator={false}>
        <SectionLabel title="Account" />
        <SettingsGroup>
          <SettingsRow icon={Mail} iconColor="hsl(100 40% 45%)" iconBg="bg-green-50" label="Change Email" />
          <SettingsRow icon={Lock} iconColor="hsl(38 80% 50%)" iconBg="bg-amber-50" label="Change Password" />
          <SettingsRow icon={Globe} iconColor="hsl(24 30% 45%)" iconBg="bg-stone-100" label="Language" value="English" />
          <SettingsRow icon={Shield} iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50" label="Privacy Settings" isLast />
        </SettingsGroup>

        <SectionLabel title="Support" />
        <SettingsGroup>
          <SettingsRow icon={HelpCircle} iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50" label="FAQ" />
          <SettingsRow icon={Mail} iconColor="hsl(38 80% 50%)" iconBg="bg-amber-50" label="Contact Support" isLast />
        </SettingsGroup>

        <SettingsGroup>
          <SettingsRow icon={LogOut} iconColor="hsl(0 55% 45%)" iconBg="bg-red-50" label="Sign Out" danger />
          <SettingsRow icon={Skull} iconColor="hsl(0 55% 45%)" iconBg="bg-red-50" label="Delete Account" danger isLast />
        </SettingsGroup>

        <View className="px-6 mb-6">
          <Text className="text-xs text-muted-foreground text-center">Pottery Life v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}
