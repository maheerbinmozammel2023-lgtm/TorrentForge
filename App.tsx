
import React from 'react';
import { TorrentCreator } from './components/TorrentCreator';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Torrent<span className="text-blue-500">Forge</span>
          </h1>
          <p className="text-slate-400 mt-2 text-lg">
            Craft v1, v2, and hybrid torrents with ease.
          </p>
        </header>
        
        <main>
          <TorrentCreator />
        </main>

        <footer className="text-center mt-12 text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} TorrentForge. All Rights Reserved.</p>
          <p className="mt-1">This is a UI demonstration. No real torrent files are generated.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
