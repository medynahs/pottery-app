import { TabBar } from '@/src/config/TabBar';
import type { Tab } from '../types';

export function ProfileTabBar({ active, onSelect }: { active: Tab; onSelect: (t: Tab) => void }) {
  return <TabBar active={active} onSelect={onSelect} />;
}
