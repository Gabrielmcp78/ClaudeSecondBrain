

## Artifact Status Ledger Template - 2026-07-23
# Artifact Status Ledger Template

Use this template for project files that agents may cite, edit, assemble, or evaluate.

## Status values

- Canonical Manuscript
- Experimental Draft
- Options Pass
- Approved - Not Assembled
- Submission Artifact
- Visual Companion
- Secondary Critique / Reference
- File-Control Index
- Archive / Backup
- Unknown - Verify Before Use

## Ledger fields

| Field | Required note |
| --- | --- |
| Project | STRING THEORY, BURNThrough, or other project name |
| File title | Exact title from local path or Drive |
| File id/path | Drive id, local absolute path, or both |
| Status | One status value above |
| Scope | Chapter, section, scene, or whole-project range |
| Last verified | Date and verifier/agent if known |
| Source relationship | Canon source, derivative, cleanup, experiment, reference, or companion |
| Allowed operations | Read, summarize, critique, revise, assemble, update metadata, etc. |
| Forbidden operations | Any action requiring fresh authorization |
| Notes | Counts, known drift, duplicate artifacts, or next operation |

## Default rule

If status is not known, treat the file as `Unknown - Verify Before Use`. Do not promote it to canon, approved, assembled, or current from memory alone.
