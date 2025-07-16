'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [username, setUsername] = useState<string | null>(null);

  // 安全なデコーディング関数
  const safeDecode = (str: string): string => {
    try {
      // URLデコーディングを使用
      return decodeURIComponent(str);
    } catch (error) {
      console.warn('Decoding failed, using original string:', error);
      return str;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUsername = localStorage.getItem('username');
      const encodedUsername = localStorage.getItem('username_encoded');
      
      if (storedUsername) {
        setUsername(storedUsername);
      } else if (encodedUsername) {
        // エンコードされた文字列がある場合はデコード
        setUsername(safeDecode(encodedUsername));
      }
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
