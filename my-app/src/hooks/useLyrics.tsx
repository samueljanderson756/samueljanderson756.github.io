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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    fetchLyrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { loading, lyrics };
};
