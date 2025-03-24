export default function Page() {
  return (
    <form method="POST" action="/api/create">
      <label htmlFor="videoEpisode">episodeNumber</label>
      <input id="videoEpisode" placeholder="영상번호" name="videoEpisode" />

      <label htmlFor="videoTitle">title</label>
      <input id="videoTitle" placeholder="영상제목" name="videoTitle" />
      <label htmlFor="videoKeyword">keyword</label>
      <input id="videoKeyword" placeholder="영상키워드" name="videoKeyword" />
      <label htmlFor="videoKeyURL">영상 URL</label>
      <input id="videoKeyURL" placeholder="영상주소" name="videoKeyURL" />
      <h3>tournaments</h3>
      <div>
        <label htmlFor="4-A-1">4강 A조 첫 번째 책</label>
        <input id="4-A-1" placeholder="id" name="4-A-1-id" />
        <input id="4-A-1" placeholder="책 제목" name="4-A-1-title" />{" "}
        <input id="4-A-1" placeholder="책 이미지" name="4-A-1-image" />
        <input id="4-A-1" placeholder="작가" name="4-A-1-author" />
        <input id="4-A-1" placeholder="명대사" name="4-A-1-quotes" />
      </div>
      <div>
        <label htmlFor="4-A-2">4강 A조 두 번째 책</label>
        <input id="4-A-2" placeholder="id" name="4-A-2-id" />
        <input id="4-A-2" placeholder="책 제목" name="4-A-2-title" />{" "}
        <input id="4-A-2" placeholder="책 이미지" name="4-A-2-image" />
        <input id="4-A-2" placeholder="작가" name="4-A-2-author" />
        <input id="4-A-2" placeholder="명대사" name="4-A-2-quotes" />
      </div>
      <div>
        <label htmlFor="4-B-1">4강 B조 첫 번째 책</label>
        <input id="4-B-1" placeholder="id" name="4-B-1-id" />
        <input id="4-B-1" placeholder="책 제목" name="4-B-1-title" />{" "}
        <input id="4-B-1" placeholder="책 이미지" name="4-B-1-image" />
        <input id="4-B-1" placeholder="작가" name="4-B-1-author" />
        <input id="4-B-1" placeholder="명대사" name="4-B-1-quotes" />
      </div>
      <div>
        <label htmlFor="4-B-2">4강 B조 두 번째 책</label>
        <input id="4-B-2" placeholder="id" name="4-B-2-id" />
        <input id="4-B-2" placeholder="책 제목" name="4-B-2-title" />{" "}
        <input id="4-B-2" placeholder="책 이미지" name="4-B-2-image" />
        <input id="4-B-2" placeholder="작가" name="4-B-2-author" />
        <input id="4-B-2" placeholder="명대사" name="4-B-2-quotes" />
      </div>
      <div>
        <label htmlFor="final-1">결승 첫 번째 책</label>
        <input id="final-1" placeholder="책 id" name="final" />
      </div>
      <div>
        <label htmlFor="final-2">결승 두 번째 책 </label>
        <input id="final-2" placeholder="책 id" name="final" />
      </div>
      <div>
        <label htmlFor="final-winner">우승작 </label>
        <input id="final-winner" placeholder="책 id" name="final-winner" />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}

/*
영상 제목 : '색, 계'에 원작이 있다고? 독서 모임하기 좋은 드라마&영화의 원작 소설 BEST4 
round : 4강 A조 (색,계 vs 바스커빌 가의 사냥개 )4강 B조(백년의 고독 vs 표범) 결승 (색,계 vs 백년의 고독 ) 

*/
