import {
    Home,
} from 'lucide-react-native';
import { PracticeMode, UserRole } from "../store";
import { AppModule, MeasurementUnit, OnboardingPieceFocus, OnboardingPracticeFrequency } from "../store/appStore";
import { KilnType } from './kiln';
import { PricingUserType } from "./pricing";

export type OnboardingUserType =
    | 'home-potter'
    | 'studio-potter'
    | 'hybrid-potter'
    | 'studio-owner-technician'
    | 'business-owner'
    | 'not-sure';

export type UserTypeConfig = {
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


export type StepKey =
    | 'welcome'
    | 'role'
    | 'kilnkin'
    | 'ready';

export type OnboardingDraft = {
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
    studioCode: string;
};
