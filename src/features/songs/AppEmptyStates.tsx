export function LoadingState() {
  return (
    <div className="app app--empty">
      <header className="hero">
        <h1>Trumpet Tabs</h1>
        <p>Загрузка песен…</p>
      </header>
    </div>
  );
}

interface SongsErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function SongsErrorState({ error, onRetry }: SongsErrorStateProps) {
  return (
    <div className="app app--empty">
      <header className="hero">
        <h1>Trumpet Tabs</h1>
        <p className="error-banner">{error}</p>
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          Повторить
        </button>
      </header>
    </div>
  );
}

interface NoSongsStateProps {
  onCreateSong: () => void;
}

export function NoSongsState({ onCreateSong }: NoSongsStateProps) {
  return (
    <div className="app app--empty">
      <header className="hero">
        <h1>Trumpet Tabs</h1>
        <p>Редактор аппликатуры для трубы — отмечайте клапаны и собирайте песни</p>
        <button type="button" className="btn btn--primary" onClick={onCreateSong}>
          Создать первую песню
        </button>
      </header>
    </div>
  );
}
