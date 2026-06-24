import { Text } from '@/src/components/ui/text';
import React from 'react';
import { Linking, TouchableOpacity, View } from 'react-native';
import { ExternalLink } from 'lucide-react-native';
import { formatProductLayer, glazeMatchesProduct } from './products';
import type { DiscoverInspiration, DiscoverProductRef } from './types';

function ProductRow({
  product,
  index,
  owned,
  onAddProduct,
}: {
  product: DiscoverProductRef;
  index: number;
  owned?: boolean;
  onAddProduct?: (product: DiscoverProductRef) => void;
}) {
  const roleLabel =
    product.role === 'base'
      ? 'Base'
      : product.role === 'liner'
        ? 'Liner'
        : product.role === 'accent'
          ? 'Top layer'
          : `Layer ${index + 1}`;

  const openPurchaseLink = () => {
    if (!product.purchaseUrl) return;
    void Linking.openURL(product.purchaseUrl);
  };

  return (
    <View className="flex-row items-start gap-3 py-3 border-b border-border last:border-b-0">
      <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center shrink-0 mt-0.5">
        <Text className="text-xs font-bold text-primary">{index + 1}</Text>
      </View>
      <View className="flex-1 min-w-0">
        <View className="flex-row items-center gap-2 flex-wrap">
          <Text className="text-sm font-semibold text-foreground">
            {product.brand} {product.name}
          </Text>
          {owned ? (
            <View className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
              <Text className="text-[10px] font-semibold text-emerald-800">In My Glazes</Text>
            </View>
          ) : null}
        </View>
        <Text className="text-xs text-muted-foreground mt-0.5">{roleLabel}</Text>
        <Text className="text-xs text-foreground mt-1">{formatProductLayer(product)}</Text>
        {!owned && onAddProduct ? (
          <TouchableOpacity
            onPress={() => onAddProduct(product)}
            activeOpacity={0.85}
            className="mt-2 self-start px-3 py-1.5 rounded-full bg-primary"
          >
            <Text className="text-xs font-semibold text-white">Add to My Glazes</Text>
          </TouchableOpacity>
        ) : null}
        {product.purchaseUrl ? (
          <TouchableOpacity
            onPress={openPurchaseLink}
            activeOpacity={0.85}
            className="flex-row items-center gap-1 mt-2 self-start"
          >
            <ExternalLink size={12} color="hsl(39 57% 41%)" />
            <Text className="text-xs font-semibold text-primary">Find online</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

export function ComboProductStrip({
  inspiration,
  ownedProductKeys,
  onAddProduct,
}: {
  inspiration: DiscoverInspiration;
  ownedProductKeys?: Set<string>;
  onAddProduct?: (product: DiscoverProductRef) => void;
}) {
  const products = inspiration.products ?? [];
  if (products.length === 0) return null;

  return (
    <View className="mt-6 rounded-2xl border border-border bg-card px-4 py-1">
      <Text className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground pt-3 pb-1">
        Products in this combo
      </Text>
      {products.map((product, index) => {
        const key = `${product.brand}:${product.name}`.toLowerCase();
        return (
          <ProductRow
            key={key}
            product={product}
            index={index}
            owned={ownedProductKeys?.has(key)}
            onAddProduct={onAddProduct}
          />
        );
      })}
    </View>
  );
}

export function ownedProductKeysForCombo(
  inspiration: DiscoverInspiration,
  glazes: { name: string; supplier?: string; source?: string }[],
): Set<string> {
  const keys = new Set<string>();
  for (const product of inspiration.products ?? []) {
    if (glazes.some((glaze) => glazeMatchesProduct(glaze, product))) {
      keys.add(`${product.brand}:${product.name}`.toLowerCase());
    }
  }
  return keys;
}
