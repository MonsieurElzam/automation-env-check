## What it's for

An application that starts in production with a missing environment variable often fails silently: an e-mail that never goes out, a payment that never triggers. This script compares your `.env.example` (the versioned reference list) with a real `.env` and tells you what is wrong **before** you deploy. It never prints values, only names.

## Before you start

- An up-to-date `.env.example` in the repository: one line per variable, with an empty or dummy value.
- The file to check (`.env`, `.env.production`, an export from your host…).

## Step by step

1. Run the comparison:
   ```bash
   node src/env-check.mjs samples/env.example samples/env.local
   ```
2. Read the report: **missing** variables (absent from the file), **empty** ones, ones **left at their example value** (`changeme`, `your-…`), and **extra** ones (present but absent from the reference).
3. Fix, then re-run until you see the line "✓ Environnement conforme à la référence" (the scripts print their messages in French).

## Reading the output

The exit code is 2 if a variable is missing or empty. With `--strict`, a leftover example value or an extra variable also counts as an error. An "extra" variable is not necessarily a defect: it is often one you forgot to add to `.env.example`.

## Automating it

In a CI pipeline, before deployment:

```yaml
- run: node src/env-check.mjs .env.example "$ENV_FILE" --strict
```

## Pitfalls

- Never put real values in `.env.example`.
- The script does not check that a value is *correct* (a database URL can be well-formed and point to the wrong place), only that it is present.
