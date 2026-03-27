 import { Pressable } from '@/src/components/ui/pressable';
import { Text } from '@/src/components/ui/text';
import React from 'react';
import { View } from 'react-native';
import { buildDefaultPricingSettings, PRICING_USER_TYPE_LABELS, PricingUserType } from '../../pieces/pricing';

interface PricingStepProps {
  draft: { pricingUserType: PricingUserType };
  updateDraft: (patch: Partial<{ pricingUserType: PricingUserType }>) => void;
}

export const PricingStep: React.FC<PricingStepProps> = ({ draft, updateDraft}) => {
  return (
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
};

