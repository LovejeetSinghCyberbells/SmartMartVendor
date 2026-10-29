import { isValidDemoOtp, isValidPhoneNumber } from './authValidation';

describe('demo authentication validation', () => {
  it('accepts phone numbers with 7 to 10 digits only', () => {
    expect(isValidPhoneNumber('1234567')).toBe(true);
    expect(isValidPhoneNumber('1234567890')).toBe(true);
    expect(isValidPhoneNumber('123456')).toBe(false);
    expect(isValidPhoneNumber('12345678901')).toBe(false);
    expect(isValidPhoneNumber('12345abc')).toBe(false);
  });

  it('accepts only the documented demo OTP', () => {
    expect(isValidDemoOtp('1234')).toBe(true);
    expect(isValidDemoOtp('0000')).toBe(false);
    expect(isValidDemoOtp('123')).toBe(false);
  });
});
