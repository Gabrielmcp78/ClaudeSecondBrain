

## Discovered File Inventory - 2026-07-23
# Discovered File Inventory - 2026-07-23

This inventory records files surfaced by SecondBrain / Drive search during the agent-control and knowledge-base expansion pass. It is a discovery index, not a claim that each file's contents have been fully ingested or validated.

## Agent control / SecondBrain process files

| Name | Drive id | Type | Modified | Handling |
| --- | --- | --- | --- | --- |
| `agent-protocol.md` | `1whLAd_5X9g1qwR1uCD3BxrTCNmJH_gtd` | markdown | 2026-07-16T21:55:55Z | Priority ingestion source for agent behavior. |
| `decision-registry.md` | `1NPRjpbfJHqMlZGbFdPW4mg47OWyze7oT` | markdown | 2026-07-18T12:09:31Z | Priority ingestion source for durable decisions. |
| `change-log.md` | `14R3ewY3WY77KBglWdnQJmW5dgHhJGjAr` | markdown | 2026-07-23T21:27:37Z | Priority ingestion source and changelog target. |
| `handoffs.md` | `1MM1TsaFyCCDQxvvDXhHrYuCTKIvA49CR` | markdown | 2026-07-16T17:41:06Z | Priority ingestion source for task continuity. |
| `inbox.md` | `1hFriAISnhiSItVIpLbnMHNLg4b1TWYQy` | markdown | 2026-07-22T23:00:05Z | Startup/status source. |
| `task-ledger.md` | `1PheV5RTAGk1UTSvTTyiMSVbFB5IhHHE9` | markdown | 2026-07-18T16:31:04Z | Priority ingestion source for active/past tasks. |
| `2026-07-18_health-check.md` | `1fr7WAMNFN1NIVjAJHGZ26W2B4vC3d6Zq` | markdown | 2026-07-18T16:13:27Z | Health-check source. |
| `_index.md` | `1gA6z3NVu5UXrkpYa4WQevjutMXjpwHm6` | markdown | 2026-07-23T18:29:05Z | Wiki index; appended with new control notes. |
| `_connections.md` | `1gQRoXBupBPitRH9djDN_FIbIPfY627nM` | markdown | 2026-07-23T20:34:02Z | Connection/reference map. |

## BURNThrough / Aegis Cycle files surfaced

| Name | Drive id | Type | Modified | Handling |
| --- | --- | --- | --- | --- |
| `BT File Control Index` | `1gL8HotoOvgvBozQS73lX82XPWrS2IkQU9A_GwHN2rQU` | native Google Sheet | 2026-07-21T01:37:53.891Z | File-control index. Verify before updating. |
| `burnthrough-current-state.md` | `1PWr2Dy8p8nNlsJQFv8xYUWL6pSCZuvhw` | markdown | 2026-07-21T01:53:56Z | Priority BURNThrough state source. |
| `burnthrough-opening-pass-r01-2026-07-20.md` | `16iocUH44PuHprZzHJ3QnASs73DMHHwCq` | markdown | 2026-07-21T01:45:51Z | Opening pass artifact; status must be checked before use. |
| `burnthrough-ch7-ch13-continuity-bridge-2026-07-20.md` | `1VBUdh7YfPWZjIgsesZHTDeqmim1T97Qr` | markdown | 2026-07-21T01:53:07Z | Noncanonical continuity architecture unless approved/assembled. |
| `burnthrough-ch3-ch6-transfer-board-2026-07-20.md` | `1ZX0Wgyt4hkqtN_5Iq5y4FXeagp9QaWrY` | markdown | 2026-07-21T01:45:51Z | Transfer board; verify status before applying. |

## STRING THEORY files surfaced

| Name | Drive id | Type | Modified | Handling |
| --- | --- | --- | --- | --- |
| `STRING_THEORY__8.0_READING_DRAFT_COMPLETE__2026-07-20` | `1qlr23KamLarDJBXTroUH0K2UG-6w-2sUSDk6UsgRiIs` | Google Doc | 2026-07-23T10:04:59.625Z | Reading/submission artifact; not automatically canon. |
| `STRING_THEORY__READING_DRAFT_COMPLETE__2026-07-20.txt` | `1cCjaZKwa-eywPw9BxuM5w-u4QD_DBUwl` | text | 2026-07-21T05:30:15.214Z | Reading/submission artifact; duplicate title exists. |
| `STRING_THEORY__READING_DRAFT_COMPLETE__2026-07-20.txt` | `1XoQE_45Zc8Bgsx1e66e0np8_iZ_s2NYe` | text | 2026-07-21T04:45:29.067Z | Reading/submission artifact; duplicate title exists. |
| `Chapter 9 work NEW` | `1RYzh2Y6YPXRCfHGUj54arTqoNr2O1iplDo5flm9Hlr8` | Google Doc | 2026-03-01T21:55:24.231Z | Chapter work document; verify current relevance before use. |
| `String Theory - Draft 6.7.docx` | `15wE9pYq9f-ExrXA3GZ-oJPETfP-WyVtO` | Word document | 2026-07-21T01:47:54.911Z | Canonical manuscript layer per prior memory; reverify before use. |
| `String Theory - Draft 6.7.txt` | `1oMsjIAiUsQDipDXgzv0K0b5JGrdVuK03` | text | 2026-07-21T01:47:51.278Z | Canonical manuscript layer per prior memory; reverify before use. |
| `String Theory.epub` | `1Y7FOTr29u5gLksLt_nDxxpNylCDp-PCJ` | EPUB | 2026-07-07T18:01:30.326Z | Distribution/reading artifact; not source authority by default. |
| `String theory - full plot summmary***` | `1oT6gJtQ-bM2cwTol9JQnc4VPwEnp6MRtaPGe1JhgTXs` | Google Doc | 2026-03-23T14:15:37.577Z | Secondary summary, not prose source. |

## Search gaps observed

- Local `secondbrain` workspace search returned no hits for several obvious new and existing control terms.
- Drive search surfaced key files, but combined/OR-style queries were inconsistent.
- `StringTheory_7.2_options` did not surface in current Drive search; prior memory still identifies it as experimental opening material, so it should be located by direct path/local manuscript search before use.

## Next ingestion action

For each priority file, create a normalized wiki note with: source class, current status, scope, modified time, allowed operations, forbidden operations, and drift hazards.
