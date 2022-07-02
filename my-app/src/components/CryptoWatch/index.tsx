import Grid from '@mui/material/Grid';
import React from 'react';
import { Ticker } from './Ticker';

type Transaction = {
  base: string;
  quote: string;
  direction: string;
  price: number;
  volume: string;
  priceUsd: number;
};
export const CryptoWatch = () => {
  const [bitcoin, setBitcoin] = React.useState();
  const [ethereum, setEthereum] = React.useState();
  const [monero, setMonero] = React.useState();
  const [litecoin, setLitecoin] = React.useState();

  React.useEffect(() => {
    const priceWs = new WebSocket('wss://ws.coincap.io/prices?assets=bitcoin,ethereum,monero,litecoin');
    priceWs.onmessage = (event) => {
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

    return () => priceWs.close();
  }, []);

  return (
    <React.Fragment>
      <Grid container={true} spacing={2} justifyContent="center" alignItems="center" columns={{ xs: 12, sm: 6, md: 1 }}>
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
    </React.Fragment>
  );
};
