# Ronin

A top-down browser game (vanilla JS + canvas) with Supabase accounts and cloud saves. It is a static site: no build step.

## Setup

1. In the Supabase SQL editor, run [`supabase/schema.sql`](supabase/schema.sql). It creates `player_saves` (3 slots per user, row-level security) and the `delete_own_account()` function.
2. In Supabase > Authentication > URL Configuration, add the URL where the game is hosted to **Redirect URLs** (needed for email confirmation and password reset links).
3. Serve the folder with any static host, e.g. `python -m http.server`, and open `index.html`.

## Layout

- `index.html`, `style.css`: page, overlays, styling
- `js/errors.js`: global error toast
- `js/audio.js`: procedural music and sound effects
- `js/settings.js`: volume, key remapping, help screen
- `js/world.js`: maps, NPC and story data
- `js/game.js`: gameplay, rendering, accounts and save slots, touch controls, game loop
- `supabase/schema.sql`: database schema

## Smoke test

Serve the repo and open `http://localhost:8000/tests/smoke.html`. It loads the game, starts a fake user, updates and draws every scene, and reports PASS/FAIL.
