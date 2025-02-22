# Adu Affiliate Crawler

A Chrome extension for crawling affiliate data.

## Development

To start development, install dependencies and run the development server:

```sh
pnpm install
npm run dev
```

> [!NOTE]
> It is recommended to install dependencies using `pnpm` instead of `npm`.

## Usage

### Build the Extension

To build the extension, run:

```sh
npm run build
```

To create a zip file for distribution:

```sh
npm run zip
```

### Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" by toggling the switch in the top right corner
3. Click on "Load unpacked" and select the `build` directory or zip file in `package` directory
4. Pin the extension to the toolbar for easy access
