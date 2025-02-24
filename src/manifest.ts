import { defineManifest } from '@crxjs/vite-plugin'
import packageData from '../package.json'

const isDev = process.env.NODE_ENV == 'development'

export default defineManifest({
  manifest_version: 3,
  name: `${packageData.displayName || packageData.name}${isDev ? ` ➡️ Dev` : ''}`,
  version: packageData.version,
  description: `${packageData.description}`,
  icons: {
    16: 'img/logo-16.png',
    32: 'img/logo-34.png',
    48: 'img/logo-48.png',
    128: 'img/logo-128.png'
  },
  host_permissions: ['*://*.affiliate.tiktok.com/*'],
  permissions: ['tabs', 'activeTab', 'sidePanel', 'storage', 'scripting', 'notifications'],
  action: {
    // default_popup: 'templates/popup.html',
    default_title: `${packageData.displayName || packageData.name} (Alt+A)`,
    default_icon: {
      16: 'img/logo-16.png',
      32: 'img/logo-34.png',
      48: 'img/logo-48.png',
      128: 'img/logo-128.png'
    }
  },
  commands: {
    _execute_action: {
      suggested_key: {
        default: 'Alt+A'
      }
    }
  },
  content_scripts: [
    {
      matches: ['*://*.affiliate.tiktok.com/*'],
      js: ['src/content/index.ts'],
      run_at: 'document_start'
    }
  ],
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module'
  },
  // chrome_url_overrides: {
  //   newtab: 'templates/newtab.html',
  // },
  side_panel: {
    default_path: 'templates/sidepanel.html'
  },
  options_page: 'templates/options.html',
  // devtools_page: 'templates/devtools.html',
  web_accessible_resources: [
    {
      resources: [
        'img/logo-16.png',
        'img/logo-34.png',
        'img/logo-48.png',
        'img/logo-128.png',
        'inject/**',
        'templates/**'
      ],
      matches: ['*://*.affiliate.tiktok.com/*']
    }
  ]
})
