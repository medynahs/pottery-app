import { Banner } from '@/src/components/Banner';
import { LabeledInput } from '@/src/components/LabeledInput';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Text } from '@/src/components/ui/text';
import { detectAccountDeletionGrace } from '@/src/services/accountGrace';
import { oryGoogleSignIn, oryLogin, OryUserCancelledError } from '@/src/services/auth';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  onSuccess?: () => void;
}

export default function LoginScreen({ onSuccess }: Props) {
  const setSessionToken = useAppStore((s) => s.setSessionToken);
  const router          = useRouter();
  const safeInsets      = useSafeAreaInsets();

  const [step, setStep]             = useState<'email' | 'password'>('email');
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  async function handleDone(token: string, id: string, mail: string) {
    setSessionToken(token, id, mail);
    const inGrace = await detectAccountDeletionGrace(token);
    if (inGrace) {
      useAppStore.getState().setAccountDeletionGrace(true);
    }
    if (onSuccess) onSuccess();
    else router.back();
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    try {
      const r = await oryGoogleSignIn();
      handleDone(r.session_token, r.session.identity.id, r.session.identity.traits.email);
    } catch (e) {
      if (e instanceof OryUserCancelledError) return;
      setError(e instanceof Error ? e.message : 'Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  }

  function handleContinue() {
    setError(null);
    if (!email.trim()) { setError('Please enter your E-Mail.'); return; }
    setStep('password');
  }

  async function handleSignIn() {
    setError(null);
    if (!password) { setError('Please enter your password.'); return; }
    setLoading(true);
    try {
      const r = await oryLogin(email, password);
      handleDone(r.session_token, r.session.identity.id, r.session.identity.traits.email);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const busy = loading || googleLoading;

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
              Sign in
            </Text>
            <Text className="text-sm text-muted-foreground mt-1.5 leading-5">
              Sign in with a social provider or your E-Mail
            </Text>
          </View>

          {error ? <Banner message={error} className="mb-5" /> : null}

          <View className="mb-5">
            <PrimaryButton
              variant="outline"
              label="Sign in with Google"
              loading={googleLoading}
              disabled={busy}
              onPress={() => void handleGoogle()}
              icon={<GoogleBadge />}
            />
          </View>

          <View className="mb-1">
            <LabeledInput
              label="E-Mail"
              icon={Mail}
              value={email}
              onChangeText={(v) => { setEmail(v); if (step === 'password') setStep('email'); }}
              placeholder="Enter your E-Mail"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={step === 'email' ? handleContinue : undefined}
              editable={!busy}
            />
          </View>

          <TouchableOpacity
            className="self-end py-2 mb-3"
            hitSlop={8}
            onPress={() => router.push({ pathname: '/forgot-password', params: email.trim() ? { email: email.trim() } : undefined })}
          >
            <Text className="text-xs font-medium text-primary">
              Recover Account
            </Text>
          </TouchableOpacity>

          {step === 'password' ? (
            <View className="mb-5">
              <LabeledInput
                label="Password"
                secure
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your Password"
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={() => void handleSignIn()}
                autoFocus
                editable={!busy}
              />
            </View>
          ) : null}

          <PrimaryButton
            label={step === 'email' ? 'Continue' : 'Sign in'}
            loading={loading}
            disabled={busy}
            onPress={step === 'email' ? handleContinue : () => void handleSignIn()}
          />

          <View className="flex-row items-center justify-center gap-1 mt-6">
            <Text className="text-sm text-muted-foreground">Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/register')} hitSlop={8}>
              <Text className="text-sm font-semibold text-primary">Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

export function GoogleBadge() {
  return (
    <View className="w-6 h-6 rounded-full bg-white border border-border items-center justify-center">
      <Text style={{ fontSize: 12, fontWeight: '700', color: '#4285F4' }}>G</Text>
    </View>
  );
}
