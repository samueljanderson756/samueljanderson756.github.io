import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import React from 'react';

export const Ticker = ({ title, value }: { title: string; value: string | undefined }) => {
  return (
    <Paper variant="outlined" sx={{ width: 125, height: 125, padding: 2 }}>
      <Grid container={true} spacing={2} direction="column" justifyContent="center" alignItems="center">
        <Grid item={true}>
          <Typography color="#1976d2" variant="h5" component="div">
            {title}
          </Typography>
        </Grid>
        <Grid item={true}>
          <div>{value ? <Typography variant="h6">{`$${value}`}</Typography> : <CircularProgress />}</div>
        </Grid>
      </Grid>
    </Paper>
  );
};
