import React from 'react';
import { ScrollView, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import TouchableOpacity from '../AnimatedTouchableOpacity';
import LocalizedText from '../../i18n/LocalizedText';

export interface FilterTabItem<T extends string = string> {
  key: T;
  label: string;
}

export interface FilterTabsProps<T extends string = string> {
  filters: FilterTabItem<T>[];
  active: T;
  onChange: (key: T) => void;
  counts?: Record<string, number>;
  containerStyle?: StyleProp<ViewStyle>;
  tabStyle?: StyleProp<ViewStyle>;
  tabActiveStyle?: StyleProp<ViewStyle>;
  tabTextStyle?: StyleProp<TextStyle>;
  tabTextActiveStyle?: StyleProp<TextStyle>;
  showZeroCount?: boolean;
}

export function FilterTabs<T extends string = string>({
  filters,
  active,
  onChange,
  counts = {},
  containerStyle,
  tabStyle,
  tabActiveStyle,
  tabTextStyle,
  tabTextActiveStyle,
  showZeroCount = false,
}: FilterTabsProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, containerStyle]}
    >
      {filters.map((filter) => {
        const isActive = active === filter.key;
        const count = counts[filter.key];
        const displayCount =
          count !== undefined && (showZeroCount || count > 0) ? ` (${count})` : '';

        return (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.tab,
              tabStyle,
              isActive && styles.tabActive,
              isActive && tabActiveStyle,
            ]}
            onPress={() => onChange(filter.key)}
            activeOpacity={0.8}
          >
            <LocalizedText
              style={[
                styles.tabText,
                tabTextStyle,
                isActive && styles.tabTextActive,
                isActive && tabTextActiveStyle,
              ]}
            >
              {filter.label}
              {displayCount}
            </LocalizedText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 8,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#258B3E',
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#ffffff',
  },
});

export default FilterTabs;

