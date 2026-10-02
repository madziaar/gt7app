# Research Summary

## Domain
Gran Turismo 7 tuning is a highly specialized setup domain with terminology for camber, toe, downforce, natural frequency, anti-roll bars, brake balance, ride height, and LSD sensitivity.

## Product Fit
The app is positioned as a setup planning and race-engineering assistant rather than a generic automotive tool. The strongest value is action-oriented tuning guidance for specific symptoms and tracks.

## Key Risks
- The app relies on correctness of tuning heuristics and AI prompt quality.
- The current community persistence uses unversioned JSON and has risk around durability and validation.
- The frontend is large and concentrated, which increases regression risk as features evolve.

## Strategy
Continue with the current app structure but treat the setup logic, persistence layer, and AI prompt contracts as the critical paths to validate when shipping new work.
