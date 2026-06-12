import { Banner } from '@/src/components/Banner';
import { LabeledInput } from '@/src/components/LabeledInput';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Text } from '@/src/components/ui/text';
import {
  oryGetSession,
  oryRecoveryStart,
  oryRecoverySubmitCode,
  orySetPassword,
} from '@/src/services/auth';
import { useAppStore } from '@/src/store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, KeyRound, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Step = 'email' | 'code' | 'password' | 'done';

const STEP_COPY: Record<Step, { title: string; subtitle: string }> = {
  email: {
    title: 'Recover account',
    subtitle: "Enter your E-Mail and we'll send you a recovery code",
  },
  code: {
    title: 'Check your inbox',
    subtitle: 'Enter the recovery code we just sent to your E-Mail',
  },
  password: {
    title: 'New password',
    subtitle: 'Choose a new password for your account',
  },
  done: {
    title: 'Password updated',
    subtitle: "You're signed in with your new password",
  },
};

export default function ForgotPasswordScreen() {
  const params          = useLocalSearchParams<{ email?: string }>();
  const setSessionToken = useAppStore((s) => s.setSessionToken);
  const router          = useRouter();
  const safeInsets      = useSafeAreaInsets();

  const [step, setStep]         = useState<Step>('email');
  const [email, setEmail]       = useState(params.email ?? '');
  const [code, setCode]         = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const [flowId, setFlowId]                 = useState<string | null>(null);
  const [recoveryToken, setRecoveryToken]   = useState<string | null>(null);
  const [settingsFlowId, setSettingsFlowId] = useState<string | null>(null);

  async function handleSendCode(isResend = false) {
    setError(null);
    if (!email.trim()) { setError('Please enter your E-Mail.'); return; }
    setLoading(true);
    try {
      const id = await oryRecoveryStart(email);
      setFlowId(id);
      setCode('');
      setStep('code');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send the recovery code. Please try again.');
      if (isResend) setStep('email');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitCode() {
    setError(null);
    if (!code.trim()) { setError('Please enter the recovery code.'); return; }
    if (!flowId) { setStep('email'); return; }
    setLoading(true);
    try {
      const r = await oryRecoverySubmitCode(flowId, code);
      setRecoveryToken(r.sessionToken);
      setSettingsFlowId(r.settingsFlowId);
      setStep('password');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'That code is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSetPassword() {
    setError(null);
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (!recoveryToken) { setStep('email'); return; }
    setLoading(true);
    try {
      await orySetPassword(recoveryToken, password, settingsFlowId);
      // The recovery session is a real session — sign the user in with it.
      const session = await oryGetSession(recoveryToken);
      setSessionToken(recoveryToken, session.identity.id, session.identity.traits.email);
      setStep('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update your password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleFinish() {
    // Dismiss this modal and the login modal beneath it in one go.
    if (router.canDismiss()) router.dismissAll();
    else router.back();
  }

  const copy = STEP_COPY[step];

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: safeInsets.top }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: safeInsets.bottom + 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="pt-12 pb-7">
            <Text style={{ fontSize: 28, fontFamily: 'Fraunces_700Bold', color: 'hsl(24 30% 20%)' }}>
              {copy.title}
            </Text>
            <Text className="text-sm text-muted-foreground mt-1.5 leading-5">
              {copy.subtitle}
            </Text>
          </View>

          {error ? <Banner message={error} className="mb-5" /> : null}

          {step === 'email' ? (
            <>
              <View className="mb-5">
                <LabeledInput
                  label="E-Mail"
                  icon={Mail}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your E-Mail"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  returnKeyType="send"
                  onSubmitEditing={() => void handleSendCode()}
                  autoFocus={!email}
                  editable={!loading}
                />
              </View>
              <PrimaryButton label="Send recovery code" loading={loading} onPress={() => void handleSendCode()} />
            </>
          ) : null}

          {step === 'code' ? (
            <>
              <View className="mb-5">
                <LabeledInput
                  label="Recovery Code"
                  icon={KeyRound}
                  value={code}
                  onChangeText={setCode}
                  placeholder="Enter the code from your E-Mail"
                  autoCapitalize="none"
                  keyboardType="number-pad"
                  autoComplete="one-time-code"
                  returnKeyType="done"
                  onSubmitEditing={() => void handleSubmitCode()}
                  autoFocus
                  editable={!loading}
                />
              </View>
              <PrimaryButton label="Verify code" loading={loading} onPress={() => void handleSubmitCode()} />
              <View className="flex-row items-center justify-center gap-1 mt-6">
                <Text className="text-sm text-muted-foreground">Didn't get the code?</Text>
                <TouchableOpacity onPress={() => void handleSendCode(true)} disabled={loading} hitSlop={8}>
                  <Text className="text-sm font-semibold text-primary">Resend</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}

          {step === 'password' ? (
            <>
              <View className="mb-5">
                <LabeledInput
                  label="New Password"
                  secure
                  value={password}
                  onChangeText={setPassword}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  returnKeyType="done"
                  onSubmitEditing={() => void handleSetPassword()}
                  autoFocus
                  editable={!loading}
                />
              </View>
              <PrimaryButton label="Set new password" loading={loading} onPress={() => void handleSetPassword()} />
            </>
          ) : null}

          {step === 'done' ? (
            <>
              <View className="items-center py-6">
                <View className="w-16 h-16 rounded-full bg-green-50 items-center justify-center mb-4">
                  <CheckCircle2 size={32} color="hsl(140 60% 40%)" />
                </View>
                <Text className="text-sm text-muted-foreground text-center leading-5">
                  Your password has been changed and you're signed in to your studio.
                </Text>
              </View>
              <PrimaryButton label="Back to your studio" onPress={handleFinish} />
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
