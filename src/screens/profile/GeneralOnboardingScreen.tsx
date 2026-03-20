import { Input } from '@/src/components/ui/input';
import { Text } from '@/src/components/ui/text';
import { AVAILABLE_KILNKIN_COMPANIONS } from '@/src/screens/overview/kilnkinCompanion';
import {
    buildDefaultPricingSettings,
    PRICING_USER_TYPE_LABELS,
    type PricingUserType,
} from '@/src/screens/pieces/pricing';
import {
    useAppStore,
    type AppModule,
    type MeasurementUnit,
    type OnboardingPieceFocus,
    type OnboardingPracticeFrequency,
    type OnboardingUserType,
    type PracticeMode,
    type UserRole,
} from '@/src/store/appStore';
import { useRouter } from 'expo-router';
import {
    Bell,
    BriefcaseBusiness,
    Building2,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Flame,
    Hammer,
    HelpCircle,
    Home,
    Layers,
    Sparkles,
    Users,
    Wind,
} from 'lucide-react-native';
import React from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Switch,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { KilnType } from '../kiln/types';

type StepKey =
  | 'welcome'
  | 'role'
  | 'pricing'
  | 'kiln'
  | 'kilnkin'
  | 'home-setup'
  | 'routines'
  | 'preferences'
  | 'studio-preview'
  | 'ready';

type OnboardingDraft = {
  userType: OnboardingUserType;
  pricingUserType: PricingUserType;
  hasOwnKiln: boolean | null;
  studioName: string;
  kilnCount: string;
  kilnName: string;
  kilnType: KilnType;
  kilnNickname: string;
  homeStudioNotes: string;
  toolsChecklist: string;
  kilnkinId: string;
  routinesFrequency: OnboardingPracticeFrequency;
  routinesFocus: OnboardingPieceFocus;
  preferredUnits: MeasurementUnit;
  language: string;
  notificationsEnabled: boolean;
  quickTourRequested: boolean;
  activeModules: AppModule[];
};

type UserTypeConfig = {
  label: string;
  description: string;
  help: string;
  practiceMode: PracticeMode;
  role: UserRole;
  defaultModules: AppModule[];
  pricingUserType: PricingUserType;
  includeHomeSetup: boolean;
  icon: typeof Home;
};

const MODULE_OPTIONS: Array<{ id: AppModule; label: string; description: string }> = [
  { id: 'overview', label: 'Overview', description: 'Daily studio pulse and quick insights.' },
  { id: 'pieces', label: 'Pieces', description: 'Track pieces from forming to finished.' },
  { id: 'kiln', label: 'Kiln', description: 'Firing queues, logs, and kiln context.' },
  { id: 'library', label: 'Library', description: 'Learning, templates, glaze references, and reflections.' },
  { id: 'community', label: 'Community', description: 'Share progress and learn from others.' },
];

const USER_TYPE_CONFIG: Record<OnboardingUserType, UserTypeConfig> = {
  'home-potter': {
    label: 'Home Potter',
    description: 'You mostly create at home and may use your own kiln or a kiln service.',
    help: 'Great for personal practice with light operations.',
    practiceMode: 'home',
    role: 'owner',
    defaultModules: ['overview', 'pieces', 'kiln', 'library'],
    pricingUserType: 'hobby',
    includeHomeSetup: true,
    icon: Home,
  },
  'studio-potter': {
    label: 'Studio Potter',
    description: 'You mainly work in a shared studio environment.',
    help: 'Keeps tools focused on studio flow and shared firing context.',
    practiceMode: 'studio',
    role: 'member',
    defaultModules: ['overview', 'pieces', 'kiln', 'library', 'community'],
    pricingUserType: 'side-business',
    includeHomeSetup: false,
    icon: Building2,
  },
  'hybrid-potter': {
    label: 'Hybrid Potter',
    description: 'You split your practice between home and studio spaces.',
    help: 'Best balanced setup for mixed workflows.',
    practiceMode: 'both',
    role: 'owner',
    defaultModules: ['overview', 'pieces', 'kiln', 'library', 'community'],
    pricingUserType: 'side-business',
    includeHomeSetup: true,
    icon: Layers,
  },
  'studio-owner-technician': {
    label: 'Studio Owner / Technician',
    description: 'You run kilns, monitor firing consistency, and support members.',
    help: 'Uses a fuller operational setup with kiln-first defaults.',
    practiceMode: 'studio',
    role: 'owner',
    defaultModules: ['overview', 'pieces', 'kiln', 'library', 'community'],
    pricingUserType: 'full-time',
    includeHomeSetup: false,
    icon: Hammer,
  },
  teacher: {
    label: 'Teacher / Instructor',
    description: 'You coordinate lessons, demos, and student progress.',
    help: 'Keeps your flow structured and easy to revisit.',
    practiceMode: 'studio',
    role: 'owner',
    defaultModules: ['overview', 'pieces', 'kiln', 'library'],
    pricingUserType: 'side-business',
    includeHomeSetup: false,
    icon: Users,
  },
  'business-owner': {
    label: 'Small Business Owner',
    description: 'You create for sales, planning, and production consistency.',
    help: 'Enables fuller workflow defaults for sustainable operations.',
    practiceMode: 'both',
    role: 'owner',
    defaultModules: ['overview', 'pieces', 'kiln', 'library', 'community'],
    pricingUserType: 'full-time',
    includeHomeSetup: false,
    icon: BriefcaseBusiness,
  },
  'not-sure': {
    label: 'I’m Not Sure Yet',
    description: 'Start with a balanced setup and refine later in settings.',
    help: 'You can adjust role and modules at any time.',
    practiceMode: 'both',
    role: 'owner',
    defaultModules: ['overview', 'pieces', 'kiln', 'library', 'community'],
    pricingUserType: 'side-business',
    includeHomeSetup: false,
    icon: HelpCircle,
  },
};

const FREQUENCY_OPTIONS: OnboardingPracticeFrequency[] = ['daily', 'weekly', 'flexible'];
const FOCUS_OPTIONS: OnboardingPieceFocus[] = ['wheel', 'hand-building', 'glazing', 'reclaim'];
const UNIT_OPTIONS: MeasurementUnit[] = ['metric', 'imperial'];
const KILN_TYPE_OPTIONS: KilnType[] = ['electric', 'gas', 'wood', 'studio'];

function formatLabel(value: string) {
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-3 py-2 rounded-full border ${active ? 'bg-foreground border-foreground' : 'bg-card border-border'}`}
    >
      <Text className={`text-xs font-medium ${active ? 'text-background' : 'text-muted-foreground'}`}>{label}</Text>
    </Pressable>
  );
}

export default function GeneralOnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const onboardingProfile = useAppStore((state) => state.onboardingProfile);
  const kilnkinCompanion = useAppStore((state) => state.kilnkinCompanion);
  const user = useAppStore((state) => state.user);
  const kilns = useAppStore((state) => state.kilns);
  const completeGeneralOnboarding = useAppStore((state) => state.completeGeneralOnboarding);
  const setPracticeMode = useAppStore((state) => state.setPracticeMode);
  const setRole = useAppStore((state) => state.setRole);
  const setEnabledModules = useAppStore((state) => state.setEnabledModules);
  const setUser = useAppStore((state) => state.setUser);
  const setStudioRhythmConfig = useAppStore((state) => state.setStudioRhythmConfig);
  const setKilnkinCompanion = useAppStore((state) => state.setKilnkinCompanion);
  const addKiln = useAppStore((state) => state.addKiln);
  const completePricingOnboarding = useAppStore((state) => state.completePricingOnboarding);

  const [stepIndex, setStepIndex] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [draft, setDraft] = React.useState<OnboardingDraft>(() => ({
    userType: onboardingProfile.userType,
    pricingUserType: onboardingProfile.pricingUserType,
    hasOwnKiln: onboardingProfile.hasOwnKiln,
    studioName: onboardingProfile.studioName ?? user.studioName ?? '',
    kilnCount: onboardingProfile.kilnCount ? String(onboardingProfile.kilnCount) : '',
    kilnName: onboardingProfile.kilnName ?? '',
    kilnType: onboardingProfile.kilnType ?? 'electric',
    kilnNickname: onboardingProfile.kilnNickname ?? '',
    homeStudioNotes: onboardingProfile.homeStudioNotes ?? '',
    toolsChecklist: onboardingProfile.toolsChecklist ?? '',
    kilnkinId: onboardingProfile.kilnkinId ?? kilnkinCompanion.id,
    routinesFrequency: onboardingProfile.routinesFrequency,
    routinesFocus: onboardingProfile.routinesFocus,
    preferredUnits: onboardingProfile.preferredUnits,
    language: onboardingProfile.language,
    notificationsEnabled: onboardingProfile.notificationsEnabled,
    quickTourRequested: onboardingProfile.quickTourRequested,
    activeModules: onboardingProfile.activeModules.length
      ? onboardingProfile.activeModules
      : USER_TYPE_CONFIG[onboardingProfile.userType].defaultModules,
  }));

  const userTypeConfig = USER_TYPE_CONFIG[draft.userType];

  const steps = React.useMemo(() => {
    const sequence: StepKey[] = ['welcome', 'role', 'pricing', 'kiln', 'kilnkin'];
    if (userTypeConfig.includeHomeSetup) {
      sequence.push('home-setup');
    }
    sequence.push('routines', 'preferences', 'studio-preview', 'ready');
    return sequence;
  }, [userTypeConfig.includeHomeSetup]);

  React.useEffect(() => {
    if (stepIndex >= steps.length) {
      setStepIndex(steps.length - 1);
    }
  }, [stepIndex, steps.length]);

  const currentStep = steps[stepIndex];
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const updateDraft = React.useCallback((patch: Partial<OnboardingDraft>) => {
    setDraft((previous) => ({ ...previous, ...patch }));
  }, []);

  const toggleModule = React.useCallback((moduleId: AppModule) => {
    setDraft((previous) => {
      const exists = previous.activeModules.includes(moduleId);
      const next = exists
        ? previous.activeModules.filter((module) => module !== moduleId)
        : [...previous.activeModules, moduleId];

      return {
        ...previous,
        activeModules: next.includes('overview') ? next : ['overview', ...next],
      };
    });
  }, []);

  const optionalStep = currentStep === 'kiln' || currentStep === 'kilnkin' || currentStep === 'home-setup' || currentStep === 'routines' || currentStep === 'preferences';

  const handleSkip = () => {
    if (currentStep === 'kiln') {
      updateDraft({ hasOwnKiln: null, kilnName: '', kilnNickname: '', kilnCount: '' });
    }
    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  };

  const handleBack = () => {
    if (isSubmitting) return;
    setStepIndex((current) => Math.max(0, current - 1));
  };

  const handleFinish = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const selectedCompanion = AVAILABLE_KILNKIN_COMPANIONS.find((companion) => companion.id === draft.kilnkinId)
      ?? AVAILABLE_KILNKIN_COMPANIONS[0];

    const configuredModules: AppModule[] = draft.activeModules.length
      ? Array.from(new Set<AppModule>(['overview', ...draft.activeModules]))
      : userTypeConfig.defaultModules;

    setPracticeMode(userTypeConfig.practiceMode);
    setRole(userTypeConfig.role);
    setEnabledModules(configuredModules);
    setStudioRhythmConfig({
      wheelPractice: draft.routinesFocus === 'wheel' || draft.routinesFocus === 'hand-building',
      reclaimFocus: draft.routinesFocus === 'reclaim',
    });
    setKilnkinCompanion(selectedCompanion);

    if (draft.studioName.trim()) {
      setUser({ studioName: draft.studioName.trim() });
    }

    if (draft.hasOwnKiln && draft.kilnName.trim()) {
      const normalizedName = draft.kilnName.trim().toLowerCase();
      const exists = kilns.some((kiln) => kiln.name.trim().toLowerCase() === normalizedName);
      if (!exists) {
        addKiln({
          id: `kiln-${Date.now()}`,
          name: draft.kilnName.trim(),
          type: draft.kilnType,
          coneRange: 'Cone 6',
          shelves: Math.max(1, Number.parseInt(draft.kilnCount || '1', 10) || 1),
          size: 'Medium kiln',
          location: draft.studioName.trim() || 'Studio',
          notes: draft.kilnNickname.trim() ? `Nickname: ${draft.kilnNickname.trim()}` : '',
          createdAt: new Date().toISOString(),
        });
      }
    }

    completePricingOnboarding(draft.pricingUserType);
    completeGeneralOnboarding({
      userType: draft.userType,
      pricingUserType: draft.pricingUserType,
      hasOwnKiln: draft.hasOwnKiln,
      studioName: draft.studioName.trim() || undefined,
      kilnCount: draft.kilnCount ? Math.max(1, Number.parseInt(draft.kilnCount, 10) || 1) : undefined,
      kilnName: draft.kilnName.trim() || undefined,
      kilnType: draft.kilnType,
      kilnNickname: draft.kilnNickname.trim() || undefined,
      homeStudioNotes: draft.homeStudioNotes.trim() || undefined,
      toolsChecklist: draft.toolsChecklist.trim() || undefined,
      routinesFrequency: draft.routinesFrequency,
      routinesFocus: draft.routinesFocus,
      preferredUnits: draft.preferredUnits,
      language: draft.language.trim() || 'English',
      notificationsEnabled: draft.notificationsEnabled,
      quickTourRequested: draft.quickTourRequested,
      activeModules: configuredModules,
      kilnkinId: selectedCompanion.id,
    });

    router.replace('/overview' as never);
  };

  const handleContinue = () => {
    if (currentStep === 'ready') {
      handleFinish();
      return;
    }

    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  };

  const renderRoleStep = () => (
    <View className="gap-3 mt-3">
      {(Object.entries(USER_TYPE_CONFIG) as Array<[OnboardingUserType, UserTypeConfig]>).map(([key, option]) => {
        const Icon = option.icon;
        const active = draft.userType === key;
        return (
          <Pressable
            key={key}
            onPress={() => {
              const nextModules = USER_TYPE_CONFIG[key].defaultModules;
              updateDraft({
                userType: key,
                pricingUserType: USER_TYPE_CONFIG[key].pricingUserType,
                activeModules: nextModules,
              });
            }}
            className={`rounded-3xl border p-4 ${active ? 'border-foreground bg-card' : 'border-border bg-card/80'}`}
          >
            <View className="flex-row items-start gap-3">
              <View className={`w-11 h-11 rounded-2xl items-center justify-center ${active ? 'bg-foreground' : 'bg-muted'}`}>
                <Icon size={18} color={active ? 'hsl(34 35% 92%)' : 'hsl(24 20% 40%)'} />
              </View>
              <View className="flex-1">
                <Text className="text-base text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>{option.label}</Text>
                <Text className="text-xs text-muted-foreground mt-1 leading-5">{option.description}</Text>
                <Text className="text-[11px] text-primary mt-2">{option.help}</Text>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );

  const renderPricingStep = () => (
    <View className="gap-3 mt-3">
      <Text className="text-sm text-muted-foreground leading-6">
        Pricing is separate from your role. We suggest a starting profile based on your practice, but you can choose the one that fits you best.
      </Text>

      {(['hobby', 'side-business', 'full-time'] as PricingUserType[]).map((option) => {
        const preview = buildDefaultPricingSettings(option);
        const active = draft.pricingUserType === option;

        return (
          <Pressable
            key={option}
            onPress={() => updateDraft({ pricingUserType: option })}
            className={`rounded-3xl border p-4 ${active ? 'border-foreground bg-card' : 'border-border bg-card/80'}`}
          >
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1 pr-3">
                <Text className="text-base text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>
                  {PRICING_USER_TYPE_LABELS[option]}
                </Text>
                <Text className="text-xs text-muted-foreground mt-2 leading-5">
                  {option === 'hobby'
                    ? 'Recover material and time without pricing like a full business yet.'
                    : option === 'side-business'
                      ? 'Balanced pricing for regular selling, small drops, and growing studio income.'
                      : 'Built for sustainable wages, overhead, fees, and full-time studio pricing.'}
                </Text>
              </View>
              <View className={`w-6 h-6 rounded-full border items-center justify-center ${active ? 'border-foreground bg-foreground' : 'border-border bg-background'}`}>
                {active ? <View className="w-2.5 h-2.5 rounded-full bg-background" /> : null}
              </View>
            </View>

            <View className="mt-4 rounded-2xl border border-border bg-background px-4 py-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-xs text-muted-foreground">Making hours</Text>
                <Text className="text-xs font-medium text-foreground">{preview.defaultWorkHours.toFixed(2)} hr</Text>
              </View>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-xs text-muted-foreground">Labor rate</Text>
                <Text className="text-xs font-medium text-foreground">{preview.currencySymbol}{preview.hourlyLaborRate.toFixed(2)}/hr</Text>
              </View>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-xs text-muted-foreground">Clay cost</Text>
                <Text className="text-xs font-medium text-foreground">{preview.currencySymbol}{preview.clayPricePer10kg.toFixed(2)} per 10 kg</Text>
              </View>
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-xs text-muted-foreground">Fees + tax</Text>
                <Text className="text-xs font-medium text-foreground">{preview.sellingFeePct}% + {preview.taxPct}%</Text>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );

  const renderKilnStep = () => (
    <View className="mt-3">
      <Text className="text-sm text-muted-foreground leading-6">
        Do you have your own kiln? You can skip this now and set details later.
      </Text>

      <View className="flex-row gap-2 mt-3">
        <Pill label="Yes, I do" active={draft.hasOwnKiln === true} onPress={() => updateDraft({ hasOwnKiln: true })} />
        <Pill label="No, shared service" active={draft.hasOwnKiln === false} onPress={() => updateDraft({ hasOwnKiln: false })} />
      </View>

      {(draft.userType === 'studio-potter' || draft.userType === 'hybrid-potter' || draft.userType === 'studio-owner-technician' || draft.userType === 'teacher' || draft.userType === 'business-owner') ? (
        <View className="mt-4">
          <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Studio name</Text>
          <Input value={draft.studioName} onChangeText={(value) => updateDraft({ studioName: value })} placeholder="e.g. North Clay Collective" />
        </View>
      ) : null}

      {draft.userType === 'studio-owner-technician' ? (
        <View className="mt-4">
          <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">How many kilns do you manage? (optional)</Text>
          <Input value={draft.kilnCount} onChangeText={(value) => updateDraft({ kilnCount: value })} keyboardType="number-pad" placeholder="e.g. 3" />
        </View>
      ) : null}

      {draft.hasOwnKiln ? (
        <View className="mt-4 rounded-3xl border border-border bg-card p-4">
          <Text className="text-sm text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>Your first kiln</Text>
          <View className="mt-3">
            <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Kiln name</Text>
            <Input value={draft.kilnName} onChangeText={(value) => updateDraft({ kilnName: value })} placeholder="e.g. Ember One" />
          </View>

          <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mt-4 mb-2">Kiln type</Text>
          <View className="flex-row flex-wrap gap-2">
            {KILN_TYPE_OPTIONS.map((type) => (
              <Pill key={type} label={formatLabel(type)} active={draft.kilnType === type} onPress={() => updateDraft({ kilnType: type })} />
            ))}
          </View>

          <View className="mt-4">
            <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Optional nickname</Text>
            <Input value={draft.kilnNickname} onChangeText={(value) => updateDraft({ kilnNickname: value })} placeholder="e.g. Old Faithful" />
          </View>
        </View>
      ) : (
        <View className="mt-4 rounded-3xl border border-border bg-card p-4">
          <Text className="text-sm text-foreground">No problem — we’ll keep kiln tracking ready for shared or service firings.</Text>
        </View>
      )}
    </View>
  );

  const renderKilnkinStep = () => (
    <View className="mt-3 gap-3">
      <Text className="text-sm text-muted-foreground leading-6">
        Pick your Kilnkin companion. You can change it later.
      </Text>

      {AVAILABLE_KILNKIN_COMPANIONS.map((companion) => {
        const active = draft.kilnkinId === companion.id;
        const ElementIcon = companion.personality === 'playful' ? Wind : companion.personality === 'steady' ? Layers : Flame;
        const elementLabel = companion.personality === 'playful' ? 'Air' : companion.personality === 'steady' ? 'Earth' : 'Fire';

        return (
          <Pressable
            key={companion.id}
            onPress={() => updateDraft({ kilnkinId: companion.id })}
            className={`rounded-3xl border p-4 ${active ? 'border-foreground bg-card' : 'border-border bg-card/80'}`}
          >
            <View className="flex-row items-start gap-3">
              <View className={`w-11 h-11 rounded-2xl items-center justify-center ${active ? 'bg-foreground' : 'bg-muted'}`}>
                <ElementIcon size={18} color={active ? 'hsl(34 35% 92%)' : 'hsl(24 20% 40%)'} />
              </View>
              <View className="flex-1">
                <Text className="text-base text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>{companion.name}</Text>
                <Text className="text-xs text-muted-foreground mt-1">{companion.species} · {elementLabel}</Text>
                <Text className="text-xs text-muted-foreground mt-1">{companion.loves}</Text>
                <Text className="text-[11px] text-primary mt-2">Personality: {formatLabel(companion.personality)}</Text>
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );

  const renderHomeSetupStep = () => (
    <View className="mt-3">
      <Text className="text-sm text-muted-foreground leading-6">
        Optional home setup for your own space. Keep it light and refine later.
      </Text>

      <View className="mt-4">
        <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Material storage preference</Text>
        <Input
          value={draft.homeStudioNotes}
          onChangeText={(value) => updateDraft({ homeStudioNotes: value })}
          placeholder="e.g. Buckets by clay body, glaze shelf by cone"
        />
      </View>

      <View className="mt-4">
        <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Tools checklist (optional)</Text>
        <Input
          value={draft.toolsChecklist}
          onChangeText={(value) => updateDraft({ toolsChecklist: value })}
          placeholder="e.g. ribs, trimming tools, bands, test tiles"
        />
      </View>
    </View>
  );

  const renderRoutinesStep = () => (
    <View className="mt-3">
      <Text className="text-sm text-muted-foreground leading-6">
        Set your pottery rhythm. You can tweak this anytime.
      </Text>

      <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mt-4 mb-2">Practice frequency</Text>
      <View className="flex-row flex-wrap gap-2">
        {FREQUENCY_OPTIONS.map((option) => (
          <Pill key={option} label={formatLabel(option)} active={draft.routinesFrequency === option} onPress={() => updateDraft({ routinesFrequency: option })} />
        ))}
      </View>

      <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mt-4 mb-2">Current focus</Text>
      <View className="flex-row flex-wrap gap-2">
        {FOCUS_OPTIONS.map((option) => (
          <Pill key={option} label={formatLabel(option)} active={draft.routinesFocus === option} onPress={() => updateDraft({ routinesFocus: option })} />
        ))}
      </View>
    </View>
  );

  const renderPreferencesStep = () => (
    <View className="mt-3">
      <Text className="text-sm text-muted-foreground leading-6">
        Choose lightweight defaults so the app fits your workflow from day one.
      </Text>

      <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mt-4 mb-2">Units</Text>
      <View className="flex-row gap-2">
        {UNIT_OPTIONS.map((option) => (
          <Pill key={option} label={formatLabel(option)} active={draft.preferredUnits === option} onPress={() => updateDraft({ preferredUnits: option })} />
        ))}
      </View>

      <View className="mt-4">
        <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mb-1.5">Language</Text>
        <Input value={draft.language} onChangeText={(value) => updateDraft({ language: value })} placeholder="English" />
      </View>

      <View className="mt-4 rounded-2xl border border-border bg-card px-4 py-3 flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-sm text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>Gentle notifications</Text>
          <Text className="text-xs text-muted-foreground mt-1">Routine reminders and kiln status nudges.</Text>
        </View>
        <Switch
          value={draft.notificationsEnabled}
          onValueChange={(value) => updateDraft({ notificationsEnabled: value })}
          trackColor={{ false: '#D1D5DB', true: '#7A5A3A' }}
          thumbColor={draft.notificationsEnabled ? '#F5EFE6' : '#F8F4EF'}
        />
      </View>

      <Text className="text-[11px] font-semibold uppercase tracking-[1.5px] text-muted-foreground mt-4 mb-2">Active modules</Text>
      <View className="gap-2">
        {MODULE_OPTIONS.map((module) => {
          const active = draft.activeModules.includes(module.id);
          const isRequired = module.id === 'overview';
          return (
            <Pressable
              key={module.id}
              onPress={() => {
                if (isRequired) return;
                toggleModule(module.id);
              }}
              className={`rounded-2xl border px-4 py-3 ${active ? 'border-foreground bg-card' : 'border-border bg-card/70'}`}
            >
              <View className="flex-row items-center justify-between gap-3">
                <View className="flex-1 pr-3">
                  <Text className="text-sm text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>{module.label}</Text>
                  <Text className="text-xs text-muted-foreground mt-1">{module.description}</Text>
                </View>
                <Text className={`text-xs font-semibold ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                  {isRequired ? 'Required' : active ? 'On' : 'Off'}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  const renderStudioPreviewStep = () => {
    const selectedCompanion = AVAILABLE_KILNKIN_COMPANIONS.find((companion) => companion.id === draft.kilnkinId)
      ?? AVAILABLE_KILNKIN_COMPANIONS[0];

    return (
      <View className="mt-3">
        <Text className="text-sm text-muted-foreground leading-6 mb-3">
          Here’s your quick studio/home overview. This is where you’ll land to start creating.
        </Text>

        <View className="rounded-[28px] border border-border bg-card p-4">
          <View className="rounded-2xl bg-background border border-border px-4 py-3">
            <Text className="text-xs font-semibold uppercase tracking-[1.5px] text-muted-foreground">Studio Preview</Text>
            <Text className="text-base text-foreground mt-2" style={{ fontFamily: 'Fraunces_600SemiBold' }}>One active piece waiting for your first move</Text>
          </View>

          <View className="flex-row gap-3 mt-3">
            <View className="flex-1 rounded-2xl border border-border bg-background px-3 py-4">
              <Text className="text-[11px] text-muted-foreground uppercase tracking-[1.2px]">Piece shelf</Text>
              <Text className="text-sm text-foreground mt-2">Egg piece placeholder</Text>
            </View>
            <View className="flex-1 rounded-2xl border border-border bg-background px-3 py-4">
              <Text className="text-[11px] text-muted-foreground uppercase tracking-[1.2px]">Kiln zone</Text>
              <Text className="text-sm text-foreground mt-2">Ready for firing logs</Text>
            </View>
          </View>

          <View className="rounded-2xl border border-border bg-background px-3 py-4 mt-3">
            <Text className="text-sm text-foreground">{selectedCompanion.name} is waving and ready to cheer your next piece.</Text>
            <Text className="text-xs text-muted-foreground mt-2">Tip: tap + in Pieces to add your first form.</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderReadyStep = () => {
    const selectedCompanion = AVAILABLE_KILNKIN_COMPANIONS.find((companion) => companion.id === draft.kilnkinId)
      ?? AVAILABLE_KILNKIN_COMPANIONS[0];

    return (
      <View className="mt-3">
        <View className="rounded-[28px] border border-border bg-card p-5">
          <View className="flex-row items-center gap-2">
            <CheckCircle2 size={18} color="hsl(135 45% 35%)" />
            <Text className="text-base text-foreground" style={{ fontFamily: 'Fraunces_600SemiBold' }}>All set!</Text>
          </View>

          <Text className="text-sm text-muted-foreground leading-6 mt-3">
            Your studio profile, Kilnkin, and core preferences are ready.
          </Text>

          <View className="rounded-2xl border border-border bg-background px-4 py-4 mt-4">
            <Text className="text-xs text-muted-foreground">User type</Text>
            <Text className="text-sm text-foreground mt-1">{USER_TYPE_CONFIG[draft.userType].label}</Text>

            <Text className="text-xs text-muted-foreground mt-3">Companion</Text>
            <Text className="text-sm text-foreground mt-1">{selectedCompanion.name}</Text>

            <Text className="text-xs text-muted-foreground mt-3">Modules</Text>
            <Text className="text-sm text-foreground mt-1">{draft.activeModules.join(', ')}</Text>
          </View>

          <Pressable
            onPress={() => updateDraft({ quickTourRequested: !draft.quickTourRequested })}
            className={`mt-4 rounded-2xl border px-4 py-3 ${draft.quickTourRequested ? 'border-foreground bg-card' : 'border-border bg-background'}`}
          >
            <Text className={`text-sm font-medium ${draft.quickTourRequested ? 'text-foreground' : 'text-muted-foreground'}`}>
              {draft.quickTourRequested ? 'Quick tour requested' : 'Take a quick tour after entering'}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const headingByStep: Record<StepKey, string> = {
    welcome: 'Welcome to your cozy pottery companion',
    role: 'Who are you in your pottery practice?',
    pricing: 'Choose your pricing starting point',
    kiln: 'Kiln setup and studio context',
    kilnkin: 'Choose your Kilnkin companion',
    'home-setup': 'Optional home studio setup',
    routines: 'Set your pottery rhythm',
    preferences: 'Personal preferences and modules',
    'studio-preview': 'Quick studio / home overview',
    ready: 'Ready to create',
  };

  const subheadingByStep: Record<StepKey, string> = {
    welcome: 'Track, create, and celebrate every piece with calm guidance and playful support.',
    role: 'Your role helps tailor modules and defaults so the app feels focused from day one.',
    pricing: 'Pick the pricing profile that best matches how you make and sell right now.',
    kiln: 'Add what you know now, skip what you can decide later.',
    kilnkin: 'Pick the companion that matches your studio energy.',
    'home-setup': 'A few optional notes can make your home workflow smoother.',
    routines: 'Start simple. You can update goals and cadence in settings.',
    preferences: 'Choose units, language, reminders, and what modules are visible.',
    'studio-preview': 'A mini orientation before entering your full studio view.',
    ready: 'Your Kilnkin and studio are ready. Let’s begin your next piece.',
  };

  const renderCurrentStep = () => {
    if (currentStep === 'welcome') {
      return (
        <View className="mt-3 rounded-[30px] border border-border bg-card p-5">
          <View className="w-12 h-12 rounded-2xl bg-muted items-center justify-center">
            <Sparkles size={20} color="hsl(24 20% 40%)" />
          </View>
          <Text className="text-base text-foreground mt-4" style={{ fontFamily: 'Fraunces_600SemiBold' }}>
            Welcome to your creative pottery space.
          </Text>
          <Text className="text-sm text-muted-foreground mt-2 leading-6">
            Here, your pieces, studio flow, and Kilnkin help you track, learn, and celebrate every firing.
          </Text>
          <View className="mt-4 rounded-2xl border border-border bg-background px-4 py-3">
            <Text className="text-xs text-muted-foreground">You can skip optional setup steps and configure details later.</Text>
          </View>
        </View>
      );
    }

    if (currentStep === 'role') return renderRoleStep();
    if (currentStep === 'pricing') return renderPricingStep();
    if (currentStep === 'kiln') return renderKilnStep();
    if (currentStep === 'kilnkin') return renderKilnkinStep();
    if (currentStep === 'home-setup') return renderHomeSetupStep();
    if (currentStep === 'routines') return renderRoutinesStep();
    if (currentStep === 'preferences') return renderPreferencesStep();
    if (currentStep === 'studio-preview') return renderStudioPreviewStep();
    return renderReadyStep();
  };

  const primaryLabel = currentStep === 'ready'
    ? (isSubmitting ? 'Entering...' : 'Enter Studio')
    : currentStep === 'welcome'
      ? 'Let’s Begin'
      : 'Continue';

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          <View className="pt-5 pb-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-[11px] font-semibold uppercase tracking-[2px] text-primary">Onboarding</Text>
              <Text className="text-[11px] font-semibold text-muted-foreground">Step {stepIndex + 1} / {steps.length}</Text>
            </View>

            <View className="h-2 rounded-full bg-muted mt-3 overflow-hidden">
              <View className="h-2 rounded-full bg-foreground" style={{ width: `${progress}%` }} />
            </View>

            <Text className="text-3xl text-foreground mt-4" style={{ fontFamily: 'Fraunces_700Bold', lineHeight: 38 }}>
              {headingByStep[currentStep]}
            </Text>
            <Text className="text-sm text-muted-foreground mt-2 leading-6">
              {subheadingByStep[currentStep]}
            </Text>
          </View>

          {renderCurrentStep()}
        </ScrollView>

        <View className="px-6 pt-3 pb-6 border-t border-border bg-background" style={{ paddingBottom: insets.bottom + 12 }}>
          <View className="flex-row items-center justify-between mb-3">
            <Pressable
              onPress={handleBack}
              disabled={stepIndex === 0 || isSubmitting}
              className={`px-3 py-2 rounded-full border flex-row items-center gap-1 ${stepIndex === 0 ? 'border-border bg-card/60' : 'border-border bg-card'}`}
            >
              <ChevronLeft size={14} color="hsl(24 20% 45%)" />
              <Text className="text-xs text-muted-foreground">Back</Text>
            </Pressable>

            {optionalStep && !isSubmitting ? (
              <Pressable onPress={handleSkip} className="px-3 py-2 rounded-full">
                <Text className="text-xs font-medium text-muted-foreground">Skip for now</Text>
              </Pressable>
            ) : <View />}
          </View>

          <Pressable
            onPress={handleContinue}
            disabled={isSubmitting}
            className={`rounded-2xl py-4 items-center justify-center flex-row gap-2 ${isSubmitting ? 'bg-muted' : 'bg-foreground'}`}
          >
            {currentStep === 'ready' ? (
              <CheckCircle2 size={16} color="hsl(34 35% 92%)" />
            ) : (
              <ChevronRight size={16} color="hsl(34 35% 92%)" />
            )}
            <Text className="text-sm font-semibold text-background">{primaryLabel}</Text>
          </Pressable>

          <View className="mt-3 flex-row items-center justify-center gap-2">
            <Bell size={12} color="hsl(24 20% 45%)" />
            <Text className="text-[11px] text-muted-foreground">
              Calm defaults now, advanced setup later.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
