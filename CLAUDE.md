# E1 사이트 규칙

초대받은 회원 전용 게임 커뮤니티. GitHub Pages(https://3x1tl4b5.github.io/E1/)에 정적 파일로 배포하고, 로그인·데이터는 Supabase를 써요. 빌드 과정은 없어요.

## 모든 페이지는 main.html 규격을 따른다

새 페이지를 만들거나 기존 페이지를 고칠 때 아래를 지켜요. **새 페이지는 `_template.html`을 복사해서 시작해요.**

### 1. 불러오는 순서 (고정)
`<head>` 안:
1. Outfit 폰트 (Google Fonts)
2. `theme.css` — 색 토큰(밝게/어둡게), 버튼·입력칸, 로그인 계열 화면
3. `app.css` — 로그인 후 페이지 공통: 상단바, 검색/메뉴, 휴대폰 탭바, `.page` 틀, 타일·목록·버튼
4. `config.js` → `common.js` (테마를 먼저 적용해서 화면이 깜빡이지 않게 `<head>`에서)

`<body>` 끝: supabase-js(2.45.4) → `nav.js` → 페이지 스크립트

로그인 계열 화면(index, signup, reset-password, set-password)은 `app.css`, `nav.js` 없이 `theme.css`의 `.auth` 틀을 써요.

### 2. 상단바는 직접 만들지 않는다
로그인 후 모든 페이지는 `E1Nav.init(sb, { active, isAdmin, write, tabbar })` 한 줄로 main.html과 같은 상단바·검색·메뉴·휴대폰 탭바를 붙여요. 페이지에 `<header>`를 따로 만들지 않아요.
- `active`: `home` `notice` `free` `tips` `qna` `chat` `admin` 중 하나 (새 메뉴면 nav.js의 LINKS/메뉴에 추가)
- `write`: `{ onClick, label }`이면 상단 글쓰기 버튼이 그 페이지 동작을 하고, `false`면 숨김
- `tabbar: false`: 채팅처럼 입력창이 화면 아래에 있는 페이지

### 3. 색은 토큰만
- 색은 `theme.css`의 `var(--bg)`, `--surface`, `--fg`, `--muted`, `--line`, `--accent`, `--accent-ink`, `--accent-soft`, `--danger` 등만 써요. `#000` 같은 고정 색을 직접 쓰지 않아요.
- 밝은/어두운 테마 모두에서 확인해요. 테마 버튼은 nav.js가 상단바와 메뉴에 넣어 줘요.

### 4. 페이지 틀과 부품
- 본문은 `<main class="page">` 하나. 안에 `.page-head`(작은 분류 + 제목 h1) → `.tile` 카드.
- 여러 화면(목록/글쓰기/글 보기)을 바꿔 보여줄 땐 각각 `.stack`으로 감싸고 `.hidden`으로 전환.
- 부품: `.list` + `.list-item`(.t 제목, .m 정보), `.primary` / `.ghost` / `.ghost.danger` 버튼, `.chip`, `.pin`, `.badge`, `.empty`, `.skel`, `.detail`, `.tabs`, `.row`, `.hint`.
- `.page` 안의 input/textarea/select는 자동으로 같은 모양이에요.

### 5. 화면 크기
PC(960px 이상 4열), 태블릿(700~959px), 휴대폰(699px 이하, 하단 탭바), 휴대폰 가로(높이 540px 이하)를 모두 확인해요. 가로 스크롤이 생기면 안 돼요.

### 6. 그 밖에
- 로고 이미지는 쓰지 않아요. 로고 자리는 `config.js`의 `SITE_NAME` 글자예요.
- 사용자가 쓴 글은 항상 `textContent`(또는 `GH.h()`)로 넣어요. `innerHTML`에 넣지 않아요.
- Supabase 클라이언트는 `GH.sb()`, 로그인 확인은 `GH.session()`, 로그아웃은 `GH.signOut()`.
- 게시판 목록은 Supabase `boards` 테이블에서 읽어요(관리 페이지 '게시판' 탭에서 관리). 페이지에서 `await GH.loadBoards()` 뒤에 `GH.BOARDS`(맨 앞은 고정 공지사항, notices 테이블)를 써요. 게시판 주소는 `board.html?b=<boards.id>`. 공지사항은 boards에 넣지 않아요(중복 방지).
- 데이터베이스 구조를 바꾸는 SQL은 사이트 키로 실행할 수 없어요. SQL을 준비해서 사용자가 Supabase SQL Editor에서 실행하게 해요.

## 테이블 (Supabase)
`posts`(id, title, content, board_id → boards.id, created_at, author_id) · `boards`(id, parent_id, name, description, position, created_at) · `notices`(id, title, content, pinned, created_at, updated_at) · `messages`(id, author_id, content, created_at) · `profiles`(id, nickname) · `admins`(user_id) · `banned_users` · `invite_links` · `boards` · `reserved_nicknames`
