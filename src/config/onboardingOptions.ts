import {
    BriefcaseBusiness,
    Building2,
    Hammer,
    HelpCircle,
    Home,
    Layers,
} from 'lucide-react-native';
import { OnboardingUserType, StepKey, UserTypeConfig } from "../types/user";

export const USER_TYPE_CONFIG: Record<OnboardingUserType, UserTypeConfig> = {
   
    'studio-potter': {
        label: ' Shared Studio Potter',
        description: 'You mainly work in a shared studio environment.',
        help: 'Keeps tools focused on studio flow and shared firing context.',
        practiceMode: 'studio',
        role: 'member',
        defaultModules: ['overview', 'pieces', 'library', 'community'],
        pricingUserType: 'side-business',
        includeHomeSetup: false,
        icon: Building2,
    },
    'business-owner': {
        label: 'Production Potter',
        description: 'You make consistently for markets, commissions, or online sales.',
        help: 'Inventory tracking and production tools — with more coming in a future premium tier.',
        practiceMode: 'both',
        role: 'owner',
        defaultModules: ['overview', 'pieces', 'kiln', 'library', 'community'],
        pricingUserType: 'full-time',
        includeHomeSetup: false,
        icon: BriefcaseBusiness,
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
     'home-potter': {
        label: 'Home Potter',
        description: 'You mostly create at home and may use your own kiln or a kiln service.',
        help: 'Great for personal practice with light operations.',
        practiceMode: 'home',
        role: 'owner',
        defaultModules: ['overview', 'pieces', 'kiln', 'library', 'community'],
        pricingUserType: 'hobby',
        includeHomeSetup: true,
        icon: Home,
    },
    'not-sure': {
        label: 'Not Sure Yet',
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

export const headingByStep: Record<StepKey, string> = {
    welcome: 'Welcome to your cozy pottery studio',
    role: 'Who are you in your pottery practice?',
    kilnkin: 'Choose your Kilnkin companion',
    ready: 'Ready to create',
};

export const subheadingByStep: Record<StepKey, string> = {
    welcome: 'Track, create, and celebrate every piece with calm guidance and playful support.',
    role: 'Your role helps tailor modules and defaults so the app feels focused from day one.',
    kilnkin: 'Pick the companion that matches your studio energy.',
    ready: 'Your Kilnkin is ready. Setup quests are waiting inside your studio.',
};