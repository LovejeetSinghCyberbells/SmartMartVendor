export const DEMO_OTP = '1234';

export const isValidPhoneNumber = (phoneNumber: string): boolean =>
  /^\d{7,10}$/.test(phoneNumber);

export const isValidDemoOtp = (otp: string): boolean => otp === DEMO_OTP;
