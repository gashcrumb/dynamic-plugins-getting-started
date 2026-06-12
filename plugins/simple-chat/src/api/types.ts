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

export type ConfigProbeValues = {
  probeString?: string;
  appTitle: string;
  backendBaseUrl: string;
  authEnvironment?: string;
};

export type ConfigProbe = {
  configReadCount: number;
  configSameReference: boolean;
  configValues: ConfigProbeValues;
  heapUsedMb: number;
};

export type GetMessagesResult = {
  messages: ChatMessage[];
  _configProbe?: ConfigProbe;
};

export interface SimpleChatApi {
  getMessages(options: GetMessagesOptions): Promise<GetMessagesResult>;
  postMessage(options: PostMessageOptions): Promise<void>;
}

export const simpleChatApiRef = createApiRef<SimpleChatApi>({
    id: 'simple-chat',
})