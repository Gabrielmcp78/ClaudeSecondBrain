# SecondBrain Dashboard — Native macOS App

Native macOS wrapper for the SecondBrain dashboard. Displays `http://localhost:10888` inside a native `NSWindow` with **Liquid Glass vibrancy** (`NSVisualEffectView`) — no browser required.

## Architecture

```
dashboard-native/
├── SecondBrainDashboard.xcodeproj/   Xcode project
└── SecondBrainDashboard/
    ├── SecondBrainApp.swift          Entry point (NSApplication bootstrap)
    ├── AppDelegate.swift             Window setup, app menu, vibrancy
    ├── WebViewController.swift       WKWebView + ServerWatcher + LoadingView
    ├── Info.plist                    Bundle metadata, ATS localhost exception
    └── Assets.xcassets/              App icon slots (add .png icons here)
```

### How it works

1. `AppDelegate` creates a 1440×900 `NSWindow` with `NSVisualEffectView` (material: `.contentBackground`) as the root view — this is the Liquid Glass frosted chrome.
2. `WebViewController` embeds a `WKWebView` and starts `ServerWatcher`.
3. `ServerWatcher` polls `localhost:10888/api/system` every 750ms until it gets HTTP 200 (or times out after 30s).
4. On success, the WKWebView loads `http://localhost:10888` and fades in over the loading overlay.
5. `Cmd+R` → Reload (via app menu or `AppDelegate.reload()`).

The Express server is **not started by this app** — it's managed by launchd. See:
```
dashboard/launchd/com.gabrielmcp.sbbrain.dashboard.plist
```

## Prerequisites

- macOS 13.0+
- Xcode 15+
- The launchd service must be loaded (see main dashboard README)

## Build & Run

```bash
# Open in Xcode
open dashboard-native/SecondBrainDashboard.xcodeproj

# Or build from CLI (requires xcode-select)
xcodebuild -project dashboard-native/SecondBrainDashboard.xcodeproj \
           -scheme SecondBrainDashboard \
           -configuration Release \
           -derivedDataPath /tmp/sbbrain-native-build \
           build

# Run the built app
open /tmp/sbbrain-native-build/Build/Products/Release/SecondBrainDashboard.app
```

## App Icon

Add PNG assets to `Assets.xcassets/AppIcon.appiconset/`. Required sizes: 16, 32, 128, 256, 512px at 1x and 2x. The Brain icon from the React dashboard (lucide `Brain`) makes a good starting point — export from Figma or generate via the canvas-design skill.

## Login Item (open at login)

After first build, add the app to Login Items:
`System Settings → General → Login Items → + → select SecondBrainDashboard.app`

Or via CLI:
```bash
osascript -e 'tell application "System Events" to make login item at end with properties {path:"/Applications/SecondBrainDashboard.app", hidden:false}'
```
