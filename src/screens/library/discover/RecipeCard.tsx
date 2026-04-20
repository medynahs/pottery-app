import { Text } from '@/src/components/ui/text';
import { BookmarkPlus, ChevronDown, ChevronUp, Flame, Star } from 'lucide-react-native';
import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';
import type { DiscoverRecipe, RecipeIngredient } from './types';

// ─── Ingredient bar row ───────────────────────────────────────────────────────

function IngredientRow({
  ingredient,
  maxPct,
}: {
  ingredient: RecipeIngredient;
  maxPct: number;
}) {
  const barPct = Math.min((ingredient.percentage / maxPct) * 100, 100);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
      <Text
        style={{
          width: 130,
          fontSize: 10,
          color: ingredient.isAddition ? '#C9963A' : '#3A2810',
        }}
        numberOfLines={1}
      >
        {ingredient.material}
      </Text>
      <View
        style={{
          flex: 1,
          height: 5,
          backgroundColor: '#EDE0CB',
          borderRadius: 2.5,
          marginHorizontal: 8,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${barPct}%`,
            height: 5,
            backgroundColor: ingredient.isAddition ? '#C9963A' : '#C4A87A',
            borderRadius: 2.5,
          }}
        />
      </View>
      <Text style={{ width: 36, fontSize: 10, color: '#A68555', textAlign: 'right' }}>
        {ingredient.percentage}%
      </Text>
    </View>
  );
}

// ─── Recipe card ─────────────────────────────────────────────────────────────

export function RecipeCard({
  recipe,
  onSave,
  isTrending,
  successRate,
  matchesCone,
  saved,
}: {
  recipe: DiscoverRecipe;
  onSave: () => void;
  isTrending: boolean;
  successRate: number;
  matchesCone: boolean;
  saved: boolean;
}) {
  const [expanded, setExpanded] = React.useState(false);

  const baseIngredients = recipe.ingredients.filter((i) => !i.isAddition);
  const additions = recipe.ingredients.filter((i) => i.isAddition);
  const maxBasePct = Math.max(...baseIngredients.map((i) => i.percentage), 1);
  const maxAdditionPct = Math.max(...additions.map((i) => i.percentage), 1);

  return (
    <View
      style={{
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#D9C9A8',
        backgroundColor: '#FFFBF2',
        overflow: 'hidden',
        shadowColor: '#8B6A2A',
        shadowOpacity: 0.07,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
        marginBottom: 8,
      }}
    >
      {/* ── Compact row ── */}
      <View style={{ flexDirection: 'row' }}>
        {/* Left: fired photo or colour swatch */}
        {recipe.previewUri ? (
          <Image
            source={{ uri: recipe.previewUri }}
            style={{ width: 80, backgroundColor: recipe.colorHex }}
            resizeMode="cover"
          />
        ) : (
          <View
            style={{
              width: 80,
              backgroundColor: recipe.colorHex,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View style={{ opacity: 0.2, gap: 4 }}>
              {[0, 1, 2].map((row) => (
                <View key={row} style={{ flexDirection: 'row', gap: 4 }}>
                  {[0, 1, 2].map((col) => (
                    <View
                      key={col}
                      style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#3A2810' }}
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Content */}
        <View style={{ flex: 1, paddingVertical: 11, paddingLeft: 13, paddingRight: 12 }}>
          {/* Name + save */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 8,
            }}
          >
            <Text
              style={{ fontFamily: 'Fraunces_600SemiBold', fontSize: 14, color: '#3A2810', flex: 1 }}
              numberOfLines={1}
            >
              {recipe.name}
            </Text>
            <TouchableOpacity
              onPress={saved ? undefined : onSave}
              activeOpacity={saved ? 1 : 0.8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 4,
                backgroundColor: saved ? '#EEE8DC' : '#F4EAD8',
                borderRadius: 10,
                paddingHorizontal: 9,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: saved ? '#C8BAA0' : '#D9C9A8',
              }}
            >
              <BookmarkPlus size={11} color={saved ? '#A89878' : '#C9963A'} />
              <Text style={{ fontSize: 10, fontWeight: '700', color: saved ? '#A89878' : '#C9963A' }}>
                {saved ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Cone · finish */}
          <Text
            style={{
              fontSize: 10,
              color: '#A68555',
              textTransform: 'uppercase',
              letterSpacing: 0.9,
              marginTop: 3,
            }}
          >
            {recipe.coneLabel} · {recipe.finish}
          </Text>

          {/* Description */}
          <Text
            style={{ fontSize: 11, color: '#6B5030', lineHeight: 16, marginTop: 5 }}
            numberOfLines={1}
          >
            {recipe.description}
          </Text>

          {/* Badges row */}
          <View
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 7, flexWrap: 'wrap' }}
          >
            {isTrending && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 3,
                  backgroundColor: '#FFF3DC',
                  borderRadius: 7,
                  paddingHorizontal: 6,
                  paddingVertical: 2.5,
                  borderWidth: 1,
                  borderColor: '#F0D898',
                }}
              >
                <Flame size={8} color="#C9963A" />
                <Text style={{ fontSize: 9, fontWeight: '700', color: '#A87020', letterSpacing: 0.3 }}>
                  Trending
                </Text>
              </View>
            )}
            {matchesCone && (
              <View
                style={{
                  backgroundColor: '#DCF5E8',
                  borderRadius: 7,
                  paddingHorizontal: 6,
                  paddingVertical: 2.5,
                  borderWidth: 1,
                  borderColor: '#B8E8CC',
                }}
              >
                <Text style={{ fontSize: 9, fontWeight: '700', color: '#2A7050', letterSpacing: 0.3 }}>
                  ✓ Your cone
                </Text>
              </View>
            )}
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 3, marginLeft: 'auto' }}
            >
              <Star size={9} color="#C9963A" fill="#C9963A" />
              <Text style={{ fontSize: 9, fontWeight: '700', color: '#A68555' }}>{successRate}%</Text>
              <Text style={{ fontSize: 9, color: '#C4B48C' }}>
                · {recipe.savedCount >= 1000 ? `${(recipe.savedCount / 1000).toFixed(1)}k` : recipe.savedCount} saved
              </Text>
            </View>
          </View>

          {/* Recipe expand toggle */}
          <TouchableOpacity
            onPress={() => setExpanded((v) => !v)}
            activeOpacity={0.7}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 }}
          >
            {expanded ? (
              <ChevronUp size={11} color="#A68555" />
            ) : (
              <ChevronDown size={11} color="#A68555" />
            )}
            <Text style={{ fontSize: 10, color: '#A68555', fontWeight: '600' }}>
              {expanded ? 'Hide recipe' : `${recipe.ingredients.length} ingredients`}
            </Text>
            {!expanded && (
              <Text style={{ fontSize: 10, color: '#C4B08C' }}>
                · ~${recipe.estimatedCostPer100g.toFixed(2)}/100g
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Expanded ingredient breakdown ── */}
      {expanded && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: '#EDE0CB',
            paddingHorizontal: 14,
            paddingTop: 12,
            paddingBottom: 14,
          }}
        >
          {/* Header: "Ingredients" + cost badge */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                fontSize: 9,
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: 1.3,
                color: '#A68555',
              }}
            >
              Ingredients
            </Text>
            <View
              style={{
                backgroundColor: '#F4EAD8',
                borderRadius: 8,
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderWidth: 1,
                borderColor: '#D9C9A8',
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#8B5E1A' }}>
                ~${recipe.estimatedCostPer100g.toFixed(2)} / 100 g batch
              </Text>
            </View>
          </View>

          {/* Base ingredient bars */}
          {baseIngredients.map((ing, idx) => (
            <IngredientRow key={idx} ingredient={ing} maxPct={maxBasePct} />
          ))}

          {/* Colorant / opacifier additions */}
          {additions.length > 0 && (
            <>
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: 1.3,
                  color: '#C9963A',
                  marginTop: 10,
                  marginBottom: 6,
                }}
              >
                + Additions
              </Text>
              {additions.map((ing, idx) => (
                <IngredientRow key={idx} ingredient={ing} maxPct={maxAdditionPct} />
              ))}
            </>
          )}

          {/* Price note */}
          <Text
            style={{
              fontSize: 9,
              color: '#C4B48C',
              marginTop: 10,
              lineHeight: 14,
            }}
          >
            Prices are approximate US averages (2025). Actual cost varies by supplier and batch size.
          </Text>
        </View>
      )}
    </View>
  );
}
