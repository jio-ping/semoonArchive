// app/api/create/route.ts
import { turso as db } from "@/lib/turso";

import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    //  videos 테이블에 적재
    const videoTitle = formData.get("videoTitle") as string;
    const videoKeyword = formData.get("videoKeyword") as string;
    const videoKeyURL = formData.get("videoKeyURL") as string;
    const videoEpisodeNumber = formData.get("videoEpisode") as string;

    const videoInsert = await db?.execute({
      sql: "INSERT INTO videos (id, title, description, video_url) VALUES (?, ?, ?, ?)",
      args: [videoEpisodeNumber, videoTitle, videoKeyword, videoKeyURL],
    });

    if (!videoInsert?.lastInsertRowid) {
      throw new Error("비디오 데이터 적재 실패");
    }

    // 적재한 video row id
    const videoId = Number(videoInsert.lastInsertRowid);

    // books 테이블에 적재
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
      if (title) booksData.push({ id, title, image, author, quotes });
    });

    // book이 이미 적재되어있는 데이터인지 체크
    const existingBooks = await db?.execute({
      sql: `SELECT id FROM Books WHERE id IN (${booksData
        .map(() => "?")
        .join(", ")})`,
      args: booksData.map((book) => book.id),
    });

    const existingBookIds = new Set(existingBooks?.rows.map((row) => row.id));

    const newBooks = booksData.filter(
      (book) => !existingBookIds.has(Number(book.id))
    );

    // 적재할 책이 있을때만 실행
    if (newBooks.length > 0) {
      const values = newBooks.map(() => "(?, ?, ?, ?, ?)").join(", ");
      const args = newBooks.flatMap((book) => [
        Number(book.id),
        book.title,
        book.image,
        book.author,
        book.quotes,
      ]);
      const result = await db?.execute({
        sql: `INSERT INTO Books (id, title, cover_image, author, quotes) VALUES ${values}`,
        args,
      });
      if (!result) {
        throw new Error(`책 데이터 적재 실패`);
      }
    }

    //  tournaments 테이블에 적재
    const rounds = ["4강 A조", "4강 B조", "결승"];
    const tournamentIds: Record<string, number> = {};

    for (const round of rounds) {
      const result = await db?.execute({
        sql: "INSERT INTO tournaments (video_id, round) VALUES (?, ?)",
        args: [videoId, round],
      });

      if (!result?.lastInsertRowid) {
        throw new Error(`토너먼트 삽입 실패: ${round}`);
      }

      tournamentIds[round] = Number(result.lastInsertRowid);
    }

    // tournament_books 테이블에 삽입
    const finalBooks = formData.getAll("final") as string[];

    for (const key of ["4-A-1", "4-A-2", "4-B-1", "4-B-2"]) {
      const bookId = formData.get(`${key}-id`) as string;
      if (!bookId) continue;

      const round = key.startsWith("4-A") ? "4강 A조" : "4강 B조";
      const tournamentId = tournamentIds[round];
      const placement = finalBooks.includes(bookId) ? 1 : 2;

      if (!tournamentId) {
        throw new Error(`토너먼트 ID 없음: ${round}`);
      }

      const result = await db?.execute({
        sql: "INSERT INTO tournament_books (book_id, tournament_id, placement) VALUES (?, ?, ?)",
        args: [Number(bookId), tournamentId, placement],
      });

      if (!result) {
        throw new Error(`토너먼트 책 삽입 실패: ${bookId} - ${round}`);
      }
    }

    // 결승전 데이터 추가
    const finalWinner = formData.get("final-winner") as string;
    for (const bookId of finalBooks) {
      const placement = finalWinner === bookId ? 1 : 2;
      const result = await db?.execute({
        sql: "INSERT INTO tournament_books (book_id, tournament_id, placement) VALUES (?, ?, ?)",
        args: [Number(bookId), tournamentIds["결승"], placement],
      });

      if (!result) {
        throw new Error(`결승 책 삽입 실패: ${bookId}`);
      }
    }

    return NextResponse.json({
      message: "Tournament data inserted successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: `데이터 삽입 실패: ${(error as Error).message}` },
      { status: 500 }
    );
  }
}

// refactor 효율적인 방법 찾아보기
