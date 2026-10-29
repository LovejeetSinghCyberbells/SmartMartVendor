import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

export interface DividerProps {
  color?: string;
  thickness?: number;
  marginVertical?: number;
  horizontalInset?: number;
  style?: StyleProp<ViewStyle>;
}

export const Divider: React.FC<DividerProps> = ({
  color = '#f0f0f0',
  thickness = 1,
  marginVertical = 0,
  horizontalInset = 0,
  style,
}) => {
  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: color,
          height: thickness,
          marginVertical,
          marginHorizontal: horizontalInset,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    width: '100%',
  },
});

export default Divider;

