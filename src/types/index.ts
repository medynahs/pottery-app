// shared TypeScript interfaces and types

import type { PracticeMode, UserRole } from '../store/appStore';

export interface GlobalState {
  user?: {
    id: string;
    name: string;
  };
  practiceMode?: PracticeMode;
  role?: UserRole;
  enabledModules?: string[];
}
