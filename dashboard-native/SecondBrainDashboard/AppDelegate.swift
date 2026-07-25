/**
 * AppDelegate.swift
 * Sets up the main window with NSVisualEffectView (Liquid Glass / vibrancy),
 * installs the WKWebView, and manages the app menu.
 *
 * Window specs:
 *   - 1440 × 900 default, resizable, min 900 × 600
 *   - NSVisualEffectView with .contentBackground material = frosted vibrancy
 *   - Titlebar: .unified + transparent so the glass bleeds into chrome
 *   - Full-size content view so the WebView fills the title bar area
 */

import Cocoa
import WebKit

final class AppDelegate: NSObject, NSApplicationDelegate {

    var window: NSWindow!
    var webViewController: WebViewController!

    func applicationDidFinishLaunching(_ notification: Notification) {
        buildMenu()
        buildWindow()
        NSApp.activate(ignoringOtherApps: true)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        true
    }

    // ── Window ────────────────────────────────────────────────────────────

    private func buildWindow() {
        let contentRect = NSRect(x: 0, y: 0, width: 1440, height: 900)
        let style: NSWindow.StyleMask = [
            .titled, .closable, .miniaturizable, .resizable, .fullSizeContentView,
        ]

        window = NSWindow(
            contentRect: contentRect,
            styleMask: style,
            backing: .buffered,
            defer: false
        )

        window.title = "SecondBrain"
        window.minSize = NSSize(width: 900, height: 600)
        window.titlebarAppearsTransparent = true
        window.titleVisibility = .hidden
        window.isMovableByWindowBackground = true
        window.center()

        // Liquid Glass vibrancy as the root view
        let visualEffect = NSVisualEffectView()
        visualEffect.material = .contentBackground   // richest frosted glass
        visualEffect.blendingMode = .behindWindow
        visualEffect.state = .active
        visualEffect.autoresizingMask = [.width, .height]

        webViewController = WebViewController()
        webViewController.view.frame = visualEffect.bounds
        webViewController.view.autoresizingMask = [.width, .height]
        visualEffect.addSubview(webViewController.view)

        window.contentView = visualEffect
        window.makeKeyAndOrderFront(nil)
    }

    // ── App menu ──────────────────────────────────────────────────────────

    private func buildMenu() {
        let menuBar = NSMenu()

        // App menu
        let appItem = NSMenuItem()
        let appMenu = NSMenu()
        appMenu.addItem(NSMenuItem(title: "About SecondBrain",  action: #selector(NSApplication.orderFrontStandardAboutPanel(_:)), keyEquivalent: ""))
        appMenu.addItem(.separator())
        appMenu.addItem(NSMenuItem(title: "Reload Dashboard",   action: #selector(reload), keyEquivalent: "r"))
        appMenu.addItem(.separator())
        appMenu.addItem(NSMenuItem(title: "Quit SecondBrain",   action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q"))
        appItem.submenu = appMenu
        menuBar.addItem(appItem)

        // View menu
        let viewItem = NSMenuItem()
        let viewMenu = NSMenu(title: "View")
        let fullscreen = NSMenuItem(title: "Enter Full Screen", action: #selector(NSWindow.toggleFullScreen(_:)), keyEquivalent: "f")
        fullscreen.keyEquivalentModifierMask = [.command, .control]
        viewMenu.addItem(fullscreen)
        viewItem.submenu = viewMenu
        menuBar.addItem(viewItem)

        NSApp.mainMenu = menuBar
    }

    @objc private func reload() {
        webViewController.reload()
    }
}
