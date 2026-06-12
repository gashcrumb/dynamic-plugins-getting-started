import { Progress, ResponseErrorPanel } from '@backstage/core-components';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { ConfigProbe } from '../../api/types';

type ConfigProbeDisplayProps = {
  configProbe?: ConfigProbe;
  loading: boolean;
  error?: Error;
};

export const ConfigProbeDisplay = ({
  configProbe,
  loading,
  error,
}: ConfigProbeDisplayProps) => {
  if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  if (loading && !configProbe) {
    return <Progress />;
  }

  if (!configProbe) {
    return (
      <Typography variant="body2" color="textSecondary">
        Waiting for config probe data from the backend...
      </Typography>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      {!configProbe.configSameReference && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          Config object reference changed — configuration may have been reloaded.
        </Alert>
      )}
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Chip
            label={`Heap: ${configProbe.heapUsedMb} MB`}
            color="primary"
            variant="outlined"
          />
        </Grid>
        <Grid item>
          <Chip
            label={`Reads: ${configProbe.configReadCount}`}
            variant="outlined"
          />
        </Grid>
        <Grid item>
          <Chip
            label={
              configProbe.configSameReference
                ? 'Config ref: stable'
                : 'Config ref: changed'
            }
            color={configProbe.configSameReference ? 'success' : 'warning'}
            variant="outlined"
          />
        </Grid>
      </Grid>
      <Typography
        variant="caption"
        color="textSecondary"
        component="div"
        sx={{ mt: 1 }}
      >
        app.title: {configProbe.configValues.appTitle}
        {' · '}
        backend.baseUrl: {configProbe.configValues.backendBaseUrl}
        {configProbe.configValues.authEnvironment
          ? ` · auth.environment: ${configProbe.configValues.authEnvironment}`
          : ''}
      </Typography>
      {configProbe.configValues.probeString && (
        <Typography
          variant="caption"
          color="textSecondary"
          component="div"
          sx={{ mt: 0.5, fontStyle: 'italic' }}
        >
          probe string length: {configProbe.configValues.probeString.length}{' '}
          chars
        </Typography>
      )}
      <Typography
        variant="caption"
        color="textSecondary"
        component="div"
        sx={{ mt: 0.5 }}
      >
        Updates every second via GET /api/simple-chat
      </Typography>
    </Box>
  );
};
