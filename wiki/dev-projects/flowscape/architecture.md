# FlowScape Project Architecture

(Source: Inferred from `flowscape-engine.md` synthesis)

<!-- kb-status: level=operational | phase="Ambient logging, active sessions" | updated=2026-07-07 -->
**Status:** 🔵 Operational — ambient context logging active, sessions recorded through 2026-07-07

This document outlines the architecture for the **FlowScape** project.

## Purpose

FlowScape is a development tool that appears to function as an "ambient context engine." It actively monitors file system changes and developer activity, using this information to provide real-time suggestions, warnings, and predictions.

## Components

Based on the logs and file names observed, the project likely consists of the following components, written in Swift:

- **SystemMonitor.swift**: The core service that watches for file system events.
- **SpotlightEngine.swift**: A component that likely interfaces with macOS Spotlight for broader file system queries.
- **BrowserActivityEngine.swift**: A component to monitor browser usage.
- **SynthesisEngine.swift**: The "Apple Intelligence" component that analyzes the collected data and generates the textual synthesis.
- **ContextPanelView.swift**: The UI component for displaying the information.
- **AppDelegate.swift**: The main application delegate.

## Connections

- This tool is documented in the [FlowScape Ambient Context Engine](</dev-infrastructure/flowscape-engine.md) article in the `dev-infrastructure` section.

*(This is a stub article created to establish the project's place in the knowledge base. It should be expanded with more details about the project's architecture, goals, and status.)*
