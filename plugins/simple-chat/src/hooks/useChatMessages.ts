import { useApi } from '@backstage/core-plugin-api';
import { GetMessagesResult, simpleChatApiRef } from '../api/types';
import { useCallback } from 'react';
import useAsyncRetry from 'react-use/esm/useAsyncRetry';
import useInterval from 'react-use/esm/useInterval';

export const useChatMessages = (intervalMs: number = 1000) => {
  const simpleChatApi = useApi(simpleChatApiRef);
  const getChatMessages = useCallback(async (): Promise<GetMessagesResult> => {
    try {
      return await simpleChatApi.getMessages({});
    } catch (error) {
      return Promise.reject(error);
    }
  }, [simpleChatApi]);
  const {
    value,
    loading,
    error,
    retry,
  } = useAsyncRetry(() => getChatMessages(), [getChatMessages]);
  useInterval(() => retry(), intervalMs);
  const normalizedError = error
    ? error instanceof Error
      ? error
      : new Error(`${error}`)
    : undefined;

  return {
    messages: value?.messages,
    configProbe: value?._configProbe,
    loading,
    error: normalizedError,
  };
};
