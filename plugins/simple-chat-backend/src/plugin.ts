import {
  coreServices,
  createBackendPlugin,
} from '@backstage/backend-plugin-api';
import { createRouter } from './service/router';

/**
 * simpleChatPlugin backend plugin
 *
 * @public
 */
export const simpleChatPlugin = createBackendPlugin({
  pluginId: 'simple-chat',
  register(env) {
    env.registerInit({
      deps: {
        httpRouter: coreServices.httpRouter,
        logger: coreServices.logger,
        config: coreServices.rootConfig,
        httpAuth: coreServices.httpAuth,
        discovery: coreServices.discovery,
      },
      async init({ httpRouter, logger, config, httpAuth, discovery }) {
        httpRouter.use(
          await createRouter({
            logger,
            config,
            httpAuth,
            discovery,
          }),
        );
      },
    });
  },
});
