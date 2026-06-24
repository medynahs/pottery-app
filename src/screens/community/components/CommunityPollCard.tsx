import { Card } from '@/src/components/ui/card';
import { Text } from '@/src/components/ui/text';
import React, { useState } from 'react';
import { ActivityIndicator, TouchableOpacity, View } from 'react-native';

export type PollOptionView = {
  id: string;
  label: string;
  votes: number;
};

type CommunityPollCardProps = {
  question: string;
  options: PollOptionView[];
  votedOptionId: string | null;
  totalVotes: number;
  isDemo?: boolean;
  onVote: (optionId: string) => Promise<void> | void;
};

export function CommunityPollCard({
  question,
  options,
  votedOptionId,
  totalVotes,
  isDemo = false,
  onVote,
}: CommunityPollCardProps) {
  const [voting, setVoting] = useState<string | null>(null);
  const hasVoted = votedOptionId !== null;
  const total = totalVotes || 1;

  const handleVote = async (optionId: string) => {
    if (hasVoted || voting) return;
    setVoting(optionId);
    try {
      await onVote(optionId);
    } finally {
      setVoting(null);
    }
  };

  return (
    <Card className="p-4">
      <Text className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Community Poll
      </Text>
      {isDemo ? (
        <Text className="text-[10px] text-primary font-semibold mb-2">
          From Pottery Nook · vote locally until live polls are enabled
        </Text>
      ) : null}
      <Text className="text-sm font-bold text-foreground mb-3">{question}</Text>
      <View className="gap-2">
        {options.map((opt) => {
          const pct = Math.round((opt.votes / total) * 100);
          const isVoted = votedOptionId === opt.id;
          const isVoting = voting === opt.id;
          return (
            <TouchableOpacity
              key={opt.id}
              onPress={() => { void handleVote(opt.id); }}
              disabled={hasVoted || voting !== null}
              activeOpacity={hasVoted ? 1 : 0.75}
            >
              <View className="rounded-xl overflow-hidden border border-border">
                {hasVoted ? (
                  <View
                    className="absolute inset-0 rounded-xl"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: isVoted
                        ? 'hsl(39 57% 51% / 0.15)'
                        : 'hsl(0 0% 0% / 0.04)',
                    }}
                  />
                ) : null}
                <View className="flex-row items-center justify-between px-3 py-2.5">
                  <View className="flex-row items-center gap-2 flex-1">
                    {isVoting ? <ActivityIndicator size="small" color="#8B6A2A" /> : null}
                    <Text
                      className="text-sm flex-1"
                      style={{
                        fontWeight: isVoted ? '700' : '400',
                        color: isVoted ? 'hsl(39 57% 45%)' : undefined,
                      }}
                    >
                      {opt.label}
                    </Text>
                  </View>
                  {hasVoted ? (
                    <Text className="text-xs font-semibold text-muted-foreground ml-2">
                      {pct}%
                    </Text>
                  ) : null}
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      {hasVoted ? (
        <Text className="text-xs text-muted-foreground mt-2">
          {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
        </Text>
      ) : null}
    </Card>
  );
}
