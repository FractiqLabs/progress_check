import { NextResponse } from 'next/server';

const users: { [key: string]: string } = {
  a: 'admin1',
  b: 'admin2',
  c: 'admin3',
};

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (users[username] && users[username] === password) {
    return NextResponse.json({ message: 'ログイン成功' }, { status: 200 });
  } else {
    return NextResponse.json({ message: 'ユーザー名またはパスワードが間違っています' }, { status: 401 });
  }
}
