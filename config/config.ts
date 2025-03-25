//!首页

import { menus } from './hooks';

export default {
  exportStatic: {},
  nodeModulesTransform: {
    type: 'none',
    exclude: [],
  },
  publicPath: '/ht_hooks/',
  history: { type: 'hash' },
  extraBabelPlugins: [
    [
      'babel-plugin-import',
      {
        libraryName: '@alifd/next',
        style: false,
      },
      'fusion',
    ],
  ],
  title: '萌桐 hooks',
  mode: 'site',
  favicon: '/ht_hooks/avatar.png',
  logo: '/ht_hooks/avatar.png',
  dynamicImport: {},
  manifest: {},
  hash: true,
  alias: { //别名
    htHooks: process.cwd() + '/packages/hooks/src/index.ts',
    ['ht_hooks']: process.cwd() + '/packages/hooks/src/index.ts',
  },
  resolve: {
    includes: ['docs', 'packages/hooks/src'], //dumi读取的文档
  },
  links: [ //CDN方式引入主题包
    {
      rel: 'stylesheet',
      href: 'https://unpkg.com/@alifd/theme-design-pro@0.6.2/dist/next-noreset.min.css',
    },
    { rel: 'stylesheet', href: '/style.css' },
  ],
  navs: [ //导航
    { title: '指南', path: '/guide' },
    { title: 'Hooks', path: '/hooks' },
    { title: 'GitHub', path: 'https://github.com/MengToong/ht_hooks' },
  ],
  menus: { //布局
    '/': [
      {
        title: '首页',
        path: 'index',
      },
    ],
    '/guide': [
      {
        title: '介绍',
        path: '/guide',
      },
    ],
    '/hooks': menus,
  },
};
