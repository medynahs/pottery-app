import { Banner } from '@/src/components/Banner';
import { LabeledInput } from '@/src/components/LabeledInput';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Text } from '@/src/components/ui/text';
import { markSessionBootstrap, refreshMeAfterSignIn } from '@/src/hooks/useCurrentUser';
import { detectAccountDeletionGrace } from '@/src/services/accountGrace';
import { googleSignIn, isExpoGo, register, UserCancelledError } from '@/src/services/auth';
import { useAppStore } from '@/src/store';
import { useQueryClient } from '@tanstack/react-query';
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
import { GoogleBadge } from './LoginScreen';

interface Props {
  onSuccess?: () => void;
}

export default function RegisterScreen({ onSuccess }: Props) {
  const setSignedIn = useAppStore((s) => s.setSignedIn);
  const queryClient = useQueryClient();
  const router      = useRouter();
  const safeInsets  = useSafeAreaInsets();

  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [loading, setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  async function handleDone(mail: string) {
    markSessionBootstrap();
    setSignedIn(mail);
    const profile = await refreshMeAfterSignIn(queryClient);
    if (!profile) {
      const inGrace = await detectAccountDeletionGrace();
      if (inGrace) useAppStore.getState().setAccountDeletionGrace(true);
      else if (mail) {
        const localPart = mail.split('@')[0]?.trim();
        if (localPart) {
          useAppStore.getState().setUser({
            name: localPart,
            avatarInitial: localPart[0]?.toUpperCase() ?? 'U',
          });
        }
      }
    }
    if (onSuccess) onSuccess();
    else router.back();
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    try {
      const mail = await googleSignIn();
      await handleDone(mail);
    } catch (e) {
      if (e instanceof UserCancelledError) return;
      setError(e instanceof Error ? e.message : 'Google sign-up failed.');
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleSignUp() {
    setError(null);
    if (!email.trim()) { setError('Please enter your E-Mail.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      await register(email, password);
      await handleDone(email.trim());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed. Please try again.');
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
              Register an account
            </Text>
            <Text className="text-sm text-muted-foreground mt-1.5 leading-5">
              Sign up with your email and a password or a social provider
            </Text>
          </View>

          {error ? <Banner message={error} className="mb-5" /> : null}

          {!isExpoGo ? (
            <View className="mb-5">
              <PrimaryButton
                variant="outline"
                label="Sign up with Google"
                loading={googleLoading}
                disabled={busy}
                onPress={() => void handleGoogle()}
                icon={<GoogleBadge />}
              />
            </View>
          ) : null}

          <View className="gap-4 mb-5">
            <LabeledInput
              label="E-Mail"
              icon={Mail}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your E-Mail"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              returnKeyType="next"
              editable={!busy}
            />
            <LabeledInput
              label="Password"
              secure
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your Password"
              autoComplete="new-password"
              returnKeyType="done"
              onSubmitEditing={() => void handleSignUp()}
              editable={!busy}
            />
          </View>

          <PrimaryButton
            label="Sign up"
            loading={loading}
            disabled={busy}
            onPress={() => void handleSignUp()}
          />

          <View className="flex-row items-center justify-center gap-1 mt-6">
            <Text className="text-sm text-muted-foreground">Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/login')} hitSlop={8}>
              <Text className="text-sm font-semibold text-primary">Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
