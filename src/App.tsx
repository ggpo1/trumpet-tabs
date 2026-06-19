import { LoadingState, NoSongsState, SongsErrorState } from './features/songs/AppEmptyStates';
import { SongSidebar } from './features/songs/SongSidebar';
import { SongWorkspace } from './features/song-editor/SongWorkspace';
import { useSongs } from './hooks/useSongs';

export default function App() {
  const {
    songs,
    folders,
    activeSong,
    activeId,
    loading,
    error,
    setActiveId,
    updateActive,
    createNewSong,
    deleteSong,
    duplicateSong,
    importSong,
    createNewFolder,
    renameFolder,
    deleteFolderById,
    moveSongToFolder,
    reload,
  } = useSongs();

  if (loading) {
    return <LoadingState />;
  }

  if (error && songs.length === 0) {
    return <SongsErrorState error={error} onRetry={() => void reload()} />;
  }

  if (!activeSong && songs.length === 0) {
    return <NoSongsState onCreateSong={() => void createNewSong()} />;
  }

  return (
    <div className="app">
      {error && <div className="error-toast">{error}</div>}
      <SongSidebar
        songs={songs}
        folders={folders}
        activeId={activeId}
        onSelectSong={setActiveId}
        onCreateSong={(folderId) => void createNewSong(folderId ?? null)}
        onCreateFolder={createNewFolder}
        onRenameFolder={(id, name) => void renameFolder(id, name)}
        onDeleteFolder={(id) => void deleteFolderById(id)}
        onMoveSong={(songId, folderId) => void moveSongToFolder(songId, folderId)}
      />
      <main className="workspace">
        {activeSong && (
          <SongWorkspace
            song={activeSong}
            folders={folders}
            activeId={activeId}
            updateActive={updateActive}
            onDuplicate={duplicateSong}
            onDelete={deleteSong}
            onImport={importSong}
            onMoveToFolder={moveSongToFolder}
          />
        )}
      </main>
    </div>
  );
}
