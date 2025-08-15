
import {
    ApiBlueprint,
    createFrontendPlugin,
    PageBlueprint,
    NavItemBlueprint,
} from '@backstage/frontend-plugin-api';
import {
    discoveryApiRef,
    fetchApiRef,
    identityApiRef,
} from '@backstage/core-plugin-api';
import { createApiFactory } from '@backstage/core-plugin-api';
import {
    convertLegacyRouteRef,
    convertLegacyRouteRefs,
    compatWrapper,
} from '@backstage/core-compat-api';
import ChatIcon from '@material-ui/icons/Chat';
import { rootRouteRef } from './routes';
import { simpleChatApiRef } from './api/types';
import { SimpleChatClient } from './api/SimpleChatClient';

const simpleChatApi = ApiBlueprint.make({
    name: 'simple-chat',
    params: {
        factory: createApiFactory({
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
    },
});

const simpleChatPage = PageBlueprint.makeWithOverrides({
    factory(originalFactory, _) {
        return originalFactory({
            defaultPath: '/simple-chat',
            routeRef: convertLegacyRouteRef(rootRouteRef),
            loader: () =>
                import('./components/ExampleComponent').then(m =>
                    compatWrapper(
                        <m.ExampleComponent />,
                    ),
                ),
        });
    },
});

export const simpleChatNavItem = NavItemBlueprint.make({
    params: {
        routeRef: convertLegacyRouteRef(rootRouteRef),
        title: 'Simple Chat',
        icon: ChatIcon,
    },
});

export default createFrontendPlugin({
    pluginId: 'simple-chat',
    info: { packageJson: () => import('../package.json') },
    extensions: [simpleChatApi, simpleChatPage, simpleChatNavItem],
    routes: convertLegacyRouteRefs({
        root: rootRouteRef,
    }),
});