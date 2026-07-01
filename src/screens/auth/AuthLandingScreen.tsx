import { UnauthenticatedGate } from '@/src/components/UnauthenticatedGate';
import { UserRound } from 'lucide-react-native';
import React from 'react';

export function AuthLandingScreen() {
  return (
    <UnauthenticatedGate
      tabTitle="Profile"
      tabDescription="Your potter identity and progress"
      icon={UserRound}
      title="Make your studio yours"
      description="Create an account to back up your pieces, track your journey across devices, and join the potter community."
      features={['Cloud backup', 'Achievements', 'Friends & studios', 'Sync across devices']}
    />
  );
}
