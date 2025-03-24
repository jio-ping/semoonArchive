// app/api/create/route.ts
import { turso as db } from "@/lib/turso";

import { NextRequest, NextResponse } from "next/server";
/*
FormData {
  videoTitle: '',
  videoKeyword: '',
  videoKeyURL: '',
  '4-A-1-title': '색,계',
  '4-A-1-image': 'https://minumsa.minumsa.com/wp-content/uploads/bookcover/%EC%83%89%EA%B3%84_%ED%91%9C1-300x511.jpg',
  '4-A-1-author': '장아이링',
  '4-A-1-quotes': '또 시계를 쳐다보았다. 종아리에서 나간 스타킹 올이 천천히 위로 올라오듯이 실패했다는 예감이',
  '4-A-2-title': '바스커빌가의 사냥개',
  '4-A-2-image': 'https://minumsa.minumsa.com/wp-content/uploads/bookcover/448_%EB%B0%94%EC%8A%A4%EC%BB%A4%EB%B9%8C%EA%B0%80%EC%9D%98-%EC%82%AC%EB%83%A5%EA%B0%9C_%ED%91%9C1-300x511.jpg',
  '4-A-2-author': '아서 코난 도일',
  '4-A-2-quotes': '',
  '4-B-1-title': '백년의 고독1',
  '4-B-1-image': 'https://minumsa.minumsa.com/wp-content/uploads/bookcover/034_%EB%B0%B1%EB%85%84%EC%9D%98-%EA%B3%A0%EB%8F%851-300x505.jpg',
  '4-B-1-author': '가브리엘 가르시아 마르케스',
  '4-B-1-quotes': '',
  '4-B-2-title': '표범',
  '4-B-2-image': 'https://minumsa.minumsa.com/wp-content/uploads/bookcover/034_%EB%B0%B1%EB%85%84%EC%9D%98-%EA%B3%A0%EB%8F%851-300x505.jpg',
  '4-B-2-author': '주세페 토마시 디 람페두사',
  '4-B-2-quotes': '',
  final: [ '색,계', '백년의 고독 1' ]
}


*/ export async function POST(req: NextRequest) {
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

    for (const book of booksData) {
      const result = await db?.execute({
        sql: "INSERT INTO Books (id, title, cover_image, author, quotes) VALUES (?, ?, ?, ?, ?)",
        args: [
          Number(book.id),
          book.title,
          book.image,
          book.author,
          book.quotes,
        ],
      });

      if (!result) {
        throw new Error(`책 데이터 적재 실패: ${book.title}`);
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
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { message: `데이터 삽입 실패: ${error.message}` },
      { status: 500 }
    );
  }
}
