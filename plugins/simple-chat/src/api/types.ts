import { createApiRef } from '@backstage/core-plugin-api';

export type ChatMessage = {
  message: string;
  nickname: string;
  timestamp: string;
};

export type PostMessageOptions = {
  message: string;
};

export type GetMessagesOptions = {};

export type GetMessagesResult = {
  messages: ChatMessage[];
};

export interface SimpleChatApi {
  getMessages(options: GetMessagesOptions): Promise<GetMessagesResult>;
  postMessage(options: PostMessageOptions): Promise<void>;
}

export const simpleChatApiRef = createApiRef<SimpleChatApi>({
    id: 'simple-chat',
})