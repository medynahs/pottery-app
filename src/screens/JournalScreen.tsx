// src/screens/JournalScreen.tsx
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import {
  Award, Bookmark, BookOpen, BookOpenCheck, ChevronRight,
  Droplets, Flame, PenTool, ShoppingBag, Thermometer,
  Trash2, Wrench, X,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

// â”€â”€â”€ Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const TEMPLATES = [
  { title: 'Glaze Journal Template',         price: '$2.99', author: 'Studio Sarah', type: 'Journal'  },
  { title: 'The 30-Day Cylinder Challenge',  price: 'Free',  author: 'Potter Pete',  type: 'Roadmap'  },
];

const NOTES = [
  {
    title: 'Glaze combo test #4',
    date: 'Oct 18, 2024',
    tags: ['Glazing', 'Test Tile'],
    excerpt: 'Tried Amaco Ancient Jasper over Obsidian. The drip effect was incredible but ran a bit too much near the foot.',
  },
  {
    title: 'Throwing larger forms',
    date: 'Oct 15, 2024',
    tags: ['Wheel', 'Progress'],
    excerpt: 'Finally managed to center 5lbs of clay. Key was locking my left elbow into my hip. Still struggling with pulling up evenly.',
  },
  {
    title: 'Studio orientation notes',
    date: 'Oct 01, 2024',
    tags: ['Studio', 'Rules'],
    excerpt: 'Always clean the wheel pan thoroughly. Reclaim bucket for B-mix is the blue one in the corner.',
  },
];

const TOOLS = [
  { name: 'Sponge & Ribs',       label: 'Must Have', highlight: true  },
  { name: 'Advanced Extruders',  label: 'Later...',  highlight: false },
];

// Saved items from community (mimics what gets bookmarked)
const SAVED_GLAZE = [
  {
    name: "Yuki's Soda Matte #3",
    cone: 'Cone 6',
    atmosphere: 'Reduction',
    author: 'Yuki R.',
    avatarColor: 'hsl(213 80% 55%)',
    result: 'ðŸŒ«ï¸',
    tags: ['Soda', 'Matte', 'Reduction'],
    saveDate: 'Saved today',
  },
  {
    name: "Tariq's Iron Red",
    cone: 'Cone 10',
    atmosphere: 'Reduction',
    author: 'Tariq B.',
    avatarColor: 'hsl(25 90% 55%)',
    result: 'ðŸ”´',
    tags: ['Iron Red', 'Cone 10', 'High Fire'],
    saveDate: 'Saved 2 days ago',
  },
  {
    name: "Mara's Copper Green",
    cone: 'Cone 6',
    atmosphere: 'Oxidation',
    author: 'Mara L.',
    avatarColor: 'hsl(340 75% 50%)',
    result: 'ðŸŸ¢',
    tags: ['Copper', 'Green', 'Oxidation'],
    saveDate: 'Saved 5 days ago',
  },
];

const SAVED_TIPS = [
  {
    author: 'Tariq B.',
    avatarColor: 'hsl(25 90% 55%)',
    tip: 'When centering 5 kg+ of clay, brace your elbows on your knees and push from your core â€” not your arms.',
    tag: 'Centering',
    saveDate: 'Saved today',
  },
  {
    author: 'Yuki R.',
    avatarColor: 'hsl(213 80% 55%)',
    tip: 'For consistent teapot spout angles, make a paper template first and hold it against the pot before attaching.',
    tag: 'Form',
    saveDate: 'Saved 3 days ago',
  },
];

const SAVED_KILN = [
  {
    name: "Chen's Cone 6 Oxidation",
    type: 'Electric',
    cone: 'Cone 6',
    duration: '~8 hr',
    author: 'Chen W.',
    avatarColor: 'hsl(100 40% 45%)',
    saveDate: 'Saved 1 week ago',
  },
];

// â”€â”€â”€ Sub-screens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function LearnTab() {
  return (
    <>
      {/* Learning Roadmap */}
      <View className="px-6 pt-5 mb-8">
        <View className="rounded-3xl p-6 overflow-hidden" style={{ backgroundColor: 'hsl(145 20% 22%)' }}>
          <View className="flex-row items-center gap-2 mb-2">
            <Award size={14} color="rgba(255,255,255,0.7)" />
            <Text className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Current Roadmap
            </Text>
          </View>
          <Text className="text-2xl font-serif font-medium text-white mb-2">Beginner Fundamentals</Text>
          <Text className="text-sm mb-5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Master the wheel. Focus: Wedging, Centering, Opening.
          </Text>
          <View className="w-full h-3 rounded-full mb-3 overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <View className="h-full rounded-full w-[65%]" style={{ backgroundColor: 'hsl(120 25% 72%)' }} />
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Stage: Beginner</Text>
            <TouchableOpacity className="flex-row items-center gap-1">
              <Text className="text-sm font-medium" style={{ color: 'hsl(120 25% 72%)' }}>View Roadmap</Text>
              <ChevronRight size={16} color="hsl(120 25% 72%)" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Marketplace & Tool Guide */}
      <View className="px-6 flex-row gap-4 mb-8">
        <TouchableOpacity className="flex-1" activeOpacity={0.8}>
          <Card className="p-4 items-center">
            <View className="w-12 h-12 rounded-2xl bg-accent/15 items-center justify-center mb-2">
              <ShoppingBag size={22} color="hsl(38 55% 45%)" />
            </View>
            <Text className="font-serif font-medium text-sm text-foreground">Marketplace</Text>
            <Text className="text-[10px] text-muted-foreground mt-1">Buy/Sell Templates</Text>
          </Card>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1" activeOpacity={0.8}>
          <Card className="p-4 items-center">
            <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center mb-2">
              <Wrench size={22} color="hsl(15 50% 50%)" />
            </View>
            <Text className="font-serif font-medium text-sm text-foreground">Tool Guide</Text>
            <Text className="text-[10px] text-muted-foreground mt-1">Gear by Level</Text>
          </Card>
        </TouchableOpacity>
      </View>

      {/* Beginner Essentials */}
      <View className="px-6 mb-8">
        <Card className="p-5">
          <View className="flex-row gap-4 items-center mb-4">
            <View className="w-16 h-16 rounded-2xl bg-muted items-center justify-center flex-shrink-0">
              <Wrench size={26} color="hsl(24 20% 40%)" />
            </View>
            <View className="flex-1">
              <Text className="font-serif font-medium text-foreground">Beginner Essentials</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">"You don't need a Giffin Grip yet!"</Text>
            </View>
          </View>
          <View className="gap-2">
            {TOOLS.map((tool, i) => (
              <View
                key={i}
                className={`flex-row items-center justify-between px-3 py-2 rounded-xl ${tool.highlight ? 'bg-muted/60' : 'bg-muted/30 opacity-60'}`}
              >
                <Text className="text-xs font-medium text-foreground">{tool.name}</Text>
                <Text className={`text-xs font-bold ${tool.highlight ? 'text-primary' : 'text-muted-foreground'}`}>
                  {tool.label}
                </Text>
              </View>
            ))}
          </View>
        </Card>
      </View>

      {/* Popular Templates */}
      <View className="px-6 mb-8">
        <Text className="font-serif text-xl font-bold text-foreground mb-4">Popular Templates</Text>
        <View className="gap-3">
          {TEMPLATES.map((tmpl, i) => (
            <Card key={i} className="p-4 flex-row justify-between items-center">
              <View className="flex-1 mr-3">
                <Text className="text-[10px] uppercase tracking-wider text-primary font-bold mb-0.5">{tmpl.type}</Text>
                <Text className="font-medium text-sm text-foreground">{tmpl.title}</Text>
                <Text className="text-xs text-muted-foreground mt-0.5">by {tmpl.author}</Text>
              </View>
              <View className="items-end">
                <Text className="font-bold text-sm text-foreground mb-1">{tmpl.price}</Text>
                <Button variant="outline" size="sm" className="h-7 px-2">
                  <Text className="text-[10px]">Preview</Text>
                </Button>
              </View>
            </Card>
          ))}
        </View>
      </View>

      <View className="px-6 mb-10">
        <TouchableOpacity activeOpacity={0.8}>
          <View className="rounded-2xl border-2 border-dashed border-primary/40 p-5 bg-primary/5 flex-row items-center justify-between">
            <View className="flex-row items-center gap-4 flex-1">
              <View className="w-10 h-10 rounded-xl bg-primary/20 items-center justify-center">
                <BookOpenCheck size={18} color="hsl(15 50% 50%)" />
              </View>
              <View>
                <Text className="font-medium text-sm text-foreground">Explore Templates</Text>
                <Text className="text-xs text-muted-foreground">Find new roadmaps & checklists</Text>
              </View>
            </View>
            <ChevronRight size={18} color="hsl(24 20% 40%)" />
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
}

function SavedTab() {
  const [glazes, setGlazes]   = useState(SAVED_GLAZE);
  const [tips, setTips]       = useState(SAVED_TIPS);
  const [kilns, setKilns]     = useState(SAVED_KILN);

  const removeGlaze = (i: number) => setGlazes(g => g.filter((_, idx) => idx !== i));
  const removeTip   = (i: number) => setTips(t => t.filter((_, idx) => idx !== i));
  const removeKiln  = (i: number) => setKilns(k => k.filter((_, idx) => idx !== i));

  const total = glazes.length + tips.length + kilns.length;

  if (total === 0) {
    return (
      <View className="px-6 pt-16 items-center">
        <Text style={{ fontSize: 52 }}>ðŸ”–</Text>
        <Text className="text-xl font-serif font-bold text-foreground mt-4 text-center">Nothing saved yet</Text>
        <Text className="text-sm text-muted-foreground mt-2 text-center leading-relaxed">
          Browse the Community feed and tap{' '}
          <Text className="font-semibold text-foreground">Save</Text>{' '}
          on glaze recipes, tips, and kiln schedules to collect them here.
        </Text>
      </View>
    );
  }

  return (
    <View className="pt-5 pb-12">

      {/* â”€â”€ Glaze Recipes â”€â”€ */}
      {glazes.length > 0 && (
        <View className="mb-8">
          <View className="flex-row items-center gap-2 px-6 mb-3">
            <Droplets size={15} color="hsl(213 80% 55%)" />
            <Text className="text-lg font-serif font-bold text-foreground">Glaze Recipes</Text>
            <View className="ml-auto px-2 py-0.5 rounded-full bg-blue-100">
              <Text className="text-xs font-bold" style={{ color: 'hsl(213 80% 55%)' }}>{glazes.length}</Text>
            </View>
          </View>
          <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
          >
            {glazes.map((g, i) => (
              <View key={i} className="w-52 rounded-2xl border border-blue-200 bg-blue-50 overflow-hidden">
                {/* Remove button */}
                <TouchableOpacity
                  onPress={() => removeGlaze(i)}
                  className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-white/80 items-center justify-center"
                  activeOpacity={0.7}
                >
                  <X size={12} color="hsl(24 20% 40%)" />
                </TouchableOpacity>

                <View className="items-center py-5">
                  <Text style={{ fontSize: 48 }}>{g.result}</Text>
                </View>
                <View className="bg-card/90 px-4 pb-4 pt-3">
                  <Text className="text-sm font-bold text-foreground leading-tight mb-0.5">{g.name}</Text>
                  <View className="flex-row items-center gap-1.5 mb-2">
                    <View className="w-5 h-5 rounded-full items-center justify-center" style={{ backgroundColor: g.avatarColor }}>
                      <Text className="text-white font-bold" style={{ fontSize: 9 }}>{g.author[0]}</Text>
                    </View>
                    <Text className="text-xs text-muted-foreground">by {g.author}</Text>
                  </View>
                  <View className="flex-row gap-1.5 flex-wrap mb-3">
                    <View className="px-2 py-0.5 rounded-full bg-blue-100 border border-blue-200">
                      <Text className="text-xs text-blue-700 font-medium">{g.cone}</Text>
                    </View>
                    <View className="px-2 py-0.5 rounded-full bg-blue-100 border border-blue-200">
                      <Text className="text-xs text-blue-700 font-medium">{g.atmosphere}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    className="py-2 rounded-xl items-center"
                    style={{ backgroundColor: 'hsl(213 80% 55%)' }}
                    activeOpacity={0.8}
                  >
                    <Text className="text-white text-xs font-bold">View Full Recipe</Text>
                  </TouchableOpacity>
                  <Text className="text-xs text-muted-foreground mt-2 text-center">{g.saveDate}</Text>
                </View>
              </View>
            ))}
            {/* Add glaze CTA */}
            <TouchableOpacity
              activeOpacity={0.75}
              className="w-40 rounded-2xl border-2 border-dashed border-blue-200 items-center justify-center"
            >
              <Droplets size={22} color="hsl(213 80% 55%)" />
              <Text className="text-xs text-blue-700 font-medium mt-2 text-center px-3">
                Browse glaze recipes in Community
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* â”€â”€ Tips & Techniques â”€â”€ */}
      {tips.length > 0 && (
        <View className="mb-8">
          <View className="flex-row items-center gap-2 px-6 mb-3">
            <BookOpen size={15} color="hsl(38 80% 50%)" />
            <Text className="text-lg font-serif font-bold text-foreground">Tips & Techniques</Text>
            <View className="ml-auto px-2 py-0.5 rounded-full bg-amber-100">
              <Text className="text-xs font-bold" style={{ color: 'hsl(38 80% 50%)' }}>{tips.length}</Text>
            </View>
          </View>
          <View className="px-6 gap-3">
            {tips.map((t, i) => (
              <View
                key={i}
                className="rounded-2xl border border-amber-200 p-4"
                style={{ backgroundColor: 'hsl(38 40% 97%)' }}
              >
                <View className="flex-row items-start gap-3">
                  <View className="w-8 h-8 rounded-full items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: t.avatarColor }}>
                    <Text className="text-white text-xs font-bold">{t.author[0]}</Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                      <Text className="text-xs font-bold text-foreground">{t.author}</Text>
                      <View className="px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200">
                        <Text className="text-xs font-medium" style={{ color: 'hsl(38 80% 45%)' }}>{t.tag}</Text>
                      </View>
                    </View>
                    <Text className="text-sm text-foreground leading-relaxed font-serif italic">"{t.tip}"</Text>
                    <Text className="text-xs text-muted-foreground mt-2">{t.saveDate}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removeTip(i)} activeOpacity={0.7} className="p-1">
                    <Trash2 size={13} color="hsl(24 20% 55%)" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* â”€â”€ Kiln Schedules â”€â”€ */}
      {kilns.length > 0 && (
        <View className="mb-8">
          <View className="flex-row items-center gap-2 px-6 mb-3">
            <Thermometer size={15} color="hsl(25 90% 55%)" />
            <Text className="text-lg font-serif font-bold text-foreground">Kiln Schedules</Text>
            <View className="ml-auto px-2 py-0.5 rounded-full bg-orange-100">
              <Text className="text-xs font-bold" style={{ color: 'hsl(25 90% 55%)' }}>{kilns.length}</Text>
            </View>
          </View>
          <View className="px-6 gap-3">
            {kilns.map((k, i) => (
              <Card key={i} className="p-4">
                <View className="flex-row items-center gap-3">
                  <View className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 items-center justify-center flex-shrink-0">
                    <Flame size={22} color="hsl(25 90% 55%)" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-foreground">{k.name}</Text>
                    <View className="flex-row gap-3 mt-1">
                      <Text className="text-xs text-muted-foreground">{k.type}</Text>
                      <Text className="text-xs text-muted-foreground">{k.cone}</Text>
                      <Text className="text-xs text-muted-foreground">{k.duration}</Text>
                    </View>
                    <View className="flex-row items-center gap-1.5 mt-1">
                      <View className="w-4 h-4 rounded-full items-center justify-center" style={{ backgroundColor: k.avatarColor }}>
                        <Text className="text-white font-bold" style={{ fontSize: 8 }}>{k.author[0]}</Text>
                      </View>
                      <Text className="text-xs text-muted-foreground">by {k.author}</Text>
                    </View>
                  </View>
                  <View className="gap-2 items-end">
                    <TouchableOpacity onPress={() => removeKiln(i)} activeOpacity={0.7}>
                      <Trash2 size={13} color="hsl(24 20% 55%)" />
                    </TouchableOpacity>
                    <TouchableOpacity className="px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200" activeOpacity={0.7}>
                      <Text className="text-xs font-bold" style={{ color: 'hsl(25 90% 55%)' }}>Use</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text className="text-xs text-muted-foreground mt-3">{k.saveDate}</Text>
              </Card>
            ))}
          </View>
        </View>
      )}

      {/* Browse CTA */}
      <View className="px-6">
        <TouchableOpacity activeOpacity={0.8}>
          <View className="rounded-2xl border-2 border-dashed border-border p-5 bg-card flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-xl bg-muted items-center justify-center">
              <Bookmark size={18} color="hsl(213 80% 55%)" />
            </View>
            <View className="flex-1">
              <Text className="font-medium text-sm text-foreground">Browse the community</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">Tap Save on any post to collect it here</Text>
            </View>
            <ChevronRight size={16} color="hsl(24 20% 40%)" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function NotesTab() {
  return (
    <View className="pt-5 pb-12">
      {/* New note CTA */}
      <View className="px-6 mb-5">
        <TouchableOpacity
          activeOpacity={0.8}
          className="flex-row items-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card px-5 py-4"
        >
          <PenTool size={18} color="hsl(15 50% 50%)" />
          <Text className="text-sm text-muted-foreground flex-1">Write a new noteâ€¦</Text>
        </TouchableOpacity>
      </View>

      {/* Notes */}
      <View className="px-6 gap-4">
        {NOTES.map((note, i) => (
          <TouchableOpacity key={i} activeOpacity={0.8}>
            <Card className="p-5">
              <View className="flex-row justify-between items-start mb-2">
                <Text className="font-medium text-foreground text-base flex-1 mr-3 leading-tight">{note.title}</Text>
                <Text className="text-[10px] text-muted-foreground flex-shrink-0">{note.date}</Text>
              </View>
              <Text className="text-sm text-muted-foreground leading-relaxed mb-3" numberOfLines={2}>
                {note.excerpt}
              </Text>
              <View className="flex-row gap-2 flex-wrap">
                {note.tags.map((tag, j) => (
                  <Badge key={j} variant="outline" className="rounded-md px-2 py-1">
                    <Text className="text-[10px] font-medium text-muted-foreground">{tag}</Text>
                  </Badge>
                ))}
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// â”€â”€â”€ Main Screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const TABS = [
  { key: 'learn', label: 'Learn' },
  { key: 'saved', label: 'Saved' },
  { key: 'notes', label: 'Notes' },
] as const;
type TabKey = typeof TABS[number]['key'];

export default function JournalScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('learn');

  return (
    <View className="flex-1 bg-background">
      {/* Fixed header — always visible */}
      <View className="px-6 pt-16 pb-4 bg-background border-b border-border">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-3xl font-serif font-bold text-foreground">Studio Library</Text>
          {activeTab === 'notes' && (
            <TouchableOpacity className="w-10 h-10 rounded-full bg-muted items-center justify-center" activeOpacity={0.75}>
              <PenTool size={18} color="hsl(15 50% 50%)" />
            </TouchableOpacity>
          )}
        </View>
        {/* Tab bar */}
        <View className="flex-row gap-1 bg-muted rounded-2xl p-1">
          {TABS.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveTab(key)}
              activeOpacity={0.75}
              className={`flex-1 py-2 rounded-xl items-center ${activeTab === key ? 'bg-card shadow-sm' : ''}`}
            >
              <Text className={`text-sm font-semibold ${activeTab === key ? 'text-foreground' : 'text-muted-foreground'}`}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Scrollable tab content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {activeTab === 'learn' && <LearnTab />}
        {activeTab === 'saved' && <SavedTab />}
        {activeTab === 'notes' && <NotesTab />}
      </ScrollView>
    </View>
  );
}

