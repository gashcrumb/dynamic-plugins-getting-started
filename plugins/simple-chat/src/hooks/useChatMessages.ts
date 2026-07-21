import { useApi } from '@backstage/frontend-plugin-api';
import { useCallback } from 'react';
import useAsyncRetry from 'react-use/esm/useAsyncRetry';
import useInterval from 'react-use/esm/useInterval';
import { ChatMessage, simpleChatApiRef } from '../api/types';

export const useChatMessages = (intervalMs: number = 2500) => {
  const simpleChatApi = useApi(simpleChatApiRef);
  const getChatMessages = useCallback(async (): Promise<ChatMessage[]> => {
    const response = await simpleChatApi.getMessages({});
    return response.messages;
  }, [simpleChatApi]);
  const {
    value: messages,
    loading,
    error,
    retry,
  } = useAsyncRetry(() => getChatMessages(), [getChatMessages]);
  useInterval(() => retry(), intervalMs);
  return {
    messages,
    loading,
    error,
  };
};
