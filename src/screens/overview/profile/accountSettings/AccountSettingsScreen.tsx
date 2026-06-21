import { ConfirmSheet } from '@/src/components/AppSheets';
import { KilnkinCompanionPickerSheet } from '@/src/components/KilnkinCompanionPickerSheet';
import { SectionLabel } from '@/src/components/SectionLabel';
import { SettingsGroup } from '@/src/components/SettingsGroup';
import { SettingsRow } from '@/src/components/SettingsRow';
import { SettingsHubShell } from '@/src/components/settings/SettingsHubShell';
import { ToggleRow } from '@/src/components/ToggleRow';
import { Text } from '@/src/components/ui/text';
import { ME_QUERY_KEY } from '@/src/hooks/useCurrentUser';
import { usePremiumGate } from '@/src/hooks/usePremiumGate';
import { AVAILABLE_KILNKIN_COMPANIONS, type KilnkinCompanion } from '@/src/screens/overview/kilnkin/kilnkinCompanion';
import { PremiumFeature } from '@/src/utils/premiumGate';
import { deleteAccount } from '@/src/services/api';
import { oryLogout } from '@/src/services/auth';
import type { NotificationEventKind } from '@/src/services/notificationMessages';
import { ensureNotificationPermission, scheduleKilnkinNotification } from '@/src/services/notifications';
import { useAppStore } from '@/src/store';
import { useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import {
  Bell,
  Clock,
  Crown,
  Flame,
  Globe,
  Lock,
  LogOut,
  Mail,
  PawPrint,
  Shield,
  Skull,
  Trophy,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { TouchableOpacity, View } from 'react-native';

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
  const [busy, setBusy] = useState(false);
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null);

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
      // The identity may already be gone server-side — local cleanup is enough.
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

  const sendTonePreview = async (companion: KilnkinCompanion) => {
    setPreviewLoadingId(companion.id);
    try {
      const scheduled = await scheduleKilnkinNotification({
        companion,
        kind: 'achievement',
        payload: { achievementName: 'Tone Preview' },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1,
          repeats: false,
        },
      });

      if (!scheduled) {
        showToast('Notification permission is required for preview', 'error');
        return;
      }

      showToast(`Preview queued for ${companion.name}`, 'success');
    } catch {
      showToast('Could not schedule preview notification', 'error');
    } finally {
      setPreviewLoadingId(null);
    }
  };

  const sendEventDebug = async (kind: NotificationEventKind) => {
    setPreviewLoadingId(kind);
    try {
      const payloadByKind: Partial<Record<NotificationEventKind, Record<string, string | number>>> = {
        'firing-scheduled': { firingName: 'Tonight Cone 6' },
        'stage-overage': { pieceName: 'River Mug', stageName: 'drying', days: 9 },
        'daily-mission': { missionCount: 2 },
        'challenge-deadline': { challengeTitle: 'Spring Mug Sprint', hoursLeft: 36 },
      };

      const scheduled = await scheduleKilnkinNotification({
        companion: kilnkinCompanion,
        kind,
        payload: payloadByKind[kind],
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 1,
          repeats: false,
        },
      });

      if (!scheduled) {
        showToast('Notification permission is required for debug send', 'error');
        return;
      }

      showToast(`Debug queued: ${kind}`, 'success');
    } catch {
      showToast('Could not schedule debug notification', 'error');
    } finally {
      setPreviewLoadingId(null);
    }
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
          <SettingsRow
            icon={PawPrint}
            iconColor="hsl(39 57% 51%)"
            iconBg="bg-primary/10"
            label="Your Kilnkin"
            value={`${kilnkinCompanion.name} · ${kilnkinCompanion.element}`}
            isLast
            onPress={() => {
              if (requestAccess(PremiumFeature.CompanionSwap)) {
                setCompanionPickerOpen(true);
              }
            }}
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

        {__DEV__ ? (
          <View className="mx-6 mb-4 rounded-2xl border border-border bg-card px-4 py-4">
            <Text className="text-sm font-semibold text-foreground">Notification Debug (Dev)</Text>
            <Text className="text-xs text-muted-foreground mt-1 mb-3">
              Send 1-second local notifications for voice and event testing.
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {AVAILABLE_KILNKIN_COMPANIONS.map((companion) => {
                const isLoading = previewLoadingId === companion.id;
                return (
                  <TouchableOpacity
                    key={companion.id}
                    onPress={() => void sendTonePreview(companion)}
                    disabled={isLoading}
                    activeOpacity={0.8}
                    className="px-3 py-2 rounded-xl border border-border bg-background"
                  >
                    <Text className="text-xs font-semibold text-foreground">
                      {isLoading ? `Sending ${companion.name}...` : `${companion.name} Preview`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View className="flex-row flex-wrap gap-2 mt-3">
              {([
                { kind: 'firing-scheduled', label: 'Firing Today' },
                { kind: 'stage-overage', label: 'Stage Overage' },
                { kind: 'daily-mission', label: 'Daily Mission' },
                { kind: 'challenge-deadline', label: 'Challenge Deadline' },
              ] as const).map((item) => {
                const isLoading = previewLoadingId === item.kind;
                return (
                  <TouchableOpacity
                    key={item.kind}
                    onPress={() => void sendEventDebug(item.kind)}
                    disabled={isLoading}
                    activeOpacity={0.8}
                    className="px-3 py-2 rounded-xl border border-border bg-background"
                  >
                    <Text className="text-xs font-semibold text-foreground">
                      {isLoading ? `Sending ${item.label}...` : item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : null}

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
