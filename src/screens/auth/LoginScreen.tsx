import { Text } from '@/src/components/ui/text';
import { oryGoogleSignIn, oryLogin } from '@/src/services/auth';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
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
  const [showPw, setShowPw]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  function handleDone(token: string, id: string, mail: string) {
    setSessionToken(token, id, mail);
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

          {error ? (
            <View className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 mb-5">
              <Text className="text-sm text-red-600">{error}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={handleGoogle}
            disabled={busy}
            activeOpacity={0.82}
            className="h-14 rounded-2xl border border-border bg-card flex-row items-center justify-center gap-3 mb-5"
          >
            {googleLoading ? (
              <ActivityIndicator color="hsl(24 30% 40%)" />
            ) : (
              <>
                <View className="w-6 h-6 rounded-full bg-white border border-border items-center justify-center">
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#4285F4' }}>G</Text>
                </View>
                <Text className="text-sm font-semibold text-foreground">Sign in with Google</Text>
              </>
            )}
          </TouchableOpacity>

          <View className="mb-1">
            <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              E-Mail
            </Text>
            <View className="flex-row items-center bg-card border border-border rounded-2xl px-4 h-14">
              <Mail size={16} color="hsl(24 20% 55%)" style={{ marginRight: 10 }} />
              <TextInput
                value={email}
                onChangeText={(v) => { setEmail(v); if (step === 'password') setStep('email'); }}
                placeholder="Enter your E-Mail"
                placeholderTextColor="hsl(24 10% 65%)"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={step === 'email' ? handleContinue : undefined}
                editable={!busy}
                style={{ flex: 1, fontSize: 14, color: 'hsl(24 30% 20%)' }}
              />
            </View>
          </View>

          <TouchableOpacity className="self-end py-2 mb-3" hitSlop={8}>
            <Text className="text-xs font-medium" style={{ color: 'hsl(24 75% 45%)' }}>
              Recover Account
            </Text>
          </TouchableOpacity>

          {step === 'password' ? (
            <View className="mb-5">
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Password
              </Text>
              <View className="flex-row items-center bg-card border border-border rounded-2xl px-4 h-14">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your Password"
                  placeholderTextColor="hsl(24 10% 65%)"
                  secureTextEntry={!showPw}
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={handleSignIn}
                  autoFocus
                  editable={!busy}
                  style={{ flex: 1, fontSize: 14, color: 'hsl(24 30% 20%)' }}
                />
                <TouchableOpacity onPress={() => setShowPw((v) => !v)} hitSlop={8}>
                  {showPw ? <EyeOff size={16} color="hsl(24 20% 55%)" /> : <Eye size={16} color="hsl(24 20% 55%)" />}
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={step === 'email' ? handleContinue : handleSignIn}
            disabled={busy}
            activeOpacity={0.82}
            className="h-14 rounded-2xl items-center justify-center"
            style={{ backgroundColor: busy ? 'hsl(24 40% 60%)' : 'hsl(24 75% 45%)' }}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-base font-semibold text-white">
                {step === 'email' ? 'Continue' : 'Sign in'}
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center justify-center gap-1 mt-6">
            <Text className="text-sm text-muted-foreground">Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push('/register')} hitSlop={8}>
              <Text className="text-sm font-semibold" style={{ color: 'hsl(24 75% 45%)' }}>Sign up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
