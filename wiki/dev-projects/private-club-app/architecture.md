# Private Club App — Project Architecture

*The Private Club App is a mobile-first application built using React Native and Expo, integrated with Supabase for data management and push notifications, and featuring a WebAuthn passkey-based authentication path alongside standard SMS/email OTP flows.* (source: package.json, authService.ts)

<!-- kb-status: level=active | phase="Phase 03 — Active Development" | updated=2026-06-12 -->
**Status:** 🟡 Active — Phase 03 (Active Development)

---

## System Overview

The application serves as the member-facing client for a private club platform. It operates under a multi-device model, using local authentication states backed by Expo SecureStore and synchronizing with a remote Supabase instance. 

---

## Technical Stack

- **Framework**: Expo (React Native) v55.0 with React 19.2
- **State & Query Management**: React Query (TanStack Query) v5 and Zustand v5
- **Database & Auth Backend**: Supabase JS Client v2.56
- **Styling & UI**: `@callstack/liquid-glass` (macOS 26 Visual Language) and `react-native-paper`
- **Security & Cryptography**: `@noble/hashes` (SHA-256 validation) and `expo-secure-store`
- **Routing**: `expo-router` v55.0

---

## Component Architecture

The app codebase is organized into modules within the `src/` directory:
- `features/`: Specific domain modules (auth, members, membership, messaging, chat, events, notifications, wallet).
- `providers/`: Context providers for global application states.
- `navigation/`: React Navigation and Expo Router configurations.
- `lib/`: Shared utility libraries (e.g., Supabase client configuration).
- `stores/`: Zustand global store definitions.

### Authentication Service (`src/features/auth/authService.ts`)
The auth engine supports three discrete operational states:
1. **Supabase Live OTP**: Leverages Supabase auth for standard SMS and email OTP sign-ins.
2. **WebAuthn Passkeys**: Authenticates members using device hardware keys, bypassing password and OTP paths.
3. **Local Dev Fallbacks**: Provides local member and dev-admin sessions to allow offline testing when the remote Supabase endpoint is not configured.

### Push Notifications Integration (`src/lib/supabase.ts`)
Upon successful session synchronization, the app bootstrap registers the device with Supabase using `registerForPushNotificationsAsync` to link push tokens with individual `memberId` records.

---

## Current Status (Phase 03)

The project is in **Phase 03 — Active Development**.

### Core Implementations Completed
- Core navigation architecture.
- Membership runtime state.
- Progressive Web App (PWA) installation flows.
- Multi-channel notification preferences configuration.

### Active Blockers and Next Steps
1. **Mock Authentication Bypasses**: The codebase contains local session mock overrides. Live verification requires disabling these bypasses in favor of real Supabase OTP authentication.
2. **Database Schema Migrations**: Migration files `025` and `026` must be applied to the Supabase backend to establish correct Row Level Security (RLS) tables and policies before live verification.
3. **Multi-Device Live Verify**: Execution of automated tests using the `.env.liveverify` config against real hardware devices is pending.
