import { Banner } from '@/src/components/Banner';
import { LabeledInput } from '@/src/components/LabeledInput';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Text } from '@/src/components/ui/text';
import { requestPasswordReset } from '@/src/services/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ForgotPasswordScreen() {
  const params     = useLocalSearchParams<{ email?: string }>();
  const router     = useRouter();
  const safeInsets = useSafeAreaInsets();

  const [email, setEmail]     = useState(params.email ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [done, setDone]       = useState(false);

  async function handleSend() {
    setError(null);
    if (!email.trim()) { setError('Please enter your E-Mail.'); return; }
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send the reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleFinish() {
    if (router.canDismiss()) router.dismissAll();
    else router.back();
  }

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
              {done ? 'Check your inbox' : 'Recover account'}
            </Text>
            <Text className="text-sm text-muted-foreground mt-1.5 leading-5">
              {done
                ? 'We sent a password reset link to your E-Mail. Open it to choose a new password.'
                : "Enter your E-Mail and we'll send you a reset link"}
            </Text>
          </View>

          {error ? <Banner message={error} className="mb-5" /> : null}

          {done ? (
            <>
              <View className="items-center py-6">
                <View className="w-16 h-16 rounded-full bg-green-50 items-center justify-center mb-4">
                  <CheckCircle2 size={32} color="hsl(140 60% 40%)" />
                </View>
              </View>
              <PrimaryButton label="Back to sign in" onPress={handleFinish} />
            </>
          ) : (
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
                  onSubmitEditing={() => void handleSend()}
                  autoFocus={!email}
                  editable={!loading}
                />
              </View>
              <PrimaryButton label="Send reset link" loading={loading} onPress={() => void handleSend()} />
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
