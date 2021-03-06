import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Container from '@mui/system/Container';
import React from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';

type APIParams = { artist: string; songTitle: string };

const cleanLyrics = (dirtyLyrics: string) => {
  return dirtyLyrics.replace(/\n\n/g, '\n');
};

export const LyricFinder = () => {
  const [songTitle, setSongTitle] = React.useState<string>('');
  const [artist, setArtist] = React.useState<string>('');
  const [lyrics, setLyrics] = React.useState<string>();
  const [loading, setLoading] = React.useState(false);
  const [previousInput, setPreviousInput] = React.useState<APIParams>();

  const fetchLyrics = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await axios.get(`https://api.lyrics.ovh/v1/${artist}/${songTitle}`);
      setLyrics(cleanLyrics(data.data.lyrics));
      setLoading(false);
    } catch (e) {
      setLyrics('You probably spelled something wrong because ur bad');
      setLoading(false);
    }
  }, [artist, songTitle]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!previousInput || previousInput.artist !== artist || previousInput.songTitle !== songTitle) {
      fetchLyrics();
      setPreviousInput({ artist, songTitle });
    }
  };

  return (
    <Container>
      <form onSubmit={handleSearch}>
        <Grid container={true} spacing={2} direction="column" justifyContent="center" alignItems="center">
          <Grid item={true}>
            <TextField
              disabled={loading}
              required={true}
              id="outlined-required"
              label="Artist name"
              placeholder="Artist name"
              value={artist}
              onChange={(event) => setArtist(event.target.value)}
            />
          </Grid>
          <Grid item={true}>
            <TextField
              disabled={loading}
              required={true}
              id="outlined-required"
              label="Song title"
              placeholder="Song title"
              value={songTitle}
              onChange={(event) => setSongTitle(event.target.value)}
            />
          </Grid>
          <Grid item={true}>
            <Button variant="contained" color="primary" type="submit" disabled={!songTitle || !artist} title="Search">
              Search
            </Button>
          </Grid>
        </Grid>
      </form>
      {lyrics && (
        <div style={{ marginTop: '10%', marginBottom: '10%' }}>
          <div style={{ whiteSpace: 'pre-line' }}>{loading ? <CircularProgress /> : lyrics}</div>
        </div>
      )}
    </Container>
  );
};
