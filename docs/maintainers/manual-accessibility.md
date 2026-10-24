# Manual accessibility acceptance

Status: **manual execution pending; unverified accessibility accepted as a stable 1.0 limitation**.
Prepared on 2026-10-17 for review task T9.6. No NVDA, VoiceOver, Safari or mobile
device pass is claimed by this document.

On 2026-10-22 the owner reported being unable to perform the manual checks now.
At that time no manual pass or waiver was granted. On 2026-10-24 the owner
explicitly accepted `1.0.0-rc.1` with unverified manual accessibility as a known
limitation and authorized merge and CI/Pages delivery. This RC-specific decision
did not supply manual results or stable-release acceptance. On 2026-10-25, after
reviewing the remaining stable requirements, the owner chose immediate stable
delivery and accepted this continuing gap for 1.0.0 as a known limitation.
All execution cells remain Pending. Successful automated CI does not fill these result cells.
The owner's separate font appearance acceptance is retained in the RC record.

Use this protocol against the exact release candidate and its production
Playground or installed consumer. Record the source SHA, installed archive hash
and URL. An earlier source test, axe report, accessibility-tree snapshot or
Playwright WebKit run does not fill a manual result cell.

## Environments and evidence

| Required setup | Input | Exact versions/date/operator | Result |
| --- | --- | --- | --- |
| Windows + NVDA + Firefox | Keyboard; browse and focus modes | Pending | Pending |
| macOS + VoiceOver + Safari | Keyboard; normal reading and interaction | Pending | Pending |
| Physical iPhone/iPad + VoiceOver + Safari | Swipe navigation, touch exploration and activation | Pending | Pending |

Use the actual installed versions; do not substitute a browser engine name for
a Safari/device result. Record screen-reader verbosity, language, keyboard
layout, relevant extensions and any nondefault browser settings. Enable the
screen reader using the [NVDA user guide](https://download.nvaccess.org/documentation/userGuide.html),
[VoiceOver Mac guide](https://support.apple.com/guide/voiceover/welcome/mac) or
[VoiceOver iPhone guide](https://support.apple.com/guide/iphone/turn-on-and-practice-voiceover-iph3e2e415f/ios).

For each setup, review English and Russian labels. Exercise all five themes:
Gavia, Gavia Dark, Classic, Classic Dark and Newspaper. Record each theme in the
result; a theme-independent spoken outcome may refer to one retained transcript,
but focus visibility, zoom and contrast need their own theme observations.
Check desktop at normal and 200% zoom, and mobile in portrait and landscape.

Capture a short speech transcript or recording and the observed focus location
for each failed state. A successful result records the announced name, role,
state and value; exact spoken wording may differ by voice and version.
The [WAI-ARIA Authoring Practices patterns](https://www.w3.org/WAI/ARIA/apg/patterns/)
are a reference for expected semantics and keyboard behavior. Compare them with
the component's documented interaction model and record any intended deviation.

## Ten required component scenarios

Every row starts **Pending** on all three setups. Complete the common checks
below as well as its specific sequence. Keep results by component, platform,
locale and theme; do not turn the entire table green from a single example.

| ID / component | Sequence and observable outcome | NVDA / Mac / iOS |
| --- | --- | --- |
| A01 — WlField with WlInput | Navigate to a labeled required field with help. Read its name, required state and help. Submit an invalid value: help and error remain connected, the entered value is preserved, invalid state is read. With announceError enabled, a new error is announced once; passive errors do not interrupt twice. | Pending / Pending / Pending |
| A02 — WlSelect | Open a named combobox containing at least 30 options, including disabled entries. Move using its documented arrows, Home/End and typeahead; the active option stays visible and is announced. Commit once, reopen, clear, then inspect empty/no-results and disabled states. Active-descendant references resolve to the active option. | Pending / Pending / Pending |
| A03 — WlMultiSelect | Select and unselect several options, including repeated labels with distinct values. Selection state and count are understandable; disabled entries cannot change. Remove a chip by its named action, clear and reopen. Keyboard focus remains usable and selection is not announced twice. | Pending / Pending / Pending |
| A04 — WlAutocomplete | Type free text, wait for suggestions, move to and select a result, then clear. Exercise multiple mode, loading, no results and a failed/retried consumer request. Free text and selected values are distinguishable; asynchronous updates keep focus and do not commit stale results. | Pending / Pending / Pending |
| A05 — WlTabs | Render two instances with overlapping item keys. Enter the tablist, follow the documented activation mode and move past disabled items. The selected tab and its panel are named and connected; hidden panels are not read as active content. Orientation changes preserve the documented arrow behavior. | Pending / Pending / Pending |
| A06 — WlDialog | Open a named dialog from a button, inspect initial focus, move forward/backward through controls, open and close a nested dialog, then close the outer dialog. Focus stays in the top modal and returns to the appropriate opener. Background content is unavailable to reading and mobile swipe navigation. Repeat during transitions. | Pending / Pending / Pending |
| A07 — WlDrawer | Open, read title and description, interact, close by documented controls and reopen. Check Escape where available, an explicit mobile close action, nested popover, scroll locking and focus return. Background swipe navigation cannot escape an open modal drawer. | Pending / Pending / Pending |
| A08 — WlMenu | Open with the named trigger; navigate actions, disabled entries and submenus. Inspect checkbox/radio states and a link item. Open WlContextMenu using Shift+F10 where available and its documented accessible trigger on mobile. Close one level, then all levels; focus returns to the correct trigger. | Pending / Pending / Pending |
| A09 — WlDatePicker | Open from a named control, identify the current/selected date and move across month/year boundaries. Choose a valid date, reject disabled dates and cancel without changing the model. Check range mode and localized month/day names. On mobile, the grid remains reachable and a complete selection can be made. | Pending / Pending / Pending |
| A10 — WlToast | Trigger polite and urgent messages and a grouped message. Read each once without moving focus. Pause a timed toast on hover/focus where applicable, update it, dismiss it and clear its group. Actions have names, background announcements do not repeat after reopening, and urgent messages do not duplicate polite announcements. | Pending / Pending / Pending |

## Common observations and extended coverage

- Keyboard focus is visible, follows a logical order and is never trapped
  outside an intentionally modal surface. A disabled control does not activate.
- Labels survive localization and zoom. Color is accompanied by text/state;
  icon-only controls and dismiss actions have meaningful names.
- Repeat open/close, cancel and retry. An animation or a late response must not
  restore focus to removed content or make a closed surface readable again.
- On mobile, swipe through the entire open surface, activate its controls and
  return to its opener. Test touch exploration outside a modal as well.
- Verify reduced motion and a second instance where IDs or live regions exist.

Before accepting the full release, add focused results for the new
CheckboxGroup/RadioGroup, WlTooltip, Toolbar and TagsInput contracts;
for tooltip content, include keyboard dismissal and a disabled trigger wrapper.
The ten rows above establish a minimum protocol, not coverage of every public
component or every consumer composition.

## Result record

Copy this block into the release evidence record for each completed scenario:

```text
Scenario / component / state:
Status: Pending | Pass | Fail | Blocked | Not applicable (reason required)
Run date and operator:
Source SHA / package version / archive SHA256:
Consumer URL / reproduction:
OS and device / browser / screen reader (exact versions):
Locale / theme / viewport / zoom / input mode:
Expected name, role, state, value and focus:
Observed speech and focus:
Transcript or recording / automated evidence links:
Defect, severity and issue reference:
Retest date, revision and result:
Owner acceptance and date:
```

Blocked and not applicable are separate from pass. Missing versions, an
unavailable device or a reproduction problem remains pending/blocked. Fixes
need a retest against the new revision; keep the original failure record.
Unresolved failures affecting a core interaction block acceptance until fixed
or explicitly dispositioned by the owner. Report manual acceptance separately
from code readiness, automated results and publication in
[the RC checklist](release-candidate.md).
