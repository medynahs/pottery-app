// src/screens/ProfileScreen.tsx
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { useRouter } from 'expo-router';
import {
  Award, BarChart2, Bell, BookOpen, Camera, ChevronLeft, ChevronRight,
  Clock, Database, Download, Edit3, ExternalLink, Flame, Globe,
  Heart, HelpCircle, Layers, Lock, LogOut, Mail, MapPin, Moon,
  Package, Palette, RefreshCw, Settings, Share2, Shield, Skull,
  Sliders, Sparkles, Star, Thermometer, TrendingUp, Trophy, Upload,
  User, Zap,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, Switch, TouchableOpacity, View } from 'react-native';

// ─── Helper Components ────────────────────────────────────────────────────────

function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View className="flex-row justify-between items-center mb-3 px-6">
      <Text className="text-xl font-serif font-bold text-foreground">{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text className="text-sm text-primary font-medium">{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function SettingsRow({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  onPress,
  isLast = false,
  danger = false,
}: {
  icon: React.ComponentType<{ size: number; color: string }>;
  iconColor: string;
  iconBg: string;
  label: string;
  value?: string;
  onPress?: () => void;
  isLast?: boolean;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.65}
      className={`flex-row items-center gap-3 py-3.5 ${!isLast ? 'border-b border-border' : ''}`}
    >
      <View className={`w-9 h-9 rounded-xl items-center justify-center ${iconBg}`}>
        <Icon size={17} color={iconColor} />
      </View>
      <Text className={`flex-1 text-sm font-medium ${danger ? 'text-destructive' : 'text-foreground'}`}>
        {label}
      </Text>
      {value && <Text className="text-muted-foreground text-sm mr-1">{value}</Text>}
      <ChevronRight size={15} color="hsl(24 20% 60%)" />
    </TouchableOpacity>
  );
}

function ToggleRow({
  icon: Icon,
  iconColor,
  iconBg,
  label,
  value,
  onToggle,
  isLast = false,
}: {
  icon: React.ComponentType<{ size: number; color: string }>;
  iconColor: string;
  iconBg: string;
  label: string;
  value: boolean;
  onToggle: () => void;
  isLast?: boolean;
}) {
  return (
    <View className={`flex-row items-center gap-3 py-3 ${!isLast ? 'border-b border-border' : ''}`}>
      <View className={`w-9 h-9 rounded-xl items-center justify-center ${iconBg}`}>
        <Icon size={17} color={iconColor} />
      </View>
      <Text className="flex-1 text-sm font-medium text-foreground">{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: 'hsl(34 25% 82%)', true: 'hsl(15 50% 50%)' }}
        thumbColor="white"
      />
    </View>
  );
}

function SettingsCard({ children }: { children: React.ReactNode }) {
  return (
    <View className="mx-6 bg-card rounded-2xl border border-border px-4 mb-6">
      {children}
    </View>
  );
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const ACHIEVEMENTS = [
  { icon: Trophy,   name: 'Centering Pro',   desc: '500 pieces',   bg: 'bg-amber-50',  border: 'border-amber-200',  iconColor: 'hsl(38 80% 50%)',   unlocked: true  },
  { icon: Flame,    name: 'Kiln Master',     desc: '50 firings',   bg: 'bg-orange-50', border: 'border-orange-200', iconColor: 'hsl(25 90% 55%)',   unlocked: true  },
  { icon: Star,     name: 'Glazing Artist',  desc: '100 glazed',   bg: 'bg-blue-50',   border: 'border-blue-200',   iconColor: 'hsl(213 80% 55%)',  unlocked: true  },
  { icon: Heart,    name: 'Resilient',       desc: '50 failures',  bg: 'bg-pink-50',   border: 'border-pink-200',   iconColor: 'hsl(340 75% 50%)',  unlocked: true  },
  { icon: BookOpen, name: 'Record Keeper',   desc: '1 yr journal', bg: 'bg-green-50',  border: 'border-green-200',  iconColor: 'hsl(145 50% 45%)',  unlocked: false },
  { icon: Sparkles, name: 'Perfectionist',   desc: '10 to gallery',bg: 'bg-purple-50', border: 'border-purple-200', iconColor: 'hsl(270 60% 55%)',  unlocked: false },
];

const FAVORITE_PIECES = [
  { id: 1, name: 'Speckled Mug', type: 'Mug',  emoji: '🏺', bg: 'bg-amber-100',  accent: 'hsl(38 55% 55%)' },
  { id: 2, name: 'Large Bowl',   type: 'Bowl', emoji: '🥣', bg: 'bg-stone-200',  accent: 'hsl(15 50% 50%)' },
  { id: 3, name: 'Teapot Set',   type: 'Set',  emoji: '🫖', bg: 'bg-blue-100',   accent: 'hsl(213 80% 55%)' },
  { id: 4, name: 'Vase No. 7',   type: 'Vase', emoji: '🏛️', bg: 'bg-green-100',  accent: 'hsl(100 40% 45%)' },
  { id: 5, name: 'Pinch Pot',    type: 'Pot',  emoji: '🫙', bg: 'bg-rose-100',   accent: 'hsl(340 60% 50%)' },
];

const TIMELINE = [
  { year: '2024', label: 'Reached 142 total pieces',         color: 'bg-primary' },
  { year: '2024', label: 'First successful Raku firing',      color: 'bg-orange-400' },
  { year: '2023', label: 'Joined community studio',          color: 'bg-blue-400' },
  { year: '2023', label: 'Completed first solo exhibition',  color: 'bg-purple-400' },
  { year: '2022', label: 'Started pottery journey',          color: 'bg-green-400' },
];

const STATS = [
  { label: 'Total Pieces',    value: '142',       icon: Layers,    color: 'hsl(213 80% 55%)',  bg: 'bg-blue-50' },
  { label: 'Pieces Finished', value: '89',        icon: Award,     color: 'hsl(100 40% 45%)',  bg: 'bg-green-50' },
  { label: 'Kiln Loads',      value: '18',        icon: Flame,     color: 'hsl(25 90% 55%)',   bg: 'bg-orange-50' },
  { label: 'Survival Rate',   value: '87%',       icon: TrendingUp,color: 'hsl(145 50% 45%)',  bg: 'bg-emerald-50' },
  { label: 'Cemetery',        value: '11',        icon: Skull,     color: 'hsl(0 55% 45%)',    bg: 'bg-red-50' },
  { label: 'Largest Batch',   value: '14 pcs',    icon: Package,   color: 'hsl(38 55% 55%)',   bg: 'bg-amber-50' },
  { label: 'Most in Firing',  value: '22 pcs',    icon: Zap,       color: 'hsl(270 60% 55%)',  bg: 'bg-purple-50' },
  { label: 'Top Clay Body',   value: 'Stoneware', icon: BarChart2, color: 'hsl(24 30% 45%)',   bg: 'bg-stone-200' },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const router = useRouter();
  const XP = 2340;
  const XP_MAX = 3000;
  const xpPct = XP / XP_MAX;

  const [notifs, setNotifs] = useState({
    kilnFinished:  true,
    pieceDrying:   true,
    bisqueReady:   true,
    achievement:   true,
    weeklySummary: false,
  });
  const toggle = (key: keyof typeof notifs) =>
    setNotifs(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>

      {/* ── Cover Strip ────────────────────────────────────────────────────── */}
      <View className="w-full h-44" style={{ backgroundColor: 'hsl(260 15% 48%)' }}>
        {/* Decorative blobs */}
        <View
          className="absolute bottom-0 right-0 w-36 h-36 rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', transform: [{ translateX: 24 }, { translateY: 24 }] }}
        />
        <View
          className="absolute top-6 left-10 w-24 h-24 rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
        />
        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.75}
          className="absolute top-14 left-4 bg-black/25 rounded-full p-2.5"
        >
          <ChevronLeft size={20} color="white" />
        </TouchableOpacity>
        {/* Edit cover */}
        <TouchableOpacity
          activeOpacity={0.75}
          className="absolute top-14 right-4 bg-black/25 rounded-full p-2.5"
        >
          <Camera size={16} color="white" />
        </TouchableOpacity>
      </View>

      {/* ── 1. Profile Header ───────────────────────────────────────────────── */}
      <View className="px-6 mb-6" style={{ marginTop: -44 }}>
        {/* Avatar row */}
        <View className="flex-row items-end justify-between mb-4">
          <View className="relative">
            <View
              className="w-22 h-22 rounded-full items-center justify-center border-4 border-background"
              style={{ width: 88, height: 88, backgroundColor: 'hsl(15 50% 50%)' }}
            >
              <Text className="text-white font-serif font-bold" style={{ fontSize: 36 }}>S</Text>
            </View>
            <View className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-background" />
          </View>
          <View className="flex-row gap-2 mb-1">
            <TouchableOpacity
              className="flex-row items-center gap-1.5 px-4 py-2 rounded-xl border border-border bg-card"
              activeOpacity={0.75}
            >
              <Edit3 size={14} color="hsl(15 50% 50%)" />
              <Text className="text-sm font-medium text-foreground">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="w-9 h-9 rounded-xl border border-border bg-card items-center justify-center"
              activeOpacity={0.75}
            >
              <Share2 size={15} color="hsl(24 20% 40%)" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Name + Level badge */}
        <View className="flex-row items-center gap-2 flex-wrap mb-0.5">
          <Text className="text-2xl font-serif font-bold text-foreground">Susan Mallory</Text>
          <View className="px-2.5 py-0.5 rounded-full" style={{ backgroundColor: 'hsl(260 15% 48%)' }}>
            <Text className="text-xs font-semibold text-white">✦ Lv. 12</Text>
          </View>
        </View>
        <Text className="text-sm font-medium text-primary mb-1">Mallory Clay Studio</Text>
        <Text className="text-sm text-muted-foreground leading-relaxed mb-3">
          Wheel-thrown stoneware with a love for imperfect forms. Teaching beginners on weekends.
        </Text>

        {/* Studio Motto */}
        <View className="bg-accent/10 border border-accent/25 rounded-2xl px-4 py-3 mb-3">
          <Text className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">Studio Motto</Text>
          <Text className="text-sm text-foreground font-serif italic">"Each imperfection is a signature."</Text>
        </View>

        {/* Meta row */}
        <View className="flex-row flex-wrap gap-x-5 gap-y-1.5 mb-3">
          <View className="flex-row items-center gap-1.5">
            <MapPin size={13} color="hsl(24 20% 40%)" />
            <Text className="text-xs text-muted-foreground">Portland, OR</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Globe size={13} color="hsl(24 20% 40%)" />
            <Text className="text-xs text-primary">malloryclay.com</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Clock size={13} color="hsl(24 20% 40%)" />
            <Text className="text-xs text-muted-foreground">Joined Jan 2022</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Mail size={13} color="hsl(24 20% 40%)" />
            <Text className="text-xs text-muted-foreground">susan@mallory.clay</Text>
          </View>
        </View>

        {/* Social / shop links */}
        <View className="flex-row flex-wrap gap-2 mb-4">
          {[
            { label: '@malloryclay', color: 'hsl(213 80% 55%)' },
            { label: 'Etsy Shop', color: 'hsl(38 80% 50%)' },
          ].map(({ label, color }) => (
            <TouchableOpacity
              key={label}
              className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card"
              activeOpacity={0.7}
            >
              <ExternalLink size={11} color={color} />
              <Text className="text-xs font-medium" style={{ color }}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Identity pills */}
        <View className="flex-row flex-wrap gap-2 mb-4">
          {[
            { label: 'Stoneware', emoji: '🪨' },
            { label: 'Soda Glaze', emoji: '✨' },
            { label: 'Wheel Throwing', emoji: '🏺' },
          ].map(({ label, emoji }) => (
            <View key={label} className="px-3 py-1.5 rounded-full bg-muted border border-border">
              <Text className="text-xs text-foreground font-medium">{emoji} {label}</Text>
            </View>
          ))}
        </View>

        {/* XP Progress */}
        <View className="bg-card border border-border rounded-2xl px-4 pt-3 pb-4">
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row items-center gap-1.5">
              <Zap size={14} color="hsl(38 80% 50%)" />
              <Text className="text-xs font-semibold text-foreground">Craft Artisan · Lv. 12</Text>
            </View>
            <Text className="text-xs text-muted-foreground">
              {XP.toLocaleString()} / {XP_MAX.toLocaleString()} XP
            </Text>
          </View>
          <View className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{ width: `${xpPct * 100}%`, backgroundColor: 'hsl(38 80% 50%)' }}
            />
          </View>
          <Text className="text-xs text-muted-foreground mt-1.5">
            {(XP_MAX - XP).toLocaleString()} XP until{' '}
            <Text className="font-semibold text-foreground">Master Potter</Text>
          </Text>
        </View>
      </View>

      {/* ── 2. Craft Journey Statistics ─────────────────────────────────────── */}
      <SectionHeader title="Craft Journey" action="See All" />
      <View className="px-6 mb-6">
        <View className="flex-row flex-wrap gap-3">
          {STATS.map(({ label, value, icon: Icon, color, bg }) => (
            <View key={label} className={`rounded-2xl border border-border p-4 ${bg}`} style={{ width: '47%' }}>
              <Icon size={18} color={color} style={{ marginBottom: 6 }} />
              <Text className="text-xl font-serif font-bold text-foreground">{value}</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">{label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── 3. Achievement Shelf ────────────────────────────────────────────── */}
      <SectionHeader title="Achievement Shelf" action="View All" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-6"
        contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
      >
        {ACHIEVEMENTS.map(({ icon: Icon, name, desc, bg, border, iconColor, unlocked }) => (
          <TouchableOpacity
            key={name}
            activeOpacity={0.75}
            className={`w-28 rounded-2xl border px-3 pt-4 pb-3 items-center ${bg} ${border} ${!unlocked ? 'opacity-50' : ''}`}
          >
            <View className="w-12 h-12 rounded-full bg-white/60 items-center justify-center mb-2">
              <Icon size={22} color={unlocked ? iconColor : 'hsl(24 20% 60%)'} />
            </View>
            <Text className="text-xs font-bold text-foreground text-center leading-tight">{name}</Text>
            <Text className="text-xs text-muted-foreground text-center mt-0.5">{desc}</Text>
            {!unlocked && (
              <View className="mt-1.5 px-2 py-0.5 bg-black/10 rounded-full">
                <Text className="text-xs text-muted-foreground">Locked</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── 4. Favorite Pieces Gallery ──────────────────────────────────────── */}
      <SectionHeader title="Favorite Pieces" action="Edit" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-6"
        contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
      >
        <TouchableOpacity
          activeOpacity={0.75}
          className="w-32 h-44 rounded-2xl border-2 border-dashed border-border items-center justify-center bg-card"
        >
          <Text className="text-3xl mb-1">+</Text>
          <Text className="text-xs text-muted-foreground font-medium">Pin a piece</Text>
        </TouchableOpacity>
        {FAVORITE_PIECES.map(({ id, name, type, emoji, bg, accent }) => (
          <TouchableOpacity
            key={id}
            activeOpacity={0.8}
            className={`w-32 h-44 rounded-2xl border border-border p-3 justify-between ${bg}`}
          >
            <View className="flex-1 items-center justify-center">
              <Text style={{ fontSize: 44 }}>{emoji}</Text>
            </View>
            <View>
              <Text className="text-xs font-bold text-foreground leading-snug">{name}</Text>
              <View className="flex-row items-center gap-1 mt-1">
                <View className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
                <Text className="text-xs text-muted-foreground">{type}</Text>
              </View>
              <View className="flex-row items-center gap-1 mt-1.5">
                <Heart size={10} color="hsl(340 75% 50%)" fill="hsl(340 75% 50%)" />
                <Text className="text-xs text-muted-foreground">Pinned</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── 5. Studio Timeline ──────────────────────────────────────────────── */}
      <SectionHeader title="Studio Timeline" action="Expand" />
      <View className="px-6 mb-6">
        <Card className="p-5">
          {TIMELINE.map(({ year, label, color }, i) => (
            <View key={i} className="flex-row gap-4">
              <View className="items-center" style={{ width: 20 }}>
                <View className={`w-3 h-3 rounded-full mt-1 ${color}`} />
                {i < TIMELINE.length - 1 && <View className="w-px flex-1 bg-border mt-1" />}
              </View>
              <View className={`flex-1 ${i < TIMELINE.length - 1 ? 'pb-4' : ''}`}>
                <Text className="text-xs font-semibold text-primary mb-0.5">{year}</Text>
                <Text className="text-sm text-foreground leading-relaxed">{label}</Text>
              </View>
            </View>
          ))}
        </Card>
      </View>

      {/* ── 6. Pottery Pet ──────────────────────────────────────────────────── */}
      <SectionHeader title="Pottery Pet" action="Customize" />
      <View className="px-6 mb-6">
        <Card className="overflow-hidden" style={{ backgroundColor: 'hsl(260 20% 97%)' }}>
          <View className="flex-row items-center p-5 gap-4">
            <View
              className="w-20 h-20 rounded-3xl items-center justify-center border border-border"
              style={{ backgroundColor: 'hsl(260 15% 88%)' }}
            >
              <Text style={{ fontSize: 42 }}>🐾</Text>
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-1">
                <Text className="text-base font-bold font-serif text-foreground">Cinder</Text>
                <View className="px-2 py-0.5 bg-green-100 rounded-full">
                  <Text className="text-xs text-green-700 font-medium">Happy 😊</Text>
                </View>
              </View>
              <Text className="text-xs text-muted-foreground mb-2">Kiln Cat · Lv. 5</Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-xs text-muted-foreground">Mood</Text>
                <View className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <View className="h-full w-4/5 rounded-full" style={{ backgroundColor: 'hsl(145 50% 45%)' }} />
                </View>
                <Text className="text-xs text-muted-foreground">80%</Text>
              </View>
            </View>
          </View>
          <View className="border-t border-border flex-row">
            {([
              { label: 'Change Pet', icon: RefreshCw },
              { label: 'Accessories', icon: Sparkles },
              { label: 'Unlock Pets', icon: Trophy },
            ] as const).map(({ label, icon: Icon }, i) => (
              <TouchableOpacity
                key={label}
                activeOpacity={0.7}
                className={`flex-1 py-3.5 items-center justify-center flex-row gap-1.5 ${i < 2 ? 'border-r border-border' : ''}`}
              >
                <Icon size={13} color="hsl(15 50% 50%)" />
                <Text className="text-xs font-medium text-primary">{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      </View>

      {/* ── 7. Studio Configuration ─────────────────────────────────────────── */}
      <SectionHeader title="Studio Configuration" />
      <SettingsCard>
        <SettingsRow icon={Layers}    iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50"    label="Stage Customization" value="6 stages" />
        <SettingsRow icon={Sliders}   iconColor="hsl(100 40% 45%)" iconBg="bg-green-50"   label="Feature Toggles"     value="All on" />
        <SettingsRow icon={Package}   iconColor="hsl(38 55% 55%)"  iconBg="bg-amber-50"   label="Batch Defaults" isLast />
      </SettingsCard>

      {/* ── 8. Studio Data Libraries ────────────────────────────────────────── */}
      <SectionHeader title="Studio Data Libraries" />
      <SettingsCard>
        <SettingsRow icon={Database}  iconColor="hsl(24 30% 45%)"  iconBg="bg-stone-100"  label="Clay Bodies"         value="4 saved" />
        <SettingsRow icon={Sparkles}  iconColor="hsl(270 60% 55%)" iconBg="bg-purple-50"  label="Glazes"              value="11 saved" />
        <SettingsRow icon={Layers}    iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50"    label="Piece Types" />
        <SettingsRow icon={MapPin}    iconColor="hsl(340 75% 50%)" iconBg="bg-pink-50"    label="Studio Locations"    value="2 spaces" />
        <SettingsRow icon={Zap}       iconColor="hsl(38 80% 50%)"  iconBg="bg-amber-50"   label="Surface Techniques" />
        <SettingsRow icon={Settings}  iconColor="hsl(24 20% 40%)"  iconBg="bg-stone-100"  label="Custom Fields" isLast />
      </SettingsCard>

      {/* ── 9. Kiln Configuration ───────────────────────────────────────────── */}
      <SectionHeader title="Kiln Configuration" />
      <SettingsCard>
        <SettingsRow icon={Thermometer} iconColor="hsl(0 55% 45%)"   iconBg="bg-red-50"    label="Kilns"        value="2 kilns" />
        <SettingsRow icon={Flame}       iconColor="hsl(25 90% 55%)"  iconBg="bg-orange-50" label="Bisque Cone"  value="Cone 06" />
        <SettingsRow icon={Zap}         iconColor="hsl(38 80% 50%)"  iconBg="bg-amber-50"  label="Glaze Cone"   value="Cone 6" isLast />
      </SettingsCard>

      {/* ── 10. Workflow Preferences ────────────────────────────────────────── */}
      <SectionHeader title="Workflow Preferences" />
      <SettingsCard>
        <SettingsRow icon={Layers}    iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50"   label="Default Stage"       value="Wedging" />
        <SettingsRow icon={Database}  iconColor="hsl(24 30% 45%)"  iconBg="bg-stone-100" label="Default Clay Body"    value="Stoneware" />
        <SettingsRow icon={MapPin}    iconColor="hsl(340 75% 50%)" iconBg="bg-pink-50"   label="Default Location"    value="Home Studio" />
        <SettingsRow icon={Sliders}   iconColor="hsl(100 40% 45%)" iconBg="bg-green-50"  label="Auto-advance Stages" value="On" />
        <SettingsRow icon={Clock}     iconColor="hsl(270 60% 55%)" iconBg="bg-purple-50" label="Stage History"        value="Enabled" isLast />
      </SettingsCard>

      {/* ── 11. Personal UI Preferences ─────────────────────────────────────── */}
      <SectionHeader title="Personal UI" />
      <SettingsCard>
        <SettingsRow icon={Moon}      iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50"   label="Theme"             value="Light" />
        <SettingsRow icon={Palette}   iconColor="hsl(15 50% 50%)"  iconBg="bg-red-50"    label="Accent Color"      value="Terracotta" />
        <SettingsRow icon={BarChart2} iconColor="hsl(100 40% 45%)" iconBg="bg-green-50"  label="Card Size"         value="Cozy" />
        <SettingsRow icon={Sliders}   iconColor="hsl(38 80% 50%)"  iconBg="bg-amber-50"  label="Animation Level"   value="Full" />
        <SettingsRow icon={Sparkles}  iconColor="hsl(270 60% 55%)" iconBg="bg-purple-50" label="Illustration Style" value="Organic" isLast />
      </SettingsCard>

      {/* ── 12. Notification Preferences ────────────────────────────────────── */}
      <SectionHeader title="Notifications" />
      <View className="mx-6 bg-card rounded-2xl border border-border px-4 mb-6">
        <ToggleRow icon={Flame}    iconColor="hsl(25 90% 55%)"  iconBg="bg-orange-50" label="Kiln Finished Firing"   value={notifs.kilnFinished}  onToggle={() => toggle('kilnFinished')} />
        <ToggleRow icon={Clock}    iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50"   label="Pieces Drying Too Long"  value={notifs.pieceDrying}   onToggle={() => toggle('pieceDrying')} />
        <ToggleRow icon={Zap}      iconColor="hsl(38 80% 50%)"  iconBg="bg-amber-50"  label="Pieces Ready for Bisque" value={notifs.bisqueReady}   onToggle={() => toggle('bisqueReady')} />
        <ToggleRow icon={Trophy}   iconColor="hsl(100 40% 45%)" iconBg="bg-green-50"  label="Achievement Unlocked"    value={notifs.achievement}   onToggle={() => toggle('achievement')} />
        <ToggleRow icon={Bell}     iconColor="hsl(270 60% 55%)" iconBg="bg-purple-50" label="Weekly Studio Summary"   value={notifs.weeklySummary} onToggle={() => toggle('weeklySummary')} isLast />
      </View>

      {/* ── 13. Studio Notes ────────────────────────────────────────────────── */}
      <SectionHeader title="Studio Notes" action="Add Note" />
      <View className="px-6 mb-6">
        <Card className="p-5">
          {[
            { emoji: '📝', title: 'Reclaim clay every 2 weeks',   preview: 'Keep scraps moist in the bucket until...' },
            { emoji: '🧪', title: 'Glaze test #14 — Soda Ash',   preview: 'Cone 6 reduction. Nice matte finish on...' },
            { emoji: '💡', title: 'Tip: Cylinder wall check',     preview: 'Measure thickness at base first before...' },
          ].map(({ emoji, title, preview }, i) => (
            <View key={i}>
              {i > 0 && <View className="h-px bg-border my-3" />}
              <TouchableOpacity activeOpacity={0.7} className="flex-row items-start gap-3">
                <Text className="text-xl mt-0.5">{emoji}</Text>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">{title}</Text>
                  <Text className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{preview}</Text>
                </View>
                <ChevronRight size={15} color="hsl(24 20% 60%)" />
              </TouchableOpacity>
            </View>
          ))}
        </Card>
      </View>

      {/* ── 14. Account Management ──────────────────────────────────────────── */}
      <SectionHeader title="Account" />
      <SettingsCard>
        <SettingsRow icon={User}      iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50"   label="Edit Profile" />
        <SettingsRow icon={Mail}      iconColor="hsl(100 40% 45%)" iconBg="bg-green-50"  label="Change Email" />
        <SettingsRow icon={Lock}      iconColor="hsl(38 80% 50%)"  iconBg="bg-amber-50"  label="Change Password" />
        <SettingsRow icon={Globe}     iconColor="hsl(24 30% 45%)"  iconBg="bg-stone-100" label="Language"    value="English" />
        <SettingsRow icon={BarChart2} iconColor="hsl(270 60% 55%)" iconBg="bg-purple-50" label="Dimensions"  value="cm" />
        <SettingsRow icon={Zap}       iconColor="hsl(25 90% 55%)"  iconBg="bg-orange-50" label="Weight Unit" value="kg" isLast />
      </SettingsCard>
      <SettingsCard>
        <SettingsRow icon={Star}   iconColor="hsl(38 80% 50%)"  iconBg="bg-amber-50" label="Leave a Review" />
        <SettingsRow icon={Shield} iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50"  label="Privacy Settings" isLast />
      </SettingsCard>
      <SettingsCard>
        <SettingsRow icon={LogOut} iconColor="hsl(0 55% 45%)" iconBg="bg-red-50" label="Sign Out" danger isLast />
      </SettingsCard>

      {/* ── 15. Help & Support ──────────────────────────────────────────────── */}
      <SectionHeader title="Help & Support" />
      <SettingsCard>
        <SettingsRow icon={HelpCircle} iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50"   label="FAQ" />
        <SettingsRow icon={BookOpen}   iconColor="hsl(100 40% 45%)" iconBg="bg-green-50"  label="Tutorials & Documentation" />
        <SettingsRow icon={Mail}       iconColor="hsl(38 80% 50%)"  iconBg="bg-amber-50"  label="Contact Support" />
        <SettingsRow icon={Shield}     iconColor="hsl(24 30% 45%)"  iconBg="bg-stone-100" label="Privacy Policy" />
        <SettingsRow icon={Zap}        iconColor="hsl(0 55% 45%)"   iconBg="bg-red-50"    label="Report a Bug" isLast />
      </SettingsCard>
      <View className="px-6 mb-6">
        <Text className="text-xs text-muted-foreground text-center">Pottery Life v1.0.0 · Made with ♥ for potters</Text>
      </View>

      {/* ── 16. Data Management ─────────────────────────────────────────────── */}
      <SectionHeader title="Data Management" />
      <SettingsCard>
        <SettingsRow icon={Download}  iconColor="hsl(213 80% 55%)" iconBg="bg-blue-50"   label="Export Studio Data" />
        <SettingsRow icon={Download}  iconColor="hsl(25 90% 55%)"  iconBg="bg-orange-50" label="Export Kiln Logs" />
        <SettingsRow icon={Download}  iconColor="hsl(270 60% 55%)" iconBg="bg-purple-50" label="Export Glaze Experiments" />
        <SettingsRow icon={RefreshCw} iconColor="hsl(100 40% 45%)" iconBg="bg-green-50"  label="Backup & Restore" />
        <SettingsRow icon={Upload}    iconColor="hsl(38 80% 50%)"  iconBg="bg-amber-50"  label="Import Studio Data" isLast />
      </SettingsCard>

      {/* ── Danger Zone ─────────────────────────────────────────────────────── */}
      <SectionHeader title="Danger Zone" />
      <SettingsCard>
        <SettingsRow icon={Skull} iconColor="hsl(0 55% 45%)" iconBg="bg-red-50" label="Delete Account" danger isLast />
      </SettingsCard>

      <View className="h-12" />
    </ScrollView>
  );
}
