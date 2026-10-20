---
"gavia-ui": minor
---

Complete semantic tone support in Toast and confirmation. Add `toast.show()` and typed message/confirmation PT context while preserving existing severity fields, helper aliases and consumer adapters. Promise settlement starts the configured result lifetime even when its tone stays unchanged; explicit zero lifetimes remain sticky. Confirmation cancellation accepts existing reactive entries without cancelling a replacement request.

Add stable string-to-palette colors and optional byte-format settings to `gavia-ui/utils`. FileUpload uses the shared formatter while retaining its released labels, decimal behavior, rounding and megabyte cap, including raw fractional byte limits. Existing two-argument byte formatting remains available.

Update examples and English/Russian documentation. These follow-up changes await verification; earlier archive and browser results do not validate the modified source.
