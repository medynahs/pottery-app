import { Banner } from '@/src/components/Banner';
import { LabeledInput } from '@/src/components/LabeledInput';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Text } from '@/src/components/ui/text';
import { changePassword } from '@/src/services/auth';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ChangePasswordScreen() {
  const showToast  = useAppStore((s) => s.showToast);
  const router     = useRouter();
  const safeInsets = useSafeAreaInsets();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      await changePassword(password);
      showToast('Password updated', 'success');
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update your password. Please try again.');
    } finally {
      setLoading(false);
    }
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
              Change password
            </Text>
            <Text className="text-sm text-muted-foreground mt-1.5 leading-5">
              Choose a new password for your account
            </Text>
          </View>

          {error ? <Banner message={error} className="mb-5" /> : null}

          <View className="gap-4 mb-5">
            <LabeledInput
              label="New Password"
              secure
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              returnKeyType="next"
              autoFocus
              editable={!loading}
            />
            <LabeledInput
              label="Confirm Password"
              secure
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Repeat your new password"
              autoComplete="new-password"
              returnKeyType="done"
              onSubmitEditing={() => void handleSave()}
              editable={!loading}
            />
          </View>

          <PrimaryButton
            label="Update password"
            loading={loading}
            onPress={() => void handleSave()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
