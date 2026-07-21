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

type ConnectedUser = {
  userEntityRef: string;
  lastSeen: number;
};

const messages: ChatMessage[] = [];
const connectedUsers = new Map<string, ConnectedUser>();
/** Users disappear from the list after this long without a heartbeat. */
const PRESENCE_TTL_MS = 15_000;

function pruneConnectedUsers() {
  const cutoff = Date.now() - PRESENCE_TTL_MS;
  for (const [userEntityRef, user] of connectedUsers) {
    if (user.lastSeen < cutoff) {
      connectedUsers.delete(userEntityRef);
    }
  }
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, httpAuth, userInfo } = options;

  const router = Router();
  router.use(express.json());

  const touchPresence = async (req: express.Request) => {
    const credentials = await httpAuth.credentials(req, { allow: ['user'] });
    const user = await userInfo.getUserInfo(credentials);
    connectedUsers.set(user.userEntityRef, {
      userEntityRef: user.userEntityRef,
      lastSeen: Date.now(),
    });
    return user;
  };

  router.post('/', async (req, res) => {
    const user = await touchPresence(req);
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
    await touchPresence(req);
    res.status(200).json({ messages });
  });

  router.post('/users/heartbeat', async (req, res) => {
    await touchPresence(req);
    res.status(204).end();
  });

  router.get('/users', async (req, res) => {
    await touchPresence(req);
    pruneConnectedUsers();
    res.status(200).json({
      users: Array.from(connectedUsers.values())
        .sort((a, b) => a.userEntityRef.localeCompare(b.userEntityRef))
        .map(({ userEntityRef }) => ({ userEntityRef })),
    });
  });

  return router;
}
