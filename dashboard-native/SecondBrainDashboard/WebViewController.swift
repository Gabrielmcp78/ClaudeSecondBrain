/**
 * WebViewController.swift
 * Manages the WKWebView that renders the SecondBrain dashboard.
 *
 * Behavior:
 *   1. On load, shows a native loading state (not the React spinner) while
 *      ServerWatcher polls localhost:10888/api/system until it responds 200.
 *   2. Once the server is ready, loads the full dashboard URL.
 *   3. Handles reload(), which clears state and re-polls.
 *   4. Injects CSS that hides browser-native scrollbars (the app uses
 *      the custom glass scrollbar defined in index.css).
 *   5. Configures WKWebView to allow localhost connections (required for
 *      macOS App Sandbox) — App Transport Security is relaxed via Info.plist.
 */

import Cocoa
import WebKit
import Combine

private let kDashboardURL = URL(string: "http://localhost:10888")!
private let kPollInterval: TimeInterval = 0.75
private let kPollTimeout:  TimeInterval = 30

final class WebViewController: NSViewController {

    // MARK: – Subviews

    private var webView: WKWebView!
    private var loadingView: LoadingView!
    private var serverWatcher: ServerWatcher?

    // MARK: – Lifecycle

    override func loadView() {
        view = NSView()
        view.wantsLayer = true
        view.layer?.backgroundColor = NSColor.clear.cgColor
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        setupWebView()
        setupLoadingView()
        startWatching()
    }

    // MARK: – Setup

    private func setupWebView() {
        let config = WKWebViewConfiguration()
        // Allow insecure localhost connections
        config.preferences.setValue(true, forKey: "allowFileAccessFromFileURLs")

        // Inject CSS to remove native OS scrollbars — the dashboard has custom glass ones
        let hideScrollbars = """
            ::-webkit-scrollbar { display: none; }
            * { scrollbar-width: none; }
        """
        let userScript = WKUserScript(
            source: "const s = document.createElement('style'); s.textContent = `\(hideScrollbars)`; document.head.appendChild(s);",
            injectionTime: .atDocumentEnd,
            forMainFrameOnly: false
        )
        config.userContentController.addUserScript(userScript)

        webView = WKWebView(frame: view.bounds, configuration: config)
        webView.autoresizingMask = [.width, .height]
        webView.navigationDelegate = self
        webView.alphaValue = 0          // hidden until server is ready
        // Transparent background so vibrancy shows through before the page paints
        webView.setValue(false, forKey: "drawsBackground")
        view.addSubview(webView)
    }

    private func setupLoadingView() {
        loadingView = LoadingView(frame: view.bounds)
        loadingView.autoresizingMask = [.width, .height]
        view.addSubview(loadingView)
    }

    // MARK: – Server polling

    private func startWatching() {
        loadingView.setState(.connecting)
        serverWatcher = ServerWatcher(url: kDashboardURL.appendingPathComponent("api/system"),
                                      interval: kPollInterval,
                                      timeout: kPollTimeout)
        serverWatcher?.onReady = { [weak self] in
            DispatchQueue.main.async { self?.loadDashboard() }
        }
        serverWatcher?.onTimeout = { [weak self] in
            DispatchQueue.main.async { self?.loadingView.setState(.error("Server not responding on :10888. Is the launchd service loaded?")) }
        }
        serverWatcher?.start()
    }

    private func loadDashboard() {
        loadingView.setState(.loading)
        let request = URLRequest(url: kDashboardURL, cachePolicy: .reloadIgnoringLocalCacheData)
        webView.load(request)
    }

    // MARK: – Public

    func reload() {
        serverWatcher?.cancel()
        webView.alphaValue = 0
        startWatching()
    }
}

// MARK: – WKNavigationDelegate

extension WebViewController: WKNavigationDelegate {

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        loadingView.setState(.done)
        NSAnimationContext.runAnimationGroup { ctx in
            ctx.duration = 0.35
            ctx.timingFunction = CAMediaTimingFunction(name: .easeOut)
            self.loadingView.animator().alphaValue = 0
            self.webView.animator().alphaValue = 1
        } completionHandler: {
            self.loadingView.isHidden = true
        }
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        loadingView.isHidden = false
        loadingView.alphaValue = 1
        loadingView.setState(.error(error.localizedDescription))
    }
}

// MARK: – ServerWatcher

/**
 * Polls a health-check URL until it returns HTTP 200 or the timeout elapses.
 * Runs entirely on a background DispatchQueue.
 */
final class ServerWatcher {
    var onReady:   (() -> Void)?
    var onTimeout: (() -> Void)?

    private let url: URL
    private let interval: TimeInterval
    private let timeout:  TimeInterval
    private var startTime: Date?
    private var timer: DispatchSourceTimer?
    private let queue = DispatchQueue(label: "com.gabrielmcp.sbbrain.watcher", qos: .utility)

    init(url: URL, interval: TimeInterval, timeout: TimeInterval) {
        self.url      = url
        self.interval = interval
        self.timeout  = timeout
    }

    func start() {
        startTime = Date()
        schedule()
    }

    func cancel() {
        timer?.cancel()
        timer = nil
    }

    private func schedule() {
        let t = DispatchSource.makeTimerSource(queue: queue)
        t.schedule(deadline: .now() + interval, repeating: interval)
        t.setEventHandler { [weak self] in self?.poll() }
        t.resume()
        timer = t
    }

    private func poll() {
        guard let start = startTime else { return }
        if Date().timeIntervalSince(start) > timeout {
            cancel()
            onTimeout?()
            return
        }
        var req = URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 2)
        req.httpMethod = "GET"
        URLSession.shared.dataTask(with: req) { [weak self] _, resp, _ in
            guard let self else { return }
            if let http = resp as? HTTPURLResponse, http.statusCode == 200 {
                self.cancel()
                self.onReady?()
            }
        }.resume()
    }
}

// MARK: – LoadingView

/**
 * Native loading/error overlay shown before the React app is ready.
 * Styled with NSVisualEffectView to stay consistent with the window's
 * Liquid Glass material.
 */
final class LoadingView: NSView {

    enum State {
        case connecting, loading, done, error(String)
    }

    private let spinner = NSProgressIndicator()
    private let label   = NSTextField(labelWithString: "")
    private let sub     = NSTextField(labelWithString: "")

    override init(frame: NSRect) {
        super.init(frame: frame)
        wantsLayer = true
        layer?.backgroundColor = NSColor.clear.cgColor
        setup()
    }

    required init?(coder: NSCoder) { fatalError() }

    private func setup() {
        spinner.style = .spinning
        spinner.controlSize = .regular
        spinner.isIndeterminate = true
        spinner.translatesAutoresizingMaskIntoConstraints = false
        addSubview(spinner)

        label.font = .monospacedSystemFont(ofSize: 13, weight: .medium)
        label.textColor = .tertiaryLabelColor
        label.alignment = .center
        label.translatesAutoresizingMaskIntoConstraints = false
        addSubview(label)

        sub.font = .monospacedSystemFont(ofSize: 11, weight: .regular)
        sub.textColor = .quaternaryLabelColor
        sub.alignment = .center
        sub.translatesAutoresizingMaskIntoConstraints = false
        sub.maximumNumberOfLines = 3
        sub.preferredMaxLayoutWidth = 340
        addSubview(sub)

        NSLayoutConstraint.activate([
            spinner.centerXAnchor.constraint(equalTo: centerXAnchor),
            spinner.centerYAnchor.constraint(equalTo: centerYAnchor, constant: -20),
            label.topAnchor.constraint(equalTo: spinner.bottomAnchor, constant: 16),
            label.centerXAnchor.constraint(equalTo: centerXAnchor),
            sub.topAnchor.constraint(equalTo: label.bottomAnchor, constant: 6),
            sub.centerXAnchor.constraint(equalTo: centerXAnchor),
            sub.widthAnchor.constraint(lessThanOrEqualToConstant: 360),
        ])
    }

    func setState(_ state: State) {
        switch state {
        case .connecting:
            spinner.startAnimation(nil)
            label.stringValue = "CONNECTING"
            sub.stringValue = "Waiting for SecondBrain server on :10888…"
        case .loading:
            spinner.startAnimation(nil)
            label.stringValue = "LOADING"
            sub.stringValue = ""
        case .done:
            spinner.stopAnimation(nil)
        case .error(let msg):
            spinner.stopAnimation(nil)
            label.stringValue = "SERVER UNAVAILABLE"
            label.textColor = .systemRed
            sub.stringValue = msg + "\n\nRun: launchctl load ~/Library/LaunchAgents/com.gabrielmcp.sbbrain.dashboard.plist"
        }
    }
}
