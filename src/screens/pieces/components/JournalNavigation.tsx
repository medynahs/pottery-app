import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { CompactPageIndicator } from '../components/CompactPageIndicator';
import { JournalTheme } from '../utils/journalTheme';

interface JournalNavigationProps {
  activePage: number;
  totalPages: number;
  goToPage: (index: number) => void;
  isCompact: boolean;
  bookHeight: number;
  spreads: any[];
  accent: string;
}

export function JournalNavigation({
  activePage,
  totalPages,
  goToPage,
  isCompact,
  bookHeight,
  spreads,
  accent,
}: JournalNavigationProps) {
  
  return (
    <>
      <View style={isCompact ? { position: 'absolute', left: 12, bottom: 14 } : { position: 'absolute', left: 12, top: '50%', marginTop: -22 }}>
        <TouchableOpacity
          onPress={() => goToPage(activePage - 1)}
          disabled={activePage === 0}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Previous page"
          style={{
            width: 42,
            height: 42,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: activePage === 0 ? JournalTheme.navButtonDisabled : JournalTheme.navButtonActive,
          }}
        >
          <ChevronLeft size={isCompact ? 16 : 18} color={activePage === 0 ? JournalTheme.navIconDisabled : JournalTheme.navIconActive} />
        </TouchableOpacity>
      </View>

      <View style={isCompact ? { position: 'absolute', right: 12, bottom: 14 } : { position: 'absolute', right: 12, top: '50%', marginTop: -22 }}>
        <TouchableOpacity
          onPress={() => goToPage(activePage + 1)}
          disabled={activePage === totalPages - 1}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Next page"
          style={{
            width: 42,
            height: 42,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: activePage === totalPages - 1 ? JournalTheme.navButtonDisabled : JournalTheme.navButtonActive,
          }}
        >
          <ChevronRight size={isCompact ? 16 : 18} color={activePage === totalPages - 1 ? JournalTheme.navIconDisabled : JournalTheme.navIconActive} />
        </TouchableOpacity>
      </View>

      {/* <BookTabs icons={}  spreads={spreads} activePage={activePage} onPress={goToPage} /> */}

      {isCompact && spreads.length > 0 ? (
        <CompactPageIndicator
          activePage={activePage}
          totalPages={spreads.length}
          accent={accent}
        />
      ) : null}
    </>
  );
}
