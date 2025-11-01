import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.pharmacy.management',
  appName: 'Pharmacy Management',
  webDir: '.next', // Changed from 'out' to work with Next.js server mode
  server: {
    androidScheme: 'https',
    url: 'http://localhost:3000', // Point to Next.js dev server
    cleartext: true, // Allow HTTP for development
    allowNavigation: [
      'localhost:3000',
      'localhost:3001',
      '127.0.0.1:3000',
      '127.0.0.1:3001'
    ]
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: false
    },
    StatusBar: {
      style: 'default',
      backgroundColor: '#ffffff'
    }
  }
};

export default config;
