# ESM2CJS

A utlity for replacing `import/export` ESM syntax with `require` calls for the
few stone-age tools that still don't support ESM in 2020.

## Installation

`npm i -g tomashubelbauer/esm2cjs` or use `npx` to ad-hoc.

## Usage

- `esm2csj` if installed using `npm i -g tomashubelbauer/esm2cjs`
- `npx tomashubelbauer/esm2cjs` to run ad-hoc without installation

## Development

`npm test` to run on the `test` directory.

### To-Do

#### Address code to-do comments

Use [`todo`](https://github.com/tomashubelbauer/todo).

#### Support all `export` and `import` variants

https://developer.mozilla.org/en-US/docs/web/javascript/reference/statements/export
https://developer.mozilla.org/en-US/docs/web/javascript/reference/statements/import

#### Support the transformations needed for MarkRight and use this there

#### Make this into an executable like `todo` and use in MarkRight CI/CD
