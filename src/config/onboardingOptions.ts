import {
    BriefcaseBusiness,
    Building2,
    Hammer,
    HelpCircle,
    Home,
} from 'lucide-react-native';
import { OnboardingUserType, StepKey, UserTypeConfig } from "../types/user";

export const USER_TYPE_CONFIG: Record<OnboardingUserType, UserTypeConfig> = {

    'home-potter': {
        label: 'I make pottery at home',
        description: 'You throw, dry, and fire in your own space, your own kiln or a kiln service.',
        help: 'Personal practice with full kiln and piece tracking.',
        practiceMode: 'home',
        role: 'owner',
        defaultModules: ['overview', 'pieces', 'kiln', 'glaze-atlas', 'community'],
        pricingUserType: 'hobby',
        includeHomeSetup: true,
        icon: Home,
    },
    'studio-potter': {
        label: 'I work in a shared studio',
        description: 'You use a communal space for throwing, drying, and studio firings.',
        help: 'Focused on piece flow and shared firing context.',
        practiceMode: 'studio',
        role: 'member',
        defaultModules: ['overview', 'pieces', 'glaze-atlas', 'community'],
        pricingUserType: 'side-business',
        includeHomeSetup: false,
        icon: Building2,
    },
    'studio-owner-technician': {
        label: 'I run a ceramics studio',
        description: 'You fire pieces for members, manage kiln schedules, and keep the studio running.',
        help: 'Kiln-first setup with operational and member tools.',
        practiceMode: 'studio',
        role: 'owner',
        defaultModules: ['overview', 'pieces', 'kiln', 'community'],
        pricingUserType: 'full-time',
        includeHomeSetup: false,
        icon: Hammer,
    },
    'business-owner': {
        label: 'I make and sell pottery',
        description: 'Markets, commissions, or an online shop. Pottery is how you earn.',
        help: 'Production tracking, pricing, and sales tools.',
        practiceMode: 'both',
        role: 'owner',
        defaultModules: ['overview', 'pieces', 'glaze-atlas', 'community'],
        pricingUserType: 'full-time',
        includeHomeSetup: false,
        icon: BriefcaseBusiness,
    },
    'not-sure': {
        label: 'Not sure yet',
        description: 'Start with everything enabled and refine your setup later.',
        help: 'You can change your role at any time in settings.',
        practiceMode: 'both',
        role: 'owner',
        defaultModules: ['overview', 'pieces', 'kiln', 'glaze-atlas', 'community'],
        pricingUserType: 'side-business',
        includeHomeSetup: false,
        icon: HelpCircle,
    },
};

export const headingByStep: Record<StepKey, string> = {
    welcome: 'Welcome to your cozy pottery studio',
    role: 'Who are you in your pottery practice?',
    kilnkin: 'Choose your Kilnkin companion',
};

export const subheadingByStep: Record<StepKey, string> = {
    welcome: 'Track, create, and celebrate every piece with calm guidance and playful support.',
    role: 'This personalises your defaults. You can change it anytime in settings.',
    kilnkin: 'Pick the elemental companion that matches your studio energy.',
};