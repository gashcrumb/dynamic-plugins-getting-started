import '@backstage/ui/css/styles.css';
import ReactDOM from 'react-dom/client';
import { createApp } from '@backstage/frontend-defaults';
import {
  ApiBlueprint,
  createFrontendModule,
} from '@backstage/frontend-plugin-api';
import simpleChatPlugin from '../src/alpha';
import {
  ChatMessage,
  ChatUser,
  GetMessagesOptions,
  PostMessageOptions,
  SimpleChatApi,
  simpleChatApiRef,
} from '../src/api/types';

const messages: ChatMessage[] = [];
const users = new Map<string, ChatUser>([
  ['user:default/dev-user', { userEntityRef: 'user:default/dev-user' }],
]);

const mockedApi: SimpleChatApi = {
  postMessage: async (options: PostMessageOptions) => {
    messages.push({
      nickname: 'dev-user',
      timestamp: new Date().toLocaleTimeString('en-US'),
      message: options.message || '',
    });
  },
  getMessages: async (_options: GetMessagesOptions) => {
    return { messages };
  },
  getUsers: async () => ({ users: Array.from(users.values()) }),
  heartbeat: async () => undefined,
};

const simpleChatDevModule = createFrontendModule({
  pluginId: 'simple-chat',
  extensions: [
    ApiBlueprint.make({
      name: 'simple-chat-mock',
      params: defineParams =>
        defineParams({
          api: simpleChatApiRef,
          deps: {},
          factory: () => mockedApi,
        }),
    }),
  ],
});

const app = createApp({
  features: [simpleChatPlugin, simpleChatDevModule],
});

const root = app.createRoot();

if (typeof window !== 'undefined' && window.location.pathname === '/') {
  window.location.pathname = '/simple-chat';
}

ReactDOM.createRoot(document.getElementById('root')!).render(root);
