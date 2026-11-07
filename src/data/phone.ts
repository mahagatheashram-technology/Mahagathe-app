/** Onboarding currently collects Indian local numbers; explicit E.164 also works. */
export function phoneWithCountryCode(value: string): string {
  const compact = value.replace(/[\s()-]/g, '');
  const phone = /^\d{10}$/.test(compact) ? `+91${compact}` : compact;
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) throw new Error('Enter a phone number with country code.');
  return phone;
}
