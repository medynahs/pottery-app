// src/screens/StudioScreen.tsx
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Text } from '@/src/components/ui/text';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

export default function StudioScreen() {
  const [tasks, setTasks] = useState([
    { title: 'Wheel practice: 3 cylinders', time: '1 hr', type: 'practice', status: 'pending' },
    { title: 'Time to reclaim clay', time: '30 min', type: 'chore', status: 'completed' },
    { title: 'Clean bottoms before kiln', time: '15 min', type: 'checklist', status: 'completed' },
  ]);

  const toggleTask = (index: number) => {
    const newTasks = [...tasks];
    newTasks[index].status = newTasks[index].status === 'completed' ? 'pending' : 'completed';
    setTasks(newTasks);
  };

  return (
    <ScrollView className="flex-1 bg-background">
      {/* Header */}
      <View className="px-6 pt-20 pb-6">
        <Text className="text-4xl font-serif font-bold text-foreground">Welcome back,</Text>
        <Text className="text-lg text-muted-foreground mt-1">Susan</Text>
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

      {/* Action Buttons */}
      <View className="px-6 mb-6 flex-row gap-3">
        <Button className="flex-1 bg-primary rounded-2xl py-3">
          <View className="flex-row items-center justify-center gap-2">
            <IconSymbol name="plus.circle" size={20} color="white" />
            <Text className="text-white font-bold">Log Piece</Text>
          </View>
        </Button>
        <Button variant="outline" className="w-14 h-14 rounded-2xl items-center justify-center">
          <IconSymbol name="person.2.fill" size={24} color="hsl(15 50% 50%)" />
        </Button>
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