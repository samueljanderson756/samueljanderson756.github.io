import axios from 'axios';
import React from 'react';

export const useLyrics = (artist: string, songTitle: string) => {
  const [loading, setLoading] = React.useState(false);
  const [lyrics, setLyrics] = React.useState<string>();

  const fetchLyrics = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await axios.get(`https://api.lyrics.ovh/v1/${artist}/${songTitle}`);
      setLyrics(data.data.lyrics);
      setLoading(false);
    } catch (e) {
      setLyrics('You probably spelled something wrong because ur bad');
      setLoading(false);
      console.error(e);
    }
  }, []);

  React.useEffect(() => {
    console.log('render');
    fetchLyrics();
  }, []);

  return { loading, lyrics };
};
