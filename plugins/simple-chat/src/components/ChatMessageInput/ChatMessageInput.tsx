import { useState } from 'react';
import { useApi } from '@backstage/frontend-plugin-api';
import { TextField } from '@backstage/ui';
import { simpleChatApiRef } from '../../api/types';

export const ChatMessageInput = () => {
  const simpleChatApi = useApi(simpleChatApiRef);
  const [message, setMessage] = useState('');

  return (
    <TextField
      label="Message"
      aria-label="Chat message"
      placeholder="Type a message and press Enter"
      value={message}
      onChange={setMessage}
      onKeyDown={async event => {
        if (event.key === 'Enter') {
          event.preventDefault();
          const trimmed = message.trim();
          if (!trimmed) {
            return;
          }
          await simpleChatApi.postMessage({ message: trimmed });
          setMessage('');
        }
      }}
    />
  );
};
