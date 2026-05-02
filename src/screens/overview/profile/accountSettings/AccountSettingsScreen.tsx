import { ConfirmSheet } from '@/src/components/AppSheets';
import { SectionLabel } from '@/src/components/SectionLabel';
import { SettingsGroup } from '@/src/components/SettingsGroup';
import { SettingsRow } from '@/src/components/SettingsRow';
import { ToggleRow } from '@/src/components/ToggleRow';
import { Text } from '@/src/components/ui/text';
import { ME_QUERY_KEY } from '@/src/hooks/useCurrentUser';
import { presentCustomerCenter } from '@/src/hooks/useEntitlements';
import { oryLogout } from '@/src/services/auth';
import { useAppStore } from '@/src/store';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  Bell,
  ChevronDown,
  Clock,
  Crown,
  Flame,
  Globe,
  Lock,
  LogOut,
  Mail,
  Shield,
  Skull,
  Trophy,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

export default function AccountSettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const notificationPrefs = useAppStore((s) => s.notificationPrefs);
  const setNotificationPref = useAppStore((s) => s.setNotificationPref);
  const sessionToken  = useAppStore((s) => s.sessionToken);
  const oryEmail      = useAppStore((s) => s.oryEmail);
  const clearSession  = useAppStore((s) => s.clearSession);
  const isPremium     = useAppStore((s) => s.isPremium);
  const isAuthenticated = !!sessionToken;

  type Sheet = 'signout' | 'delete1' | 'delete2' | null;
  const [sheet, setSheet] = useState<Sheet>(null);
  const [busy, setBusy] = useState(false);

  async function doSignOut() {
    setBusy(true);
    try {
      if (sessionToken) await oryLogout(sessionToken);
    } catch {
      // clear regardless
    } finally {
      clearSession();
      queryClient.removeQueries({ queryKey: ME_QUERY_KEY });
      setBusy(false);
      setSheet(null);
      router.back();
    }
  }

  async function doDeleteAccount() {
    setBusy(true);
    try {
      if (sessionToken) await oryLogout(sessionToken);
    } catch {
      // swallow
    } finally {
      clearSession();
      queryClient.removeQueries({ queryKey: ME_QUERY_KEY });
      setBusy(false);
      setSheet(null);
      router.back();
    }
  }

  return (
    <View className="flex-1 bg-background">
      {/* Sign-out confirmation */}
      <ConfirmSheet
        visible={sheet === 'signout'}
        title="Sign out?"
        body="You'll need to sign in again to access your studio data."
        confirmLabel="Sign out"
        destructive
        loading={busy}
        onConfirm={doSignOut}
        onCancel={() => setSheet(null)}
      />

      {/* Delete step 1 */}
      <ConfirmSheet
        visible={sheet === 'delete1'}
        title="Delete your account?"
        body="This will permanently erase your pieces, glazes, and all studio data. It cannot be undone."
        confirmLabel="Yes, continue"
        destructive
        onConfirm={() => setSheet('delete2')}
        onCancel={() => setSheet(null)}
      />

      {/* Delete step 2 — final */}
      <ConfirmSheet
        visible={sheet === 'delete2'}
        title="This is permanent"
        body="Your entire Pottery Nook account will be deleted forever. There's no way back."
        confirmLabel="Delete my account forever"
        destructive
        loading={busy}
        onConfirm={doDeleteAccount}
        onCancel={() => setSheet(null)}
      />
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
        <SectionLabel title="Subscription" />
        <SettingsGroup>
          <SettingsRow
            icon={Crown}
            iconColor="hsl(39 57% 51%)"
            iconBg="bg-amber-50"
            label={isPremium ? 'Manage Subscription' : 'Upgrade to Premium'}
            value={isPremium ? 'Premium' : undefined}
            isLast
            onPress={isPremium ? () => void presentCustomerCenter() : () => router.push('/premium')}
          />
        </SettingsGroup>

        <SectionLabel title="Account" />

        {isAuthenticated ? (
          <>
            {/* Signed-in card */}
            <SettingsGroup>
              <SettingsRow icon={Mail}   iconColor="hsl(100 40% 45%)" iconBg="bg-green-50"  label="Change Email" />
              <SettingsRow icon={Lock}   iconColor="hsl(38 80% 50%)"  iconBg="bg-amber-50"  label="Change Password" />
              <SettingsRow icon={Globe}  iconColor="hsl(24 30% 45%)"  iconBg="bg-stone-100" label="Language" value="English" />
              <SettingsRow icon={Shield} iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50"   label="Privacy Settings" isLast onPress={() => router.push('/privacy-settings')} />
            </SettingsGroup>
          </>
        ) : (
          <View className="mx-6 mb-3 rounded-2xl border border-border bg-card px-4 py-3">
            <Text className="text-sm font-semibold text-foreground">Not signed in</Text>
            <Text className="text-xs text-muted-foreground mt-1 leading-4">
              Go to the Profile tab to create an account or sign in.
            </Text>
          </View>
        )}

        <SectionLabel title="Notifications" />
        <View className="mx-6 bg-card rounded-2xl border border-border px-4 mb-4">
          <ToggleRow icon={Flame} iconColor="hsl(25 90% 55%)" iconBg="bg-orange-50" label="Kiln Finished" value={notificationPrefs.kilnFinished} onToggle={() => setNotificationPref('kilnFinished', !notificationPrefs.kilnFinished)} />
          <ToggleRow icon={Clock} iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50" label="Drying Alert" value={notificationPrefs.pieceDrying} onToggle={() => setNotificationPref('pieceDrying', !notificationPrefs.pieceDrying)} />
          <ToggleRow icon={Trophy} iconColor="hsl(100 40% 45%)" iconBg="bg-green-50" label="Achievements" value={notificationPrefs.achievement} onToggle={() => setNotificationPref('achievement', !notificationPrefs.achievement)} />
          <ToggleRow icon={Bell} iconColor="hsl(270 60% 55%)" iconBg="bg-purple-50" label="Weekly Summary" value={notificationPrefs.weeklySummary} onToggle={() => setNotificationPref('weeklySummary', !notificationPrefs.weeklySummary)} isLast />
        </View>

        <SettingsGroup>
          {isAuthenticated ? (
            <>
              <SettingsRow
                icon={LogOut}
                iconColor="hsl(0 55% 45%)"
                iconBg="bg-red-50"
                label="Sign Out"
                danger
                onPress={() => setSheet('signout')}
              />
              <SettingsRow icon={Skull} iconColor="hsl(0 55% 45%)" iconBg="bg-red-50" label="Delete Account" danger isLast onPress={() => setSheet('delete1')} />
            </>
          ) : null}
        </SettingsGroup>

        <View className="px-6 mb-6">
          <Text className="text-xs text-muted-foreground text-center">Pottery Nook v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}
