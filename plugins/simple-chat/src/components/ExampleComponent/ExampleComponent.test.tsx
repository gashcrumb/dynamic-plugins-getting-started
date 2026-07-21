import { screen } from '@testing-library/react';
import {
  attachMockApiFactory,
  mockApis,
  renderInTestApp,
} from '@backstage/frontend-test-utils';
import { FeatureFlagState } from '@backstage/frontend-plugin-api';
import { ExampleComponent } from './ExampleComponent';
import {
  ChatMessage,
  ChatUser,
  GetMessagesOptions,
  PostMessageOptions,
  SIMPLE_CHAT_USER_LIST_FLAG,
  SimpleChatApi,
  simpleChatApiRef,
} from '../../api/types';

describe('ExampleComponent', () => {
  const messages: ChatMessage[] = [];
  const users: ChatUser[] = [{ userEntityRef: 'user:default/test-user' }];
  const mockedApi: SimpleChatApi = {
    postMessage: async (options: PostMessageOptions) => {
      messages.push({
        nickname: 'test-user',
        timestamp: '12:00:00 PM',
        message: options.message || '',
      });
    },
    getMessages: async (_options: GetMessagesOptions) => ({ messages }),
    getUsers: async () => ({ users }),
    heartbeat: async () => undefined,
  };

  it('should render without the user list by default', async () => {
    await renderInTestApp(<ExampleComponent />, {
      apis: [attachMockApiFactory(simpleChatApiRef, mockedApi)],
    });
    expect(screen.getByText('Welcome to simple-chat!')).toBeInTheDocument();
    expect(screen.queryByLabelText('Connected users')).not.toBeInTheDocument();
  });

  it('should render the connected users panel when the feature flag is active', async () => {
    await renderInTestApp(<ExampleComponent />, {
      apis: [
        attachMockApiFactory(simpleChatApiRef, mockedApi),
        mockApis.featureFlags({
          initialStates: {
            [SIMPLE_CHAT_USER_LIST_FLAG]: FeatureFlagState.Active,
          },
        }),
      ],
    });
    expect(screen.getByLabelText('Connected users')).toBeInTheDocument();
    expect(
      await screen.findByText('user:default/test-user'),
    ).toBeInTheDocument();
  });
});
