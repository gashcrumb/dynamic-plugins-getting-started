import { screen } from '@testing-library/react';
import {
  attachMockApiFactory,
  renderInTestApp,
} from '@backstage/frontend-test-utils';
import { ExampleComponent } from './ExampleComponent';
import {
  ChatMessage,
  GetMessagesOptions,
  PostMessageOptions,
  SimpleChatApi,
  simpleChatApiRef,
} from '../../api/types';

describe('ExampleComponent', () => {
  const messages: ChatMessage[] = [];
  const mockedApi: SimpleChatApi = {
    postMessage: async (options: PostMessageOptions) => {
      messages.push({
        nickname: 'test-user',
        timestamp: '12:00:00 PM',
        message: options.message || '',
      });
    },
    getMessages: async (_options: GetMessagesOptions) => ({ messages }),
  };

  it('should render', async () => {
    await renderInTestApp(<ExampleComponent />, {
      apis: [attachMockApiFactory(simpleChatApiRef, mockedApi)],
    });
    expect(screen.getByText('Welcome to simple-chat!')).toBeInTheDocument();
  });
});
