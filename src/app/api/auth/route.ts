import { NextResponse } from 'next/server';

const users = [
  { id: 'a', password: 'admin1', name: 'ユーザーA' },
  { id: 'b', password: 'admin2', name: 'ユーザーB' },
  { id: 'c', password: 'admin3', name: 'ユーザーC' },
];

// UTF-8対応のBase64エンコーディング関数
function safeBase64Encode(str: string): string {
  try {
    // UTF-8バイト配列に変換してからBase64エンコード
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    return btoa(String.fromCharCode(...data));
  } catch (error) {
    // フォールバック: JSON文字列として返す
    return JSON.stringify(str);
  }
}

export async function POST(request: Request) {
  const { userId, username, password } = await request.json();

  // ユーザーIDとパスワードで認証
  const user = users.find(u => u.id === userId && u.password === password);

  if (user) {
    // 認証成功 - 入力された日本語名をそのまま返す
    return NextResponse.json({ 
      message: 'ログイン成功', 
      username: username, // 入力された日本語名
      userId: userId
    });
  } else {
    return NextResponse.json({ message: '無効なユーザーIDまたはパスワードです' }, { status: 401 });
  }
}
