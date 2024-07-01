import React from 'react';

import { InfoCard, Header, Page, Content } from '@backstage/core-components';
import { ChatMessageDisplay } from '../ChatMessageDisplay/ChatMessageDisplay';
import { ChatMessageInput } from '../ChatMessageInput/ChatMessageInput';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export const ExampleComponent = () => (
  <Page themeId="tool">
    <Header title="Welcome to simple-chat!" />
    <Content>
      <Grid container spacing={3} direction="column">
        <Grid item>
          <InfoCard>
            <Typography variant="body1">
              <Box sx={{  height: '30vh', overflow: 'auto' }}>
                <ChatMessageDisplay />
              </Box>
              <ChatMessageInput />
            </Typography>
          </InfoCard>
        </Grid>
      </Grid>
    </Content>
  </Page>
);
