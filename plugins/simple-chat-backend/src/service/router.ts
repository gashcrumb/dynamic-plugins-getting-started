import {
  DiscoveryService,
  HttpAuthService,
  LoggerService,
  UserInfoService,
} from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
  discovery: DiscoveryService;
  httpAuth: HttpAuthService;
  userInfo: UserInfoService;
}

type ChatMessage = {
  nickname: string;
  timestamp: string;
  message: string;
};

const messages: ChatMessage[] = [];

/** Tracks whether the root Config reference changes between requests. */
let initialConfigRef: Config | undefined;
let configReadCount = 0;

function readConfigProbeValues(config: Config) {
  configReadCount += 1;
  return {
    probeString: config.getOptionalString('simpleChat.configProbeString'),
    appTitle: config.getString('app.title'),
    backendBaseUrl: config.getString('backend.baseUrl'),
    authEnvironment: config.getOptionalString('auth.environment'),
  };
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config, httpAuth, userInfo } = options;

  initialConfigRef = config;

  const router = Router();
  router.use(express.json());

  router.post('/', async (req, res) => {
    const credentials = await httpAuth.credentials(req, { allow: ['user'] });
    const user = await userInfo.getUserInfo(credentials);
    logger.info(`Got request body: ${JSON.stringify(req.body)}`);
    const { message } = await req.body;
    messages.push({
      nickname: user.userEntityRef,
      timestamp: new Date().toLocaleTimeString('en-US'),
      message,
    });
    res.end();
  });

  router.get('/', async (req, res) => {
    await httpAuth.credentials(req, { allow: ['user'] });

    // Read several config values on every GET to probe for reload/leak behaviour.
    const configValues = readConfigProbeValues(config);
    const configSameReference = config === initialConfigRef;
    const heapUsedMb =
      Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100;

    if (!configSameReference) {
      logger.warn(
        `simple-chat config reference changed after ${configReadCount} reads`,
      );
    }

    res.status(200).json({
      messages,
      _configProbe: {
        configReadCount,
        configSameReference,
        configValues,
        heapUsedMb,
      },
    });
  });

  return router;
}
