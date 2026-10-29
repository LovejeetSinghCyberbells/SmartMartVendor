import React from 'react';
import { Text as NativeText, type TextProps } from 'react-native';
import { useLocalization } from './LocalizationProvider';

const LocalizedText = ({ children, ...props }: TextProps) => {
  const { t } = useLocalization();

  const localize = (child: React.ReactNode): React.ReactNode => {
    if (typeof child !== 'string') {
      return child;
    }

    const leadingWhitespace = child.match(/^\s*/)?.[0] ?? '';
    const trailingWhitespace = child.match(/\s*$/)?.[0] ?? '';
    const source = child.trim().replace(/\s+/g, ' ');

    if (!source) {
      return child;
    }

    return `${leadingWhitespace}${t(source)}${trailingWhitespace}`;
  };

  return (
    <NativeText {...props}>
      {React.Children.map(children, localize)}
    </NativeText>
  );
};

export default LocalizedText;
