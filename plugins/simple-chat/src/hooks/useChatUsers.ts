import { useApi } from '@backstage/frontend-plugin-api';
import { useCallback } from 'react';
import useAsyncRetry from 'react-use/esm/useAsyncRetry';
import useInterval from 'react-use/esm/useInterval';
import { ChatUser, simpleChatApiRef } from '../api/types';

export const useChatUsers = (intervalMs: number = 5000) => {
  const simpleChatApi = useApi(simpleChatApiRef);

  const getUsers = useCallback(async (): Promise<ChatUser[]> => {
    const response = await simpleChatApi.getUsers();
    return response.users;
  }, [simpleChatApi]);

  const {
    value: users,
    loading,
    error,
    retry,
  } = useAsyncRetry(() => getUsers(), [getUsers]);

  useInterval(() => retry(), intervalMs);

  return {
    users,
    loading,
    error,
  };
};
