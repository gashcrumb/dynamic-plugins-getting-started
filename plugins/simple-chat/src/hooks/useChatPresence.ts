import { useApi } from '@backstage/frontend-plugin-api';
import { useCallback, useEffect } from 'react';
import useInterval from 'react-use/esm/useInterval';
import { simpleChatApiRef } from '../api/types';

/**
 * Marks this browser session as present while the chat page is open.
 * Runs regardless of the user-list feature flag so other viewers with the
 * panel enabled still see everyone currently on the page.
 */
export const useChatPresence = (intervalMs: number = 5000) => {
  const simpleChatApi = useApi(simpleChatApiRef);

  const sendHeartbeat = useCallback(async () => {
    await simpleChatApi.heartbeat();
  }, [simpleChatApi]);

  useEffect(() => {
    void sendHeartbeat().catch(() => undefined);
  }, [sendHeartbeat]);

  useInterval(() => {
    void sendHeartbeat().catch(() => undefined);
  }, intervalMs);
};
