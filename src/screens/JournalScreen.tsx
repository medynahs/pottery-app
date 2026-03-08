// src/screens/JournalScreen.tsx
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import { Award, BookOpenCheck, ChevronRight, PenTool, ShoppingBag, Wrench } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

const TEMPLATES = [
  { title: 'Glaze Journal Template', price: '$2.99', author: 'Studio Sarah', type: 'Journal' },
  { title: 'The 30-Day Cylinder Challenge', price: 'Free', author: 'Potter Pete', type: 'Roadmap' },
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
  { name: 'Sponge & Ribs', label: 'Must Have', highlight: true },
  { name: 'Advanced Extruders', label: 'Later...', highlight: false },
];

export default function JournalScreen() {
  return (
    <ScrollView className="flex-1 bg-background" showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="px-6 pt-20 pb-5 bg-background border-b border-border flex-row justify-between items-center">
        <Text className="text-3xl font-serif font-bold text-foreground">Learning</Text>
        <Button variant="outline" size="icon" className="rounded-full w-10 h-10">
          <PenTool size={18} color="hsl(15 50% 50%)" />
        </Button>
      </View>

      {/* Learning Roadmap */}
      <View className="px-6 pt-6 mb-8">
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

          {/* Progress bar */}
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

      {/* Recent Notes */}
      <View className="px-6 mb-8">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-serif text-xl font-bold text-foreground">Recent Notes</Text>
          <TouchableOpacity>
            <Text className="text-sm text-muted-foreground">View All</Text>
          </TouchableOpacity>
        </View>
        <View className="gap-4">
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

      {/* Explore Templates Banner */}
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
    </ScrollView>
  );
}
