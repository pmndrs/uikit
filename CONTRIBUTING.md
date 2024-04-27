## Contributing

This project uses [semantic commits](https://conventionalcommits.org) and [semver](https://semver.org).

To get started, make sure you have [Node](https://nodejs.org) and [PNPM](https://pnpm.io/) installed. Install dependencies, generate files, and build the libraries with:

```bash
pnpm i
pnpm -r convert
pnpm -r generate
pnpm -w generate-base
pnpm -F "@pmndrs/uikit" build
pnpm -w generate-default
pnpm -F "\!@pmndrs/uikit" build
```

### Development

Locally run examples with:

```bash
cd examples/dashboard
pnpm dev
```

**Important**

When making a change to the packages, the `vite` cache of the examples needs to be cleared (delete `node_modules/.vite` inside the running example). Rebuilding the libraries is not necassary unless types have changed.