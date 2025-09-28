# 🔧 Android Development Setup Guide

## Quick Setup for Pharmacy Management APK

### Step 1: Install Java Development Kit (JDK)
1. Download JDK 11 or higher from [Oracle](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://openjdk.org/)
2. Install and set JAVA_HOME environment variable:
   ```
   JAVA_HOME=C:\Program Files\Java\jdk-11.0.x
   ```
3. Add to PATH: `%JAVA_HOME%\bin`

### Step 2: Install Android Studio (Recommended)
1. Download from: https://developer.android.com/studio
2. Install with default settings
3. Open Android Studio and complete setup wizard
4. Install Android SDK (API level 30 or higher)

### Step 3: Build Your APK
```bash
# Navigate to frontend directory
cd c:\Users\CMD\Documents\pharmacy-sale\frontend

# Build and sync (if you made changes)
pnpm run mobile:build

# Option A: Use Android Studio (Recommended)
pnpm run mobile:open:android
# Then in Android Studio: Build > Build Bundle(s) / APK(s) > Build APK(s)

# Option B: Command line (after Java/Android SDK setup)
pnpm run android:build
```

### Step 4: Install APK on Device
1. Enable Developer Options on your Android device
2. Enable USB Debugging
3. Connect device via USB
4. Install APK:
   ```bash
   # APK will be located at:
   # android/app/build/outputs/apk/debug/app-debug.apk
   
   # Install using ADB (if available)
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

## 🔄 Development Workflow

### For Live Development (Recommended)
1. Start backend server:
   ```bash
   cd backend
   pnpm run start:dev
   ```

2. Start frontend with mobile access:
   ```bash
   cd frontend
   pnpm run mobile:dev
   ```

3. Connect your mobile device to the same network
4. Access the app at: `http://YOUR_COMPUTER_IP:3000`

### For APK Testing
1. Make changes to your code
2. Build and sync:
   ```bash
   pnpm run mobile:build
   ```
3. Rebuild APK using Android Studio or Gradle

## 🎯 Key Benefits of This Setup

- **Live Reload**: Changes reflect instantly during development
- **Native Features**: Access to device hardware (camera, storage, etc.)
- **Offline Capability**: App works without internet (with proper caching)
- **App Store Ready**: Can be published to Google Play Store
- **Performance**: Native app performance with web technologies

## 🔍 Troubleshooting

### Common Issues:
1. **JAVA_HOME not set**: Install JDK and set environment variable
2. **Android SDK not found**: Install Android Studio or set ANDROID_HOME
3. **Build fails**: Check Gradle version compatibility
4. **App crashes**: Check browser console in Android Studio debugger

### Debug APK Location:
```
frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

### Release APK Location:
```
frontend/android/app/build/outputs/apk/release/app-release.apk
```