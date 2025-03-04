import Constants from 'expo-constants';

export const generateAPIUrl = (relativePath: string) => {
  // Add fallback for when experienceUrl is undefined
  const experienceUrl = Constants.experienceUrl || 'exp://localhost:8081';
  const origin = experienceUrl.replace('exp://', 'http://');

  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;

  if (process.env.NODE_ENV === 'development') {
    return origin.concat(path);
  }

  if (!process.env.EXPO_PUBLIC_API_BASE_URL) {
    throw new Error(
      'EXPO_PUBLIC_API_BASE_URL environment variable is not defined',
    );
  }

  return process.env.EXPO_PUBLIC_API_BASE_URL.concat(path);
};