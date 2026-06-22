import { USER_TYPE_CONFIG } from '@/src/config/onboardingOptions';
import { PracticeTypePickerSheet } from '@/src/components/PracticeTypePickerSheet';
import { ConfirmSheet } from '@/src/components/AppSheets';
import { NotificationDebugPanel } from '@/src/components/dev/NotificationDebugPanel';
import { KilnkinCompanionPickerSheet } from '@/src/components/KilnkinCompanionPickerSheet';
import { SectionLabel } from '@/src/components/SectionLabel';
import { SettingsGroup } from '@/src/components/SettingsGroup';
import { SettingsRow } from '@/src/components/SettingsRow';
import { SettingsHubShell } from '@/src/components/settings/SettingsHubShell';
import { ToggleRow } from '@/src/components/ToggleRow';
import { Text } from '@/src/components/ui/text';
import { ME_QUERY_KEY } from '@/src/hooks/useCurrentUser';
import { usePremiumGate } from '@/src/hooks/usePremiumGate';
import { PremiumFeature } from '@/src/utils/premiumGate';
import { deleteAccount } from '@/src/services/api';
import { oryLogout } from '@/src/services/auth';
import { ensureNotificationPermission } from '@/src/services/notifications';
import { useAppStore } from '@/src/store';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  Bell,
  Clock,
  Crown,
  Flame,
  Globe,
  Lock,
  Hammer,
  LogOut,
  Mail,
  Map,
  PawPrint,
  Shield,
  Skull,
  Trophy,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { View } from 'react-native';

export default function AccountSettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const notificationPrefs = useAppStore((s) => s.notificationPrefs);
  const setNotificationPref = useAppStore((s) => s.setNotificationPref);
  const kilnkinCompanion = useAppStore((s) => s.kilnkinCompanion);
  const setKilnkinCompanion = useAppStore((s) => s.setKilnkinCompanion);
  const sessionToken  = useAppStore((s) => s.sessionToken);
  const oryEmail      = useAppStore((s) => s.oryEmail);
  const clearSession  = useAppStore((s) => s.clearSession);
  const showToast     = useAppStore((s) => s.showToast);
  const isPremium     = useAppStore((s) => s.isPremium);
  const isAuthenticated = !!sessionToken;
  const { requestAccess, PaywallGate } = usePremiumGate();

  type Sheet = 'signout' | 'delete1' | 'delete2' | null;
  const [sheet, setSheet] = useState<Sheet>(null);
  const [companionPickerOpen, setCompanionPickerOpen] = useState(false);
  const [practiceTypeOpen, setPracticeTypeOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const userType = useAppStore((s) => s.onboardingProfile.userType);

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
    if (!sessionToken) return;
    setBusy(true);
    try {
      await deleteAccount(sessionToken);
    } catch {
      setBusy(false);
      setSheet(null);
      showToast('Could not delete your account. Please check your connection and try again.', 'error');
      return;
    }
    try {
      await oryLogout(sessionToken);
    } catch {
      // The identity may already be gone server-side, local cleanup is enough.
    }
    clearSession();
    queryClient.removeQueries({ queryKey: ME_QUERY_KEY });
    setBusy(false);
    setSheet(null);
    router.back();
    showToast('Your account has been deleted', 'success');
  }

  const toggleNotificationPref = async (key: keyof typeof notificationPrefs) => {
    const nextValue = !notificationPrefs[key];

    if (nextValue) {
      const granted = await ensureNotificationPermission();
      if (!granted) {
        return;
      }
    }

    setNotificationPref(key, nextValue);
  };

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

      {/* Delete step 2, final */}
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
      <SettingsHubShell
        title="Account Settings"
        subtitle="Profile security and account controls"
        onClose={() => router.back()}
      >
        <SectionLabel title="Subscription" />
        <SettingsGroup>
          <SettingsRow
            icon={Crown}
            iconColor="hsl(39 57% 51%)"
            iconBg="bg-amber-50"
            label={isPremium ? 'Manage Subscription' : 'Upgrade to Premium'}
            value={isPremium ? 'Premium' : undefined}
            onPress={() => router.push(isPremium ? '/manage-subscription' : '/premium')}
          />
        </SettingsGroup>

        <SectionLabel title="Studio" />
        <SettingsGroup>
          <SettingsRow
            icon={Hammer}
            iconColor="hsl(24 30% 45%)"
            iconBg="bg-stone-100"
            label="Practice type"
            value={USER_TYPE_CONFIG[userType]?.label ?? 'Not set'}
            onPress={() => setPracticeTypeOpen(true)}
          />
          <SettingsRow
            icon={PawPrint}
            iconColor="hsl(39 57% 51%)"
            iconBg="bg-primary/10"
            label="Your Kilnkin"
            value={`${kilnkinCompanion.name} · ${kilnkinCompanion.element}`}
            onPress={() => {
              if (requestAccess(PremiumFeature.CompanionSwap)) {
                setCompanionPickerOpen(true);
              }
            }}
          />
          <SettingsRow
            icon={Map}
            iconColor="hsl(200 45% 42%)"
            iconBg="bg-blue-50"
            label="Your Journey"
            value="Badges & milestones"
            isLast
            onPress={() => router.push('/profile/journey' as never)}
          />
        </SettingsGroup>

        <SectionLabel title="Account" />

        {isAuthenticated ? (
          <>
            {/* Signed-in card */}
            <SettingsGroup>
              {oryEmail ? (
                <SettingsRow icon={Mail} iconColor="hsl(100 40% 45%)" iconBg="bg-green-50" label="E-Mail" value={oryEmail} />
              ) : null}
              <SettingsRow icon={Lock}   iconColor="hsl(38 80% 50%)"  iconBg="bg-amber-50"  label="Change Password" onPress={() => router.push('/change-password')} />
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
          <ToggleRow icon={Flame} iconColor="hsl(39 57% 51%)" iconBg="bg-primary/10" label="Kiln Finished" value={notificationPrefs.kilnFinished} onToggle={() => void toggleNotificationPref('kilnFinished')} />
          <ToggleRow icon={Clock} iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50" label="Drying Alert" value={notificationPrefs.pieceDrying} onToggle={() => void toggleNotificationPref('pieceDrying')} />
          <ToggleRow icon={Trophy} iconColor="hsl(100 40% 45%)" iconBg="bg-green-50" label="Achievements" value={notificationPrefs.achievement} onToggle={() => void toggleNotificationPref('achievement')} />
          <ToggleRow icon={Bell} iconColor="hsl(270 60% 55%)" iconBg="bg-purple-50" label="Weekly Summary" value={notificationPrefs.weeklySummary} onToggle={() => void toggleNotificationPref('weeklySummary')} />
          <ToggleRow icon={Clock} iconColor="hsl(24 30% 45%)" iconBg="bg-stone-100" label="Daily Mission Reminder" value={notificationPrefs.dailyMission} onToggle={() => void toggleNotificationPref('dailyMission')} />
          <ToggleRow icon={Bell} iconColor="hsl(0 55% 45%)" iconBg="bg-red-50" label="Challenge Deadline" value={notificationPrefs.challengeDeadline} onToggle={() => void toggleNotificationPref('challengeDeadline')} isLast />
          <Text className="text-xs text-muted-foreground mt-3 mb-1">
            Notification voice follows {kilnkinCompanion.name}: {kilnkinCompanion.notificationToneLabel}.
          </Text>
        </View>

        <NotificationDebugPanel />

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
      </SettingsHubShell>

      <PracticeTypePickerSheet
        visible={practiceTypeOpen}
        onClose={() => setPracticeTypeOpen(false)}
      />
      <KilnkinCompanionPickerSheet
        visible={companionPickerOpen}
        currentCompanionId={kilnkinCompanion.id}
        onClose={() => setCompanionPickerOpen(false)}
        onConfirm={(companion) => {
          setKilnkinCompanion(companion);
          showToast(`${companion.name} is now your companion`, 'success');
        }}
      />
      {PaywallGate}
    </View>
  );
}
