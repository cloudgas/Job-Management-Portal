
// Environment variables utility
export const getEnv = (name: string, defaultValue?: string): string => {
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return process.env[name] as string;
  }
  
  // For Expo, check EXPO_PUBLIC_ prefix
  const expoName = `EXPO_PUBLIC_${name}`;
  if (typeof process !== 'undefined' && process.env && process.env[expoName]) {
    return process.env[expoName] as string;
  }
  
  if (defaultValue !== undefined) {
    return defaultValue;
  }
  
  throw new Error(`Environment variable ${name} is not defined`);
};

// Common environment variables
export const ENV = {
  PARTS_API_URL: getEnv('PARTS_API_URL', 'https://example.com/api/parts'),
  LABOUR_API_URL: getEnv('LABOUR_API_URL', 'https://example.com/api/labour'),
};
