import { CardContent, CardHeader, Divider, Grid } from '@mui/material';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Box from '@mui/system/Box';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import React from 'react';
import Container from '@mui/system/Container';

const Ticker = ({ title, value }: { title: string; value: string | undefined }) => {
  return (
    <Card variant="outlined" sx={{ minWidth: 200, minHeight: 200 }}>
      <CardContent>
        <Grid container={true} spacing={2} direction="column" justifyContent="center" alignItems="center">
          <Grid item={true}>
            <Typography color="#1976d2" variant="h3" component="div">
              {title}
            </Typography>
          </Grid>
          <Grid item={true}>
            <div>{value ? <Typography variant="h4">{`$${value}`}</Typography> : <CircularProgress />}</div>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export const CryptoWatch = () => {
  const [bitcoin, setBitcoin] = React.useState();
  const [ethereum, setEthereum] = React.useState();
  const [monero, setMonero] = React.useState();
  const [litecoin, setLitecoin] = React.useState();

  const ws = new WebSocket('wss://ws.coincap.io/prices?assets=bitcoin,ethereum,monero,litecoin');

  ws.onmessage = (event) => {
    const json = JSON.parse(event.data);

    try {
      if (json.ethereum) setEthereum(json.ethereum);
      if (json.bitcoin) setBitcoin(json.bitcoin);
      if (json.monero) setMonero(json.monero);
      if (json.litecoin) setLitecoin(json.litecoin);
      console.log('Success\n', json);
    } catch (error) {
      console.error(error);
    }
  };

  // const fetchPrices = React.useCallback(async () => {
  //     // setLoading(true);
  //     try {
  //       const data = await axios.get(``);
  //     //   setLyrics(cleanLyrics(data.data.lyrics));
  //     //   setLoading(false);
  //     } catch (e) {
  //     //   setLyrics('You probably spelled something wrong because ur bad');
  //     //   setLoading(false);
  //     }
  //   }, []);

  return (
    <React.Fragment>
      <Grid container={true} spacing={2} justifyContent="center" alignItems="center" columns={{ xs: 1, sm: 2, md: 2 }}>
        <Grid item={true}>
          <Ticker title={'Bitcoin'} value={bitcoin} />
        </Grid>
        <Grid item={true}>
          <Ticker title={'Etherum'} value={ethereum} />
        </Grid>
        <Grid item={true}>
          <Ticker title={'Monero'} value={monero} />
        </Grid>
        <Grid item={true}>
          <Ticker title={'Litecoin'} value={litecoin} />
        </Grid>
      </Grid>
      {/* <Card sx={{ display: 'flex' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <CardContent>
            <Typography component="div" variant="h5">
              Ethereum
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" component="div">
              {`$${ethereum}`}
            </Typography>
          </CardContent>
        </Box>
      </Card>
      <Card sx={{ display: 'flex' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <CardContent>
            <Typography component="div" variant="h5">
              Monero
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" component="div">
              {`$${monero}`}
            </Typography>
          </CardContent>
        </Box>
      </Card>
      <Card sx={{ display: 'flex' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <CardContent>
            <Typography component="div" variant="h5">
              Litecoin
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" component="div">
              {`$${litecoin}`}
            </Typography>
          </CardContent>
        </Box>
      </Card> */}
    </React.Fragment>
  );
};
