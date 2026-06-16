import { LoadingState, NoSongsState, SongsErrorState } from './features/songs/AppEmptyStates';
import { SongSidebar } from './features/songs/SongSidebar';
import { SongWorkspace } from './features/song-editor/SongWorkspace';
import { useSongs } from './hooks/useSongs';

export default function App() {
  const {
    songs,
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
        activeId={activeId}
        onSelectSong={setActiveId}
        onCreateSong={() => void createNewSong()}
      />
      <main className="workspace">
        {activeSong && (
          <SongWorkspace
            song={activeSong}
            activeId={activeId}
            updateActive={updateActive}
            onDuplicate={duplicateSong}
            onDelete={deleteSong}
            onImport={importSong}
          />
        )}
      </main>
    </div>
  );
}
