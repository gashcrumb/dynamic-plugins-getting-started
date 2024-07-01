import React from 'react';
import { createDevApp } from '@backstage/dev-utils';
import { simpleChatPlugin, SimpleChatPage } from '../src/plugin';
import {
  ChatMessage,
  GetMessagesOptions,
  PostMessageOptions,
  SimpleChatApi,
  simpleChatApiRef,
} from '../src/api/types';
import { TestApiProvider } from '@backstage/test-utils';

const messages: ChatMessage[] = [];

const mockedApi: SimpleChatApi = {
  postMessage: async (options: PostMessageOptions) => {
    messages.push({
      nickname: '<unset>',
      timestamp: new Date().toLocaleTimeString('en-US'),
      message: options.message || '',
    });
    return;
  },
  getMessages: async (_options: GetMessagesOptions) => {
    return { messages };
  },
};

createDevApp()
  .registerPlugin(simpleChatPlugin)
  .addPage({
    element: (
      <TestApiProvider apis={[[simpleChatApiRef, mockedApi]]}>
        {' '}
        <SimpleChatPage />
      </TestApiProvider>
    ),
    title: 'Root Page',
    path: '/simple-chat',
  })
  .render();
