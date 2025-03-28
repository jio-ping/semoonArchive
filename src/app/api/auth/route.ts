import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const password = formData.get("password");

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      {
        message: "암호를 확인해주세요. 관리자가 아니라면 접근하지 마세요🚫",
      },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ message: "로그인 성공" });

  response.cookies.set("admin-auth", password, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return response;
}
