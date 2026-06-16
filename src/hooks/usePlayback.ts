import { useEffect, useRef, useState } from 'react';
import { trumpetPlayer } from '../audio/trumpetPlayer';
import type { Song, TabNote } from '../types';
import { durationMs } from '../utils/duration';

interface UsePlaybackOptions {
  activeSong: Song | null;
  activeId: string | null;
  selectedNote: TabNote | null;
  setSelectedNoteId: (id: string | null) => void;
}

export function usePlayback({
  activeSong,
  activeId,
  selectedNote,
  setSelectedNoteId,
}: UsePlaybackOptions) {
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (playTimerRef.current) window.clearTimeout(playTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setPlayingNoteId(null);
    setIsPlaying(false);
  }, [activeId]);

  const stopPlayback = () => {
    if (playTimerRef.current) window.clearTimeout(playTimerRef.current);
    trumpetPlayer.stopAll();
    setIsPlaying(false);
    setPlayingNoteId(null);
  };

  const playSequence = () => {
    if (!activeSong || activeSong.notes.length === 0 || isPlaying) return;
    setIsPlaying(true);
    let i = 0;

    const step = () => {
      const note = activeSong.notes[i];
      if (!note) {
        stopPlayback();
        return;
      }
      setPlayingNoteId(note.id);
      setSelectedNoteId(note.id);
      const ms = durationMs(note.duration, activeSong.tempo);
      const durationSec = ms / 1000;
      void trumpetPlayer.playNote(note, durationSec);
      playTimerRef.current = window.setTimeout(() => {
        i += 1;
        if (i >= activeSong.notes.length) stopPlayback();
        else step();
      }, ms);
    };

    step();
  };

  const previewSelectedNote = () => {
    if (!selectedNote) return;
    void trumpetPlayer.previewNote(selectedNote);
  };

  return {
    playingNoteId,
    isPlaying,
    stopPlayback,
    playSequence,
    previewSelectedNote,
  };
}
