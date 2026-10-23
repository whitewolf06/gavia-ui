---
"gavia-ui": patch
---

Add optional Core font families with a separate complete Gavia Sans/Gavia fallback
so compact theme loading preserves combining-cluster shaping. The accepted font
binaries and authored drawing stay unchanged. Firefox uses the complete variable
face to avoid Gecko splitting base letters and combining marks across fonts.
