import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField/TextField';
import { Container } from '@mui/system';
import React from 'react';
import './App.css';
import { Lyrics } from './Lyrics';

export const App = () => {
  const [songTitle, setSongTitle] = React.useState<string>();
  const [artist, setArtist] = React.useState<string>();
  const [search, setSearch] = React.useState<boolean>(false);

  const handleSearch = () => {
    if (!search) setSearch(true);
    else {
      setSearch(false);
      setArtist('');
      setSongTitle('');
    }
  };

  return (
    <div className="App">
      <div style={{ marginTop: '10%' }}>
        <Container>
          <Grid container spacing={2} direction="column" justifyContent="center" alignItems="center">
            <Grid item>
              <TextField
                disabled={search}
                required
                id="outlined-required"
                label="Artist name"
                placeholder="Artist name"
                value={artist}
                onChange={(event) => setArtist(event.target.value)}
              />
            </Grid>
            <Grid item>
              <TextField
                disabled={search}
                required
                id="outlined-required"
                label="Song title"
                placeholder="Song title"
                value={songTitle}
                onChange={(event) => setSongTitle(event.target.value)}
              />
            </Grid>
            <Grid item>
              <Button onClick={() => handleSearch()} title={search ? 'Reset' : 'Search'}>
                {search ? 'Reset' : 'Search'}
              </Button>
            </Grid>
          </Grid>
          {songTitle && artist && search && <Lyrics songTitle={songTitle} artist={artist} />}
        </Container>
      </div>
    </div>
  );
};
