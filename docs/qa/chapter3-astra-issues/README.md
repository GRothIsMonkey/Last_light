# Recorded final-QA finding

`caption-wall-before-fix.jpg` records the failing flashlight-wall fixture at runtime `98ba16f`: contrast 1.96:1, halo 0.90, soft-backing response 0.11. It is not a passing final capture.

Commit `797bf62` makes the existing backing respond earlier. The matching rendered regression in `../chapter3-astra-caption/` passes with response 0.68, transparent background and zero border. Six focused unit checks cover the response and its fade-out. Existing full-browser assertions were retained.
