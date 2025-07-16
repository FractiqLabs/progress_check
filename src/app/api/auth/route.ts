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
  const { username, password } = await request.json();

  const user = users.find(u => u.id === username && u.password === password);

  if (user) {
    // 日本語文字を安全にエンコードして返す
    const safeUsername = safeBase64Encode(user.name);
    return NextResponse.json({ 
      message: 'ログイン成功', 
      username: user.name,
      encodedUsername: safeUsername
    });
  } else {
    return NextResponse.json({ message: '無効なログインIDまたはパスワードです' }, { status: 401 });
  }
}
