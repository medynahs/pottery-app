import { Text } from '@/src/components/ui/text';
import { oryGoogleRegister } from '@/src/services/auth';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { LogIn, UserPlus } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Image, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function AuthLandingScreen() {
  const insets         = useSafeAreaInsets();
  const setSessionToken = useAppStore((s) => s.setSessionToken);
  const router         = useRouter();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    try {
      const result = await oryGoogleRegister();
      const email  = result.session.identity.traits.email;
      setSessionToken(result.session_token, result.session.identity.id, email);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google sign-in failed. Try again.');
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <View
      className="flex-1 bg-background items-center justify-center px-8"
      style={{ paddingBottom: insets.bottom + 24 }}
    >
      {/* Illustration */}
      <View className="w-24 h-24 rounded-3xl bg-amber-50 border border-amber-100 items-center justify-center mb-6">
        <Image
          source={require('../../../assets/images/clay-pet.png')}
          style={{ width: 56, height: 56 }}
          resizeMode="contain"
        />
      </View>

      <Text
        style={{ fontSize: 26, fontFamily: 'Fraunces_700Bold', color: 'hsl(24 30% 20%)', textAlign: 'center' }}
      >
        Save your studio 🏺
      </Text>
      <Text className="text-sm text-muted-foreground text-center mt-3 leading-5 mb-8" style={{ maxWidth: 280 }}>
        Create a free account to back up your pieces, firings, and progress across devices.
      </Text>

      {/* Error banner */}
      {error ? (
        <View className="w-full rounded-2xl bg-red-50 border border-red-200 px-4 py-3 mb-4">
          <Text className="text-sm text-red-600 text-center">{error}</Text>
        </View>
      ) : null}

      {/* Google */}
      <TouchableOpacity
        onPress={handleGoogle}
        disabled={googleLoading}
        activeOpacity={0.82}
        className="w-full h-14 rounded-2xl border border-border bg-card flex-row items-center justify-center gap-3 mb-3"
      >
        {googleLoading ? (
          <ActivityIndicator color="hsl(24 30% 40%)" />
        ) : (
          <>
            {/* Google "G" logo using SVG-approximation via text */}
            <View className="w-6 h-6 rounded-full bg-white border border-border items-center justify-center">
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#4285F4' }}>G</Text>
            </View>
            <Text className="text-sm font-semibold text-foreground">Continue with Google</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Divider */}
      <View className="flex-row items-center gap-3 w-full my-1">
        <View className="flex-1 h-px bg-border" />
        <Text className="text-xs text-muted-foreground">or</Text>
        <View className="flex-1 h-px bg-border" />
      </View>

      {/* Email register */}
      <TouchableOpacity
        onPress={() => router.push('/register')}
        activeOpacity={0.82}
        className="w-full h-14 rounded-2xl items-center justify-center flex-row gap-2 mt-1"
        style={{ backgroundColor: 'hsl(24 75% 45%)' }}
      >
        <UserPlus size={16} color="white" />
        <Text className="text-sm font-semibold text-white">Create account with email</Text>
      </TouchableOpacity>

      {/* Sign in */}
      <TouchableOpacity
        onPress={() => router.push('/login')}
        activeOpacity={0.75}
        className="w-full h-12 rounded-2xl items-center justify-center flex-row gap-2 mt-2 border border-border"
      >
        <LogIn size={15} color="hsl(24 30% 40%)" />
        <Text className="text-sm font-medium text-foreground">Sign in to existing account</Text>
      </TouchableOpacity>

      {/* Fine print */}
      <Text className="text-xs text-muted-foreground text-center mt-6 leading-4" style={{ maxWidth: 260 }}>
        Your local data is never deleted. An account only adds cloud backup.
      </Text>
    </View>
  );
}
