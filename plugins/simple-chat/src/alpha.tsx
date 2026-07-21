import {
  ApiBlueprint,
  createApiFactory,
  createFrontendPlugin,
  createRouteRef,
  discoveryApiRef,
  fetchApiRef,
  identityApiRef,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import { RiChat1Line } from '@remixicon/react';
import {
  SIMPLE_CHAT_USER_LIST_FLAG,
  simpleChatApiRef,
} from './api/types';
import { SimpleChatClient } from './api/SimpleChatClient';

const rootRouteRef = createRouteRef();

const simpleChatApi = ApiBlueprint.make({
  name: 'simple-chat',
  params: defineParams =>
    defineParams(
      createApiFactory({
        api: simpleChatApiRef,
        deps: {
          discoveryApi: discoveryApiRef,
          fetchApi: fetchApiRef,
          identityApi: identityApiRef,
        },
        factory: ({ discoveryApi, fetchApi, identityApi }) =>
          new SimpleChatClient({
            discoveryApi,
            fetchApi,
            identityApi,
            pluginId: 'simple-chat',
          }),
      }),
    ),
});

const simpleChatPage = PageBlueprint.make({
  params: {
    path: '/simple-chat',
    routeRef: rootRouteRef,
    title: 'Simple Chat',
    icon: <RiChat1Line />,
    noHeader: true,
    loader: () =>
      import('./components/ExampleComponent').then(m => (
        <m.ExampleComponent />
      )),
  },
});

/**
 * Simple Chat plugin for the Backstage new frontend system.
 * @alpha
 */
export default createFrontendPlugin({
  pluginId: 'simple-chat',
  info: { packageJson: () => import('../package.json') },
  featureFlags: [
    {
      name: SIMPLE_CHAT_USER_LIST_FLAG,
      description:
        'Show a side panel of users currently connected to the chat instance',
    },
  ],
  extensions: [simpleChatApi, simpleChatPage],
  routes: {
    root: rootRouteRef,
  },
});
