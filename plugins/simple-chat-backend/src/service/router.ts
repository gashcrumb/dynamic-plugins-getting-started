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

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, httpAuth, userInfo } = options;

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
    res.status(200).json({ messages });
  });

  return router;
}
