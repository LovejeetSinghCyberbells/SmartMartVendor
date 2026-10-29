import React, { forwardRef } from 'react';
import {
  TextInput as NativeTextInput,
  type TextInputProps,
} from 'react-native';
import { useLocalization } from './LocalizationProvider';

const LocalizedTextInput = forwardRef<
  React.ElementRef<typeof NativeTextInput>,
  TextInputProps
>(({ accessibilityLabel, placeholder, ...props }, ref) => {
  const { t } = useLocalization();

  return (
    <NativeTextInput
      {...props}
      ref={ref}
      accessibilityLabel={
        accessibilityLabel ? t(accessibilityLabel) : accessibilityLabel
      }
      placeholder={placeholder ? t(placeholder) : placeholder}
    />
  );
});

LocalizedTextInput.displayName = 'LocalizedTextInput';

export default LocalizedTextInput;
