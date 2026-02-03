# Publishing the Comodoro Extension

Use this guide to produce an updated `.vsix` package and publish it to the VS Code Marketplace.

## Prerequisites

- Node.js and npm installed locally
- A Microsoft publisher account with the `WeeHung` publisher ID
- A Personal Access Token (PAT) with Marketplace publish rights stored in the `VSCE_PAT` environment variable
- Logged in to npm (only required when installing dependencies from private registries)

## Release Checklist

1. Update `package.json`:
   - Bump the `"version"` field.
   - Confirm `"publisher"` and `"repository"` details are still correct.
2. Review the changelog (if available) and ensure all changes are tested per `TESTING.md`.
3. Commit and push your changes.

## Packaging the Extension

```bash
make package
```

This command will:

1. Install npm dependencies (`npm install`).
2. Run the prepublish build pipeline (`npm run vscode:prepublish`).
3. Create a `.vsix` file in `dist/` using `npx vsce package`.

The generated file is named `comodoro-<version>.vsix`. You can use it to test the build locally (`code --install-extension dist/comodoro-<version>.vsix`) or upload it manually in the Marketplace UI.

## Publishing to the Marketplace

Make sure `VSCE_PAT` is set in your shell session, then run:

```bash
make publish
```

The `publish` target:

1. Runs the full build pipeline (same as `make package` without producing a local `.vsix`).
2. Publishes the extension with `npx vsce publish`.

If you run into authentication errors, re-create the PAT and export it before retrying:

```bash
export VSCE_PAT=<your-new-token>
```

## Cleaning Build Artifacts

To remove compiled output (`out/`) and packaged files (`dist/`), run:

```bash
make clean
```

This is helpful if you want to ensure a fully fresh build.
