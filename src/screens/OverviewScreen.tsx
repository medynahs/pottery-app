// src/screens/OverviewScreen.tsx
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Text } from '@/src/components/ui/text';
import { useAppStore } from '@/src/store';
import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

export default function OverviewScreen() {
  const router = useRouter();
  const user = useAppStore((s) => s.user);
  const tasks = useAppStore((s) => s.tasks);
  const toggleTask = useAppStore((s) => s.toggleTask);

  return (
    <ScrollView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-20 pb-6 flex-row items-center justify-between">
        <View>
          <Text className="text-4xl font-serif font-bold text-foreground">Welcome back,</Text>
          <Text className="text-lg text-muted-foreground mt-1">{user.name}</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/profile')}
          activeOpacity={0.75}
          className="w-12 h-12 rounded-full bg-primary items-center justify-center"
        >
          <Text className="text-white text-lg font-bold font-serif">{user.avatarInitial}</Text>
        </TouchableOpacity>
      </View>


      {/* Wrapped Teaser */}
      <View className="px-6 mb-8">
        <TouchableOpacity activeOpacity={0.88}>
          <View
            className="rounded-3xl p-6 overflow-hidden relative"
            style={{ backgroundColor: 'hsl(260 15% 48%)' }}
          >
            {/* Decorative blob */}
            <View
              className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            />
            <View className="absolute top-5 right-5">
              <Sparkles size={22} color="rgba(255,235,130,0.8)" />
            </View>

            <Text className="text-2xl font-serif font-bold text-white mb-2">
              Your 2024 Wrapped is Ready
            </Text>
            <Text className="text-sm mb-6 max-w-[80%]" style={{ color: 'rgba(255,255,255,0.75)' }}>
              142 pieces made. 12 failures honored. Endless learning. Tap to see your journey.
            </Text>

            <Button className="bg-white rounded-xl self-start">
              <Text className="text-sm font-medium" style={{ color: 'hsl(145 20% 22%)' }}>
                Play Story
              </Text>
            </Button>
          </View>
        </TouchableOpacity>
      </View>


      {/* Virtual Studio Section */}
      <View className="px-6 mb-6">
        <View className="bg-card rounded-3xl p-8 items-center justify-center min-h-[280px] border border-border shadow-sm">
          <IconSymbol name="paintbrush.fill" size={48} color="hsl(15 50% 50%)" />
          <Text className="text-xl font-serif font-bold text-foreground mt-4 text-center">Your Virtual Studio</Text>
          <Text className="text-sm text-muted-foreground text-center mt-2">Studio is Open</Text>
          <Button className="mt-6 bg-primary px-8 py-2 rounded-2xl">
            <Text className="text-white font-medium">Enter</Text>
          </Button>
        </View>
      </View>


      {/* Pet Notification */}
      <View className="px-6 mb-6">
        <View className="bg-accent/20 rounded-3xl p-6 border border-accent/30">
          <Text className="text-base text-foreground font-serif italic">
            "Hey there! Just a gentle reminder that your 3 mugs on the 'Bone Dry' shelf are ready for bisque firing today."
          </Text>
          <View className="flex-row gap-3 mt-4">
            <Button variant="default" className="flex-1 rounded-2xl py-2">
              <Text className="text-white font-medium text-sm">View Mugs</Text>
            </Button>
            <Button variant="outline" className="flex-1 rounded-2xl py-2">
              <Text className="text-foreground font-medium text-sm">Snooze</Text>
            </Button>
          </View>
        </View>
      </View>

      {/* Today's Routine */}
      <View className="px-6 mb-6">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-serif font-bold text-foreground">Today's Routine</Text>
          <View className="flex-row items-center gap-1">
            <Text className="text-sm text-primary font-medium">Edit</Text>
            <IconSymbol name="calendar" size={16} color="hsl(15 50% 50%)" />
          </View>
        </View>

        <View className="gap-3">
          {tasks.map((task, index) => (
            <TouchableOpacity key={index} onPress={() => toggleTask(index)}>
              <Card className="p-4 bg-card border border-border">
                <View className="flex-row items-center gap-3">

                  <View className="flex-1">
                    <Text className={`font-serif font-bold ${task.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                      {task.title}
                    </Text>
                    <Text className="text-xs text-muted-foreground mt-1">
                      {task.time} • {task.type}
                    </Text>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Kiln Alerts */}
      <View className="px-6 mb-8">
        <View className="flex-row items-center gap-2 mb-3">
          <IconSymbol name="flame.fill" size={20} color="hsl(15 50% 50%)" />
          <Text className="text-lg font-serif font-bold text-foreground">Studio Kiln Alerts</Text>
        </View>
        <Card className="p-4 bg-destructive/5 border border-destructive/20">
          <View className="flex-row gap-3">
            <View className="w-2 h-2 rounded-full bg-destructive mt-1" />
            <Text className="text-sm text-foreground flex-1">
              "Your 2 bowls were just loaded into the Bisque kiln!"
            </Text>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}