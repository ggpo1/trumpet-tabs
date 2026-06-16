import { useRef } from 'react';
import { exportSongJson, importSongJson } from '../storage';
import type { Song } from '../types';

interface UseSongImportExportOptions {
  activeSong: Song | null;
  onImport: (song: Song) => Promise<void>;
}

export function useSongImportExport({ activeSong, onImport }: UseSongImportExportOptions) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (!activeSong) return;
    const blob = new Blob([exportSongJson(activeSong)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSong.title.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const song = importSongJson(String(reader.result));
        void onImport(song);
      } catch {
        alert('Не удалось импортировать файл');
      }
    };
    reader.readAsText(file);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return {
    fileInputRef,
    handleExport,
    handleImport,
    openFilePicker,
  };
}
