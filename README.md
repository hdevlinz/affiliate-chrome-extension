# Tiktok Affiliate Crawler

A Chrome extension for crawling affiliate data.

## Run Mock API

```sh
cd mock-api
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

### Endpoints

#### Get Creator Ids

```sh
http://localhost:8000/creator-ids
```

#### Post Creators Data

```sh
http://localhost:8000/creators
```

#### Post Creators Error

```sh
http://localhost:8000/creators/errors
```

## Download

You can download the latest version of the extension from the [Releases](https://github.com/hdevlinz/tiktok-affiliate-crawler/releases) page.

> [!NOTE]
> Make sure to download the correct version for your browser and follow the installation instructions provided.

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

> [!NOTE]
> When the build is complete, the `build` directory will be created in the root of the project.

To create a zip file for distribution:

```sh
npm run zip
```

> [!NOTE]
> The resulting zip file will be created in the `package` directory when the command completes.

### Load the Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" by toggling the switch in the top right corner
3. Click on "Load unpacked" and select the `build` directory or zip file in `package` directory
4. Pin the extension to the toolbar for easy access (or press Alt + A)
