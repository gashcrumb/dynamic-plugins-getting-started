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
  GetMessagesOptions,
  PostMessageOptions,
  SimpleChatApi,
  simpleChatApiRef,
} from '../src/api/types';

const messages: ChatMessage[] = [];

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
