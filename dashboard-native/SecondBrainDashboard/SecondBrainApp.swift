/**
 * SecondBrainApp.swift
 * Entry point for the SecondBrain native macOS app.
 *
 * Architecture:
 *   - NSApplicationDelegate: controls the app lifecycle
 *   - AppDelegate: creates a single NSWindow with a vibrancy material background
 *   - WebViewController: embeds WKWebView pointing at localhost:10888
 *   - ServerWatcher: polls the Express API until it's ready, then loads the URL
 *
 * The Express server (port 10888) is managed by launchd — see:
 *   dashboard/launchd/com.gabrielmcp.sbbrain.dashboard.plist
 * This app is a native window shell only; it does not start the server.
 *
 * Liquid Glass vibrancy:
 *   NSVisualEffectView with .contentBackground material creates the frosted
 *   translucency that mirrors macOS 26 / visionOS design language.
 */

import Cocoa
import WebKit

@main
struct SecondBrainApp {
    static func main() {
        let app = NSApplication.shared
        let delegate = AppDelegate()
        app.delegate = delegate
        app.setActivationPolicy(.regular)
        app.run()
    }
}
