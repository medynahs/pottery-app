import { AuthLandingScreen } from '@/src/screens/auth/AuthLandingScreen';
import ProfileScreen from '@/src/screens/overview/profile/ProfileScreen';
import { useAppStore } from '@/src/store';
import React from 'react';

export default function ProfileTab() {
  const isAuthenticated = useAppStore((s) => !!s.sessionToken);
  return isAuthenticated ? <ProfileScreen /> : <AuthLandingScreen />;
}
