import {
  createApiFactory,
  createPlugin,
  createRoutableExtension,
  discoveryApiRef,
  fetchApiRef,
  identityApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { simpleChatApiRef } from './api/types';
import { SimpleChatClient } from './api/SimpleChatClient';

const pluginId = 'simple-chat';

export const simpleChatPlugin = createPlugin({
  id: pluginId,
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: simpleChatApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        fetchApi: fetchApiRef,
        identityApi: identityApiRef,
      },
      factory: ({ discoveryApi, fetchApi, identityApi }) =>
        new SimpleChatClient({ discoveryApi, fetchApi, identityApi, pluginId }),
    }),
  ],
});

export const SimpleChatPage = simpleChatPlugin.provide(
  createRoutableExtension({
    name: 'SimpleChatPage',
    component: () =>
      import('./components/ExampleComponent').then(m => m.ExampleComponent),
    mountPoint: rootRouteRef,
  }),
);
