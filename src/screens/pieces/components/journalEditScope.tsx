import React from 'react';

type JournalEditScopeValue = {
  requestDismiss: () => void;
  registerDismiss: (dismiss: (() => void) | null) => void;
};

export const JournalEditScope = React.createContext<JournalEditScopeValue | null>(null);

export function JournalEditProvider({ children }: { children: React.ReactNode }) {
  const dismissRef = React.useRef<(() => void) | null>(null);

  const value = React.useMemo(
    () => ({
      requestDismiss: () => dismissRef.current?.(),
      registerDismiss: (dismiss: (() => void) | null) => {
        dismissRef.current = dismiss;
      },
    }),
    [],
  );

  return <JournalEditScope.Provider value={value}>{children}</JournalEditScope.Provider>;
}
