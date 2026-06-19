import { SequenceStrip } from '../../components/SequenceStrip';
import { useNotesEditor } from '../../hooks/useNotesEditor';
import { usePlayback } from '../../hooks/usePlayback';
import { useSongImportExport } from '../../hooks/useSongImportExport';
import type { Song, SongFolder } from '../../types';
import { NotesList } from '../notes/NotesList';
import { QuickAddNote } from '../notes/QuickAddNote';
import { SelectedNotePreview } from '../notes/SelectedNotePreview';
import { ValveReference } from '../reference/ValveReference';
import { SongHeader } from '../songs/SongHeader';

interface SongWorkspaceProps {
  song: Song;
  folders: SongFolder[];
  activeId: string | null;
  updateActive: (patch: Partial<Song>) => void;
  onDuplicate: (song: Song) => void;
  onDelete: (id: string) => void;
  onImport: (song: Song) => Promise<void>;
  onMoveToFolder: (songId: string, folderId: string | null) => void;
}

export function SongWorkspace({
  song,
  folders,
  activeId,
  updateActive,
  onDuplicate,
  onDelete,
  onImport,
  onMoveToFolder,
}: SongWorkspaceProps) {
  const {
    selectedNoteId,
    setSelectedNoteId,
    selectedNote,
    draftValves,
    setDraftValves,
    draftLabel,
    handleDraftLabelChange,
    updateNote,
    addNote,
    deleteNote,
    moveNote,
  } = useNotesEditor({ activeSong: song, activeId, updateActive });

  const { playingNoteId, isPlaying, stopPlayback, playSequence, previewSelectedNote } = usePlayback({
    activeSong: song,
    activeId,
    selectedNote,
    setSelectedNoteId,
  });

  const { fileInputRef, handleExport, handleImport, openFilePicker } = useSongImportExport({
    activeSong: song,
    onImport,
  });

  const handleDelete = () => {
    if (confirm('Удалить эту песню?')) void onDelete(song.id);
  };

  return (
    <>
      <SongHeader
        song={song}
        folders={folders}
        isPlaying={isPlaying}
        fileInputRef={fileInputRef}
        onUpdate={updateActive}
        onMoveToFolder={(folderId) => onMoveToFolder(song.id, folderId)}
        onPlay={playSequence}
        onStop={stopPlayback}
        onExport={handleExport}
        onImportClick={openFilePicker}
        onImportFile={handleImport}
        onDuplicate={() => void onDuplicate(song)}
        onDelete={handleDelete}
      />

      <SequenceStrip
        notes={song.notes}
        selectedId={selectedNoteId}
        playingId={playingNoteId}
        onSelect={setSelectedNoteId}
      />

      <QuickAddNote
        draftLabel={draftLabel}
        draftValves={draftValves}
        onLabelChange={handleDraftLabelChange}
        onValvesChange={setDraftValves}
        onAdd={addNote}
      />

      {selectedNote && (
        <SelectedNotePreview
          note={selectedNote}
          onPreview={previewSelectedNote}
          onValvesChange={(valves) => updateNote(selectedNote.id, { valves })}
        />
      )}

      <NotesList
        notes={song.notes}
        selectedNoteId={selectedNoteId}
        playingNoteId={playingNoteId}
        onSelect={setSelectedNoteId}
        onUpdate={updateNote}
        onDelete={deleteNote}
        onMove={moveNote}
      />

      <ValveReference />
    </>
  );
}
