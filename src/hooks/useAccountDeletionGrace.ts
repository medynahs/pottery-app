import {
  accountDeletionGraceSubtitle,
  daysRemainingInDeletionGrace,
  isAccountInDeletionGrace,
  isWithinDeletionGraceWindow,
} from '@/src/services/accountGrace';
import { useAppStore } from '@/src/store/appStore';

/** Shared grace-period state for restore UI (gate, banners, settings). */
export function useAccountDeletionGrace() {
  const accountDeletionGrace = useAppStore((s) => s.accountDeletionGrace);
  const accountDeletionScheduledAt = useAppStore((s) => s.accountDeletionScheduledAt);
  const inGrace = isAccountInDeletionGrace(accountDeletionGrace, accountDeletionScheduledAt);
  const subtitle = accountDeletionGraceSubtitle(accountDeletionScheduledAt);
  const daysLeft =
    accountDeletionScheduledAt && isWithinDeletionGraceWindow(accountDeletionScheduledAt)
      ? daysRemainingInDeletionGrace(accountDeletionScheduledAt)
      : null;

  return {
    inGrace,
    accountDeletionScheduledAt,
    subtitle,
    daysLeft,
  };
}
