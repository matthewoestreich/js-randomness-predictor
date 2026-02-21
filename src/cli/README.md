# CLI

- `cli.ts` is the entry-point for the CLI

## Dry Run

- You can use an env var `process.env.JSRP_DRY_RUN = '1'` to only test conditions up to the point where we are about to create a predictor, but we don't actually create one.
- A dry run DOES NOT RUN THE PREDICTOR, so you will not have any predictions in results.
