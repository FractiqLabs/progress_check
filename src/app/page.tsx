'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUsername(localStorage.getItem('username'));
    }
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {username && (
        <h2 className="text-2xl font-bold mb-4">こんにちは、{username}さん</h2>
      )}
      <h1 className="text-4xl font-bold">Shinchoku</h1>
      <p className="text-lg">入退去進捗ノート</p>
    </main>
  );
}
