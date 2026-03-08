// src/screens/KilnScreen.tsx
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';
import { Checkbox } from '@/src/components/ui/checkbox';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { Text } from '@/src/components/ui/text';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';

export default function KilnScreen() {
  const [checklist, setChecklist] = React.useState([
    { text: "Wipe bottoms of all glazed pieces", checked: false },
    { text: "Check pieces for cracks before loading", checked: false },
    { text: "Apply kiln wash to shelves if needed", checked: true },
    { text: "Arrange pieces by height (tallest in back)", checked: false }
  ]);

  const toggleChecklist = (index: number) => {
    const newChecklist = [...checklist];
    newChecklist[index].checked = !newChecklist[index].checked;
    setChecklist(newChecklist);
  };

  const ProgressBar = ({ value }: { value: number }) => (
    <View className="w-full h-2 bg-muted rounded-full overflow-hidden">
      <View
        className="h-full bg-primary rounded-full"
        style={{ width: `${value}%` }}
      />
    </View>
  );

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="px-6 pt-20 pb-6">
        <Text className="text-3xl font-serif font-bold text-foreground">Studio Kiln</Text>
        <Text className="text-muted-foreground mt-1 text-sm">Cone 6 Gas Firing</Text>
      </View>

      {/* Active Firing Status */}
      <View className="px-6 mb-8">
        <Card className="p-6 items-center bg-accent/10 border-accent">
          <View className="w-20 h-20 mb-4 items-center justify-center">
            <IconSymbol name="flame.fill" size={60} color="hsl(15 50% 50%)" />
          </View>

          <Text className="text-xs font-semibold uppercase tracking-wider text-accent mb-2">Firing Active</Text>
          <Text className="text-2xl font-serif font-bold text-foreground mb-1">Bisque Firing</Text>
          <Text className="text-sm text-muted-foreground mb-4">Started 4 hours ago by Sarah</Text>

          <View className="w-full mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-xs font-semibold text-foreground">Temperature</Text>
              <Text className="text-xs font-semibold text-foreground">1050°F / 1945°F</Text>
            </View>
            <ProgressBar value={54} />
          </View>

          <View className="w-full flex-row gap-3">
            <Card className="flex-1 p-3 items-center justify-center bg-card">
              <IconSymbol name="clock.fill" size={18} color="hsl(15 50% 50%)" />
              <Text className="text-xs text-foreground font-medium mt-2 text-center">Est. 8h left</Text>
            </Card>
            <Card className="flex-1 p-3 items-center justify-center bg-card">
              <IconSymbol name="thermometer" size={18} color="hsl(15 50% 50%)" />
              <Text className="text-xs text-foreground font-medium mt-2 text-center">Heating up</Text>
            </Card>
          </View>
        </Card>
      </View>

      {/* Loading Checklist */}
      <View className="px-6 mb-8">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="font-serif text-xl font-bold text-foreground">Next Firing Checklist</Text>
          <IconSymbol name="info.circle" size={18} color="hsl(34 30% 85%)" />
        </View>

        <Card className="p-5">
          <View className="gap-3 mb-4">
            {checklist.map((item, i) => (
              <TouchableOpacity key={i} onPress={() => toggleChecklist(i)} className="flex-row items-center gap-3">
                <Checkbox checked={item.checked} />
                <Text className={`text-sm flex-1 ${item.checked ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                  {item.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button variant="outline" className="w-full">
            <Text className="text-sm">Add Custom Task</Text>
          </Button>
        </Card>
      </View>

      {/* History */}
      <View className="px-6 mb-8">
        <View className="flex-row items-center gap-2 mb-4">
          <IconSymbol name="clock.arrow.circlepath" size={18} color="hsl(15 50% 50%)" />
          <Text className="font-serif text-xl font-bold text-foreground">Recent Firings</Text>
        </View>
        <View className="gap-3">
          {[
            { type: "Glaze Cone 6", date: "Oct 10", by: "Studio Manager", status: "Success" },
            { type: "Bisque Cone 04", date: "Oct 5", by: "Sarah", status: "Success" },
            { type: "Luster Firing", date: "Sep 28", by: "Mike", status: "Issues reported" }
          ].map((fire, i) => (
            <Card key={i} className="p-4 flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="font-semibold text-sm text-foreground">{fire.type}</Text>
                <Text className="text-xs text-muted-foreground mt-1">{fire.date} • by {fire.by}</Text>
              </View>
              <View className={`px-3 py-1 rounded-full ${fire.status === 'Success' ? 'bg-green-100' : 'bg-red-100'}`}>
                <Text className={`text-xs font-medium ${fire.status === 'Success' ? 'text-green-700' : 'text-red-700'}`}>
                  {fire.status}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}