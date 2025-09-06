
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 p-4 border-b border-slate-700/50">
      <div className="container mx-auto flex items-center justify-center">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
          AI Image Dataset Generator
        </h1>
      </div>
    </header>
  );
};

export default Header;
