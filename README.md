# Affiliate Chrome Extension

A Chrome extension for crawling affiliate data.

## Download

You can download the latest version of the extension from the [Releases](https://github.com/hdevlinz/tiktok-affiliate-crawler/releases) page.

> [!NOTE]
> Make sure to download the correct version for your browser and follow the installation instructions provided.

## Development

To start development, install dependencies and run the development server:

```sh
pnpm install
pnpm run dev
```

> [!NOTE]
> It is recommended to install dependencies using `pnpm` instead of `npm`. <br />
> Node version >= 14.18.0

## Usage

### Build the Extension

To build the extension, run:

```sh
pnpm run build
```

> [!NOTE]
> When the build is complete, the `build` directory will be created in the root of the project.

To create a zip file for distribution:

```sh
pnpm run zip
```

> [!NOTE]
> The resulting zip file will be created in the `package` directory when the command completes.

### Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" by toggling the switch in the top right corner
3. Click on "Load unpacked" and select the `build` directory or zip file in `package` directory
4. Pin the extension to the toolbar for easy access (or press Alt + A)
