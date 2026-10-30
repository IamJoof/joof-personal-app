import React from 'react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#1e1e1e] flex flex-col">
      <header className="p-4 border-b border-gray-100 bg-white shadow-xs">
        <h1 className="text-lg font-bold text-pastel-dark">Joof Personal App</h1>
      </header>
      <main className="flex-1 p-4 max-w-md mx-auto w-full">
        <p className="text-sm text-gray-500">Welcome to your personal health & nutrition dashboard.</p>
      </main>
    </div>
  );
}
