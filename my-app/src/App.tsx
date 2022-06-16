import { Box, Tabs, Tab } from '@mui/material';
import React from 'react';
import './App.css';
import { CryptoWatch } from './components/CryptoWatch';
import { LyricFinder } from './components/LyricFinder';
import { a11yProps, TabPanel } from './components/TabPanel';

function BasicTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs centered value={value} onChange={handleChange} aria-label="application tabs">
          <Tab label="Simple Lyrics" {...a11yProps(0)} />
          <Tab label="Crypto Watch" {...a11yProps(1)} />
        </Tabs>
      </Box>
      {/* <Box marginTop={'5vh'}/> */}
      {/* <div style={{ marginTop: '10%'}}/> */}
      <TabPanel value={value} index={0}>
        <LyricFinder />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <CryptoWatch />
      </TabPanel>
    </Box>
  );
}

export const App = () => {
  return (
    <div className="App">
      <BasicTabs />
    </div>
  );
};
