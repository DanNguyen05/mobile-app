export default ({ config }) => {
  return {
    ...config,
    name: "Ceres",
    slug: "ceres-health",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#10b981"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.ceres.health"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#10b981"
      },
      package: "com.ceres.health",
      permissions: ["CAMERA", "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE"]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-camera",
        {
          cameraPermission: "Allow Ceres to access your camera for food scanning."
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "Allow Ceres to access your photos for progress tracking."
        }
      ],
      "expo-secure-store",
      "expo-asset",
      "expo-font"
    ],
    extra: {
      // API URL configuration
      // During development, this will use the Expo dev server IP
      // In production, set EXPO_PUBLIC_API_URL environment variable
      apiUrl: process.env.EXPO_PUBLIC_API_URL || null,
      eas: {
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID || "your-project-id"
      }
    }
  };
};
