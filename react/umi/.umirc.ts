import { defineConfig } from 'umi';
import { routerList } from './src/router'

export default defineConfig({
  nodeModulesTransform: {
    type: 'none',
  },
  routes: [
    {
      path: '/',
      component: '@/pages/index',
      routes: [
        ...routerList
      ]
    }
  ],
});
