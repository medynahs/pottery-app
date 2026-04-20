import LoginScreen from './LoginScreen';

export function AuthLandingScreen() {
  // onSuccess is a no-op: when setSessionToken fires, profile.tsx
  // reactively switches to <ProfileScreen /> — no navigation needed.
  return <LoginScreen onSuccess={() => {}} />;
}
