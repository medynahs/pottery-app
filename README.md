# Pottery Life

Expo / React Native app for studio pottery tracking — pieces, kiln, glazes, community, and profile.

## Documentation

| File | Purpose |
|------|---------|
| [**FRONTEND.md**](./FRONTEND.md) | V1 release tickets, product decisions, Kiln/Glaze/Challenge roadmaps |
| [**BACKEND.md**](./BACKEND.md) | API overview, sync patterns, deployment status |
| [**BACKEND-TASKS.md**](./BACKEND-TASKS.md) | Prioritized backend backlog (P0 → P2) |

---

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

src/
├─ core/                     ← shared UI, theme, navigation, hooks, config, mascot
│   ├─ components/
│   ├─ theme/
│   ├─ navigation/
│   ├─ hooks/
│   ├─ config/
│   └─ mascot/
├─ features/                 ← each feature owns its own screens/components/tests
│   ├─ pieces/
│   │   ├─ screens/PiecesScreen.tsx   ← example screen
│   │   ├─ components/
│   │   └─ tests/
│   ├─ studio/…
│   ├─ homePractice/…
│   ├─ learning/…
│   ├─ community/…
│   ├─ journal/…
│   └─ glazes/…
│   └─ index.ts               ← central exports of feature screens
├─ services/                 ← API/back‑end helpers
├─ store/                    ← global state (Redux/Context placeholder)
├─ types/                    ← shared TypeScript interfaces
└─ … (existing utils, screens, etc.)