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

export default function LoginScreen() {
  const setSessionToken = useAppStore((s) => s.setSessionToken);
  const router = useRouter();
  const safeInsets = useSafeAreaInsets();

  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    try {
      const result = await oryGoogleSignIn();
      const email_ = result.session.identity.traits.email;
      setSessionToken(result.session_token, result.session.identity.id, email_);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google sign-in failed.');
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleLogin() {
    setError(null);
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const result = await oryLogin(email, password);
      const email_ = result.session.identity.traits.email;
      setSessionToken(result.session_token, result.session.identity.id, email_);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: safeInsets.top }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: safeInsets.bottom + 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="pt-12 pb-8">
            <Text style={{ fontSize: 28, fontFamily: 'Fraunces_700Bold', color: 'hsl(24 30% 20%)' }}>
              Welcome back 🏺
            </Text>
            <Text className="text-sm text-muted-foreground mt-2 leading-5">
              Sign in to sync your studio across devices.
            </Text>
          </View>

          {/* Error */}
          {error ? (
            <View className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 mb-5">
              <Text className="text-sm text-red-600">{error}</Text>
            </View>
          ) : null}

          {/* Google */}
          <TouchableOpacity
            onPress={handleGoogle}
            disabled={googleLoading}
            activeOpacity={0.82}
            className="h-14 rounded-2xl border border-border bg-card flex-row items-center justify-center gap-3 mb-2"
          >
            {googleLoading ? (
              <ActivityIndicator color="hsl(24 30% 40%)" />
            ) : (
              <>
                <View className="w-6 h-6 rounded-full bg-white border border-border items-center justify-center">
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#4285F4' }}>G</Text>
                </View>
                <Text className="text-sm font-semibold text-foreground">Continue with Google</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center gap-3 mb-2">
            <View className="flex-1 h-px bg-border" />
            <Text className="text-xs text-muted-foreground">or</Text>
            <View className="flex-1 h-px bg-border" />
          </View>

          {/* Form */}
          <View className="gap-3">
            {/* Email */}
            <View>
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Email
              </Text>
              <View className="flex-row items-center bg-card border border-border rounded-2xl px-4 h-14">
                <Mail size={16} color="hsl(24 20% 55%)" style={{ marginRight: 10 }} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor="hsl(24 10% 65%)"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  returnKeyType="next"
                  style={{ flex: 1, fontSize: 14, color: 'hsl(24 30% 20%)' }}
                />
              </View>
            </View>

            {/* Password */}
            <View>
              <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Password
              </Text>
              <View className="flex-row items-center bg-card border border-border rounded-2xl px-4 h-14">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="hsl(24 10% 65%)"
                  secureTextEntry={!showPw}
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  style={{ flex: 1, fontSize: 14, color: 'hsl(24 30% 20%)' }}
                />
                <TouchableOpacity onPress={() => setShowPw((v) => !v)} hitSlop={8}>
                  {showPw
                    ? <EyeOff size={16} color="hsl(24 20% 55%)" />
                    : <Eye size={16} color="hsl(24 20% 55%)" />
                  }
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Sign in button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.82}
            className="mt-6 h-14 rounded-2xl items-center justify-center"
            style={{ backgroundColor: loading ? 'hsl(24 40% 60%)' : 'hsl(24 75% 45%)' }}
          >
            {loading
              ? <ActivityIndicator color="white" />
              : <Text className="text-base font-semibold text-white">Sign in</Text>
            }
          </TouchableOpacity>

          {/* Register link */}
          <View className="flex-row items-center justify-center gap-1 mt-5">
            <Text className="text-sm text-muted-foreground">No account yet?</Text>
            <TouchableOpacity onPress={() => router.replace('/register')} hitSlop={8}>
              <Text className="text-sm font-semibold" style={{ color: 'hsl(24 75% 45%)' }}>
                Create one
              </Text>
            </TouchableOpacity>
          </View>

          {/* Guest */}
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.7}
            className="mt-3 items-center py-2"
          >
            <Text className="text-xs text-muted-foreground">Continue without account</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
