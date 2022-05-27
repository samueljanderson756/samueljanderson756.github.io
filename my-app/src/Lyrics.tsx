import { Dispatch, SetStateAction } from 'react';
import { useLyrics } from './hooks/useLyrics';

type Props = {
  artist: string;
  songTitle: string;
  searchCallback?: Dispatch<SetStateAction<boolean>>;
};

export const Lyrics = ({ artist, songTitle, searchCallback }: Props) => {
  const lyrics = useLyrics(artist, songTitle);

  return (
    <div style={{ marginTop: '10%', marginBottom: '10%' }}>
      <div style={{ whiteSpace: 'pre-line' }}>{lyrics.loading ? 'Loading...' : lyrics.lyrics}</div>
    </div>
  );
};
