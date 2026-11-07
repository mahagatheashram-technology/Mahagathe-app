/** Expo inlines these direct property reads. Selection is fixed for the bundle. */
export const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim();
export const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL?.trim();
export const isLiveBackend = Boolean(clerkPublishableKey && convexUrl);
