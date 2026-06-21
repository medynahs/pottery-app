import { FONT_SIZES, scaleFont, type TextScale } from '@/src/constants/typography';
import { useAppStore } from '@/src/store/appStore';
import { createContext, useContext } from 'react';

export const TextScaleContext = createContext<TextScale>('default');

export function useTextScaleContext(): TextScale {
  return useContext(TextScaleContext);
}

export function useTextScale() {
  const textScale = useTextScaleContext();
  const setTextScale = useAppStore((s) => s.setTextScale);

  function scaled(size: number) {
    return scaleFont(size, textScale);
  }

  return {
    textScale,
    setTextScale,
    scaled,
    sizes: {
      eyebrow: scaled(FONT_SIZES.eyebrow),
      caption: scaled(FONT_SIZES.caption),
      body: scaled(FONT_SIZES.body),
      bodyLg: scaled(FONT_SIZES.bodyLg),
      title: scaled(FONT_SIZES.title),
      titleLg: scaled(FONT_SIZES.titleLg),
      display: scaled(FONT_SIZES.display),
    },
  };
}
