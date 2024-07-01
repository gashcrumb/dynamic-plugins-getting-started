import React, { useRef } from 'react';
import { simpleChatApiRef } from '../../api/types';
import { useApi } from '@backstage/core-plugin-api';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

export const ChatMessageInput = () => {
  const simpleChatApi = useApi(simpleChatApiRef);
  const input = useRef<HTMLInputElement>();

  return (
    <>
      <Box component="form" noValidate autoComplete="off">
        <TextField
          inputRef={input}
          fullWidth
          variant="outlined"
          onKeyDown={async event => {
            if (event.key === 'Enter') {
              event.preventDefault();
              await simpleChatApi.postMessage({
                message: input.current!.value,
              });
              input.current!.value = '';
            }
          }}
        />
      </Box>
    </>
  );
};
