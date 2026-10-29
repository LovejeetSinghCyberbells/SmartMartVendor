export const fonts = {
  // Family definitions for Poppins
  thin: 'Poppins-Thin',
  regular: 'Poppins-Regular',
  medium: 'Poppins-Medium',
  semiBold: 'Poppins-SemiBold',
  bold: 'Poppins-Bold',
} as const;

export const fontSizes = {
  xs: 10,
  sm: 12,
  caption: 13,
  body: 14,
  bodyLarge: 15,
  subtitle: 16,
  title: 18,
  heading: 20,
  display: 24,
  hero: 32,
} as const;

export const lineHeights = {
  xs: 14,
  sm: 16,
  caption: 18,
  body: 20,
  bodyLarge: 22,
  subtitle: 24,
  title: 26,
  heading: 28,
  display: 32,
  hero: 40,
} as const;

export const typography = {
  hero: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.hero,
    lineHeight: lineHeights.hero,
  },
  display: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.display,
    lineHeight: lineHeights.display,
  },
  heading: {
    fontFamily: fonts.bold,
    fontSize: fontSizes.heading,
    lineHeight: lineHeights.heading,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.title,
    lineHeight: lineHeights.title,
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: fontSizes.subtitle,
    lineHeight: lineHeights.subtitle,
  },
  bodyLarge: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.bodyLarge,
    lineHeight: lineHeights.bodyLarge,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.body,
    lineHeight: lineHeights.body,
  },
  caption: {
    fontFamily: fonts.regular,
    fontSize: fontSizes.caption,
    lineHeight: lineHeights.caption,
  },
  button: {
    fontFamily: fonts.semiBold,
    fontSize: fontSizes.subtitle,
  },
} as const;

export type Fonts = typeof fonts;
export default fonts;

