import { InfoCard, Header, Page, Content } from '@backstage/core-components';
import { ChatMessageDisplay } from '../ChatMessageDisplay/ChatMessageDisplay';
import { ChatMessageInput } from '../ChatMessageInput/ChatMessageInput';
import { ConfigProbeDisplay } from '../ConfigProbeDisplay/ConfigProbeDisplay';
import { useChatMessages } from '../../hooks/useChatMessages';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

export const ExampleComponent = () => {
  const { messages, configProbe, loading, error } = useChatMessages();

  return (
    <Page themeId="tool">
      <Header title="Welcome to simple-chat!" />
      <Content>
        <Grid container spacing={3} direction="column">
          <Grid item>
            <InfoCard title="Backend config / memory probe">
              <ConfigProbeDisplay
                configProbe={configProbe}
                loading={loading}
                error={error}
              />
            </InfoCard>
          </Grid>
          <Grid item>
            <InfoCard>
              <Typography variant="body1">
                <Box sx={{ height: '30vh', overflow: 'auto' }}>
                  <ChatMessageDisplay messages={messages} error={error} />
                </Box>
                <ChatMessageInput />
              </Typography>
            </InfoCard>
          </Grid>
        </Grid>
      </Content>
    </Page>
  );
};
