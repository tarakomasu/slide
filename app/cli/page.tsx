import PlayerLoader from './components/player/PlayerLoader';

export default function CliPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-gray-800 py-4">Slide Player</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <PlayerLoader />
      </main>
    </div>
  );
}
