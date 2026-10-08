# Recorded final-QA finding

`caption-wall-before-fix.jpg` records the failing flashlight-wall fixture at runtime `98ba16f`: contrast 1.96:1, halo 0.90, soft-backing response 0.11. It is not a passing final capture.

Commit `797bf62` makes the existing backing respond earlier. The matching rendered regression in `../chapter3-astra-caption/` passes with response 0.68, transparent background and zero border. Six focused unit checks cover the response and its fade-out. Existing full-browser assertions were retained.

`opening-capture-timeout.jpg` is the diagnostic frame from a later sequential run that exceeded the original 120 s screenshot deadline on the Chapter Three opening card. It is not a passing walkthrough capture. No game/shader error or memory-exhaustion event was recorded. The main and DEV walkthrough harnesses allow 300 s for screenshots on this software renderer; resolution and gameplay assertions are unchanged.
