const IS_DEV = process.env.APP_VARIANT === 'development'

module.exports = {
    expo: {
        name: IS_DEV ? 'ChatterUI[DEV]' : 'ChatterUI',
        slug: 'ChatterUI',
        version: '0.7.10',
        orientation: 'portrait',
        icon: './assets/images/icon.png',
        scheme: 'chatterui',
        userInterfaceStyle: 'automatic',
        splash: {
            image: './assets/images/splash.png',
            resizeMode: 'contain',
            backgroundColor: '#000000',
        },
        assetBundlePatterns: ['**/*'],
        ios: {
            supportsTablet: true,
        },
        android: {
            adaptiveIcon: {
                foregroundImage: './assets/images/adaptive-icon-foreground.png',
                backgroundImage: './assets/images//adaptive-icon-background.png',
                monochromeImage: './assets/images/adaptive-icon-foreground.png',
                backgroundColor: '#000',
            },
            package: IS_DEV ? 'com.Vali98.ChatterUI.dev' : 'com.Vali98.ChatterUI',

            splash: {
                image: './assets/images/splash.png',
                resizeMode: 'contain',
                backgroundColor: '#000000',
            },
            userInterfaceStyle: 'dark',
            permissions: [
                'android.permission.FOREGROUND_SERVICE',
                'android.permission.WAKE_LOCK',
                'android.permission.FOREGROUND_SERVICE_DATA_SYNC',
            ],
        },
        web: {
            bundler: 'metro',
            output: 'static',
            favicon: './assets/images/adaptive-icon.png',
        },
        plugins: [
            [
                'expo-custom-assets',
                {
                    assetsPaths: ['./assets/models'],
                    assetsDirName: 'appAssets',
                },
            ],
            'expo-router',
            [
                'expo-image-picker',
                {
                    photosPermission:
                        'The app accesses your photos to let you share them with your friends.',
                },
            ],
            [
                'expo-build-properties',
                {
                    android: {
                        largeHeap: true,
                        usesCleartextTraffic: true,
                        enableProguardInReleaseBuilds: true,
                        enableShrinkResourcesInReleaseBuilds: true,
                        useLegacyPackaging: true,
                        extraProguardRules: '-keep class com.rnllama.** { *; }',
                    },
                },
            ],
            './expo-build-plugins/bgactions.plugin.js',
            './expo-build-plugins/copyjni.plugin.js',
            './expo-build-plugins/usercert.plugin.js',
        ],
        experiments: {
            typedRoutes: true,
        },
        extra: {
            router: {
                origin: false,
            },
            eas: {
                projectId: 'd588a96a-5eb0-457a-85bc-e21acfdc60e9',
            },
        },
    },
}