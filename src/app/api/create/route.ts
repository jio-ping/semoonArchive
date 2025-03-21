// app/api/create/route.ts
import { turso as db } from "@/lib/turso";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    // video insert
    const videoTitle = formData.get("videoTitle") as string;
    const videoKeyword = formData.get("videoKeyword") as string;
    const videoKeyURL = formData.get("videoKeyURL") as string;

    const videoInsert = await db?.execute({
      sql: "INSERT INTO videos (title, description, video_url) VALUES (?, ?, ?)",
      args: [videoTitle, videoKeyword, videoKeyURL],
    });

    // // videoId 가져오기
    const videoId = videoInsert?.lastInsertRowid;
    // console.log(videoId);

    // // books insert
    const booksData: {
      id: string;
      title: string;
      image: string;
      author: string;
      quotes: string;
    }[] = [];
    ["4-A-1", "4-A-2", "4-B-1", "4-B-2"].forEach((key) => {
      const id = formData.get(`${key}-id`) as string;
      const title = formData.get(`${key}-title`) as string;
      const image = formData.get(`${key}-image`) as string;
      const author = formData.get(`${key}-author`) as string;
      const quotes = formData.get(`${key}-quotes`) as string;
      if (title) {
        booksData.push({ id, title, image, author, quotes });
      }
    });

    for (const book of booksData) {
      await db?.execute({
        sql: "INSERT INTO Books (id, title, cover_image, author, quotes) VALUES (?, ?, ?, ?, ?)",
        args: [
          Number(book.id),
          book.title,
          book.image,
          book.author,
          book.quotes,
        ],
      });
    }
    //tournaments
    const rounds = ["4강 A조", "4강 B조", "결승"];
    if (!videoId) {
      return NextResponse.json({ message: "Missing videoId" }, { status: 400 });
    }

    // tournament_books 적재
    const tournamentIds: Record<string, number> = {};
    for (const round of rounds) {
      const result = await db?.execute({
        sql: "INSERT INTO tournaments (video_id, round) VALUES (?, ?)",
        args: [videoId, round],
      });
      if (result) tournamentIds[round] = Number(result.lastInsertRowid);
    }
    // 결승에 진출한 책들
    const finalBooks = formData.getAll("final") as string[];

    for (const key of ["4-A-1", "4-A-2", "4-B-1", "4-B-2"]) {
      const bookId = formData.get(`${key}-id`) as string;

      // 해당 책의 라운드 찾기
      const round = key.startsWith("4-A") ? "4강 A조" : "4강 B조";
      const tournamentId = tournamentIds[round];
      const placement = bookId in finalBooks ? 1 : 2;

      if (!tournamentId) continue;

      await db?.execute({
        sql: "INSERT INTO tournament_books (book_id, tournament_id,placement) VALUES (?, ?, ?)",
        args: [Number(bookId), tournamentId, placement],
      });

      // 결승
      const finalWinnerBooks = formData.get("final-winner") as string;

      for (const bookId of finalBooks) {
        const placement = finalWinnerBooks === bookId ? 1 : 2;
        await db?.execute({
          sql: "INSERT INTO tournament_books (book_id, tournament_id,placement) VALUES (?, ?, ?)",
          args: [Number(bookId), tournamentIds["결승"], placement],
        });
      }
    }

    return NextResponse.json({
      message: "Tournament data inserted successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to insert tournament data" },
      { status: 500 }
    );
  }
}
