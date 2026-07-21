import { createApiRef } from '@backstage/frontend-plugin-api';

export type ChatMessage = {
  message: string;
  nickname: string;
  timestamp: string;
};

export type ChatUser = {
  userEntityRef: string;
};

export type PostMessageOptions = {
  message: string;
};

export type GetMessagesOptions = {};

export type GetMessagesResult = {
  messages: ChatMessage[];
};

export type GetUsersResult = {
  users: ChatUser[];
};

export interface SimpleChatApi {
  getMessages(options: GetMessagesOptions): Promise<GetMessagesResult>;
  postMessage(options: PostMessageOptions): Promise<void>;
  getUsers(): Promise<GetUsersResult>;
  heartbeat(): Promise<void>;
}

export const simpleChatApiRef = createApiRef<SimpleChatApi>({
  id: 'plugin.simple-chat.service',
});

/** Feature flag that shows the connected-users side panel. */
export const SIMPLE_CHAT_USER_LIST_FLAG = 'simple-chat-user-list';
