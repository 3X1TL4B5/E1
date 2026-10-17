/* 공통: 테마(밝게/어둡게), Supabase 연결 또는 미리보기 모드, 작은 도우미들
   <head> 안에서 config.js 다음에 불러와야 화면이 깜빡이지 않아요. */
(function () {
  const root = document.documentElement;
  const KEY = "gh-theme";
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  const sess = {
    get(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { sessionStorage.removeItem(k); } catch (e) {} },
  };

  /* ---------- 테마 ---------- */
  function applyTheme(t) {
    if (t === "light" || t === "dark") root.setAttribute("data-theme", t);
    else root.removeAttribute("data-theme");
  }
  applyTheme(store.get(KEY));            // 처음 그리기 전에 적용
  const currentTheme = () => root.getAttribute("data-theme") || (mq.matches ? "dark" : "light");

  const ICON = {
    sun: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',
    menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    pen: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>',
    home: '<svg viewBox="0 0 24 24"><path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/></svg>',
    chat: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></svg>',
    list: '<svg viewBox="0 0 24 24"><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>',
    eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    /* 게시판 아이콘 */
    megaphone: '<svg viewBox="0 0 24 24"><path d="M3 10v4h3l6 4V6L6 10z"/><path d="M16 9a3.5 3.5 0 0 1 0 6"/><path d="M19 6a8 8 0 0 1 0 12"/></svg>',
    talk: '<svg viewBox="0 0 24 24"><path d="M3 5h12v8H8l-5 4z"/><path d="M15 9h6v8l-3-2h-6v-2"/></svg>',
    bulb: '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/></svg>',
    help: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14"/><path d="M12 17h.01"/></svg>',
    doc: '<svg viewBox="0 0 24 24"><path d="M6 3h9l3 3v15H6z"/><path d="M9 10h6M9 14h6M9 18h4"/></svg>',
    image: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 8"/></svg>',
  };

  function syncTheme() {
    const dark = currentTheme() === "dark";
    document.querySelectorAll("[data-theme-toggle]").forEach((b) => {
      b.setAttribute("aria-label", dark ? "밝은 테마로 바꾸기" : "어두운 테마로 바꾸기");
      b.title = dark ? "밝은 테마" : "어두운 테마";
      const label = b.querySelector("[data-theme-label]");
      const svg = dark ? ICON.sun : ICON.moon;
      if (label) { b.querySelector("i").innerHTML = svg; label.textContent = dark ? "밝은 테마로" : "어두운 테마로"; }
      else b.innerHTML = svg;
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? "#06050A" : "#EEF0F6";
  }
  function setTheme(t) { applyTheme(t); store.set(KEY, t); syncTheme(); }
  if (mq.addEventListener) mq.addEventListener("change", syncTheme);
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-theme-toggle]");
    if (b) setTheme(currentTheme() === "dark" ? "light" : "dark");
  });

  /* ---------- 사이트 이름 ---------- */
  const NAME = typeof SITE_NAME === "string" ? SITE_NAME : "E1";
  function brand() {
    document.querySelectorAll("[data-site-name]").forEach((e) => { e.textContent = NAME; });
    if (!document.title.startsWith(NAME)) document.title = document.title ? NAME + " · " + document.title : NAME;
  }

  /* ---------- Supabase 또는 미리보기 ---------- */
  const DEMO = typeof SUPABASE_URL === "undefined" || /YOUR-PROJECT/.test(SUPABASE_URL);
  let client = null;

  /* 게시판 목록: 공지사항(notices 테이블)은 고정, 나머지는 Supabase boards 테이블에서 읽어요.
     글(posts)은 board_id 로 게시판을 구분해요. 페이지에서 GH.loadBoards() 를 먼저 불러야 채워져요.
     순서: position → 상위 게시판 다음에 그 하위 게시판 */
  const NOTICE = { key: "notice", name: "공지사항", desc: "운영 소식과 안내", href: "notice.html" };
  const BOARDS = [NOTICE];
  const DEMO_BOARDS = [
    { id: 1, name: "자유게시판", description: "자유롭게 이야기해요", parent_id: null, position: 0 },
    { id: 2, name: "공략/팁", description: "노하우를 나눠요", parent_id: null, position: 1 },
    { id: 3, name: "질문/답변", description: "궁금한 건 여기서 물어보세요", parent_id: null, position: 2, image_rule: "required" },
  ];
  // imageRule: off(첨부 없음) / optional(선택) / required(1장 이상) — boards.image_rule (7단계 SQL)
  const toBoard = (b) => ({ key: String(b.id), id: b.id, name: b.name, desc: b.description || "", href: "board.html?b=" + b.id, imageRule: b.image_rule || "off" });
  function ordered(rows) {
    const top = rows.filter((b) => !b.parent_id);
    return top.flatMap((t) => [t, ...rows.filter((b) => b.parent_id === t.id)]);
  }
  let boardsLoaded = null;
  function loadBoards() {
    if (!boardsLoaded) boardsLoaded = (async () => {
      let rows = DEMO_BOARDS;
      if (!DEMO) {
        // "*" : 나중에 칸이 추가돼도(예: image_rule) 그 전 데이터베이스에서 깨지지 않게
        const { data, error } = await GH.sb().from("boards").select("*").order("position").order("id");
        rows = error ? [] : data || [];
      }
      BOARDS.splice(1, BOARDS.length, ...ordered(rows).map(toBoard));
      return BOARDS;
    })();
    return boardsLoaded;
  }

  function ago(iso) {
    const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return "방금";
    if (s < 3600) return Math.floor(s / 60) + "분 전";
    if (s < 86400) return Math.floor(s / 3600) + "시간 전";
    if (s < 86400 * 7) return Math.floor(s / 86400) + "일 전";
    return new Date(iso).toLocaleDateString("ko-KR", { year: "2-digit", month: "numeric", day: "numeric" });
  }

  /* 안전하게 요소 만들기: 글 내용은 항상 textContent로만 넣어요 */
  function h(tag, attrs, ...kids) {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === "class") e.className = attrs[k];
      else if (k === "html") e.innerHTML = attrs[k];          // 아이콘 같은 고정 마크업 전용
      else if (k.startsWith("on")) e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] != null) e.setAttribute(k, attrs[k]);
    }
    kids.flat().forEach((c) => { if (c != null) e.append(c.nodeType ? c : String(c)); });
    return e;
  }

  function demoPill() {
    if (!DEMO) return;
    const p = h("div", { class: "demo-pill", role: "note" }, h("b", null, "미리보기 모드"), h("span", null, "config.js에 Supabase 정보를 넣으면 실제 로그인으로 바뀌어요"));
    document.body.appendChild(p);
  }

  const m = (min) => new Date(Date.now() - min * 60000).toISOString();
  const DEMO_DATA = {
    nickname: "새벽별",
    notices: [
      { id: 1, title: "10월 정기 점검 안내 (10/22 새벽 2시~6시)", pinned: true, created_at: m(60 * 5) },
      { id: 2, title: "길드 대항전 참가 신청을 받아요", pinned: false, created_at: m(60 * 26) },
      { id: 3, title: "커뮤니티 이용 규칙이 바뀌었어요", pinned: false, created_at: m(60 * 72) },
    ],
    posts: [
      { id: 11, board: "2", title: "심연의 탑 3관문 파티 구성 정리", created_at: m(12), nick: "달토끼" },
      { id: 12, board: "1", title: "이번 패치 궁수 너프 체감 후기", created_at: m(48), nick: "모닥불" },
      { id: 13, board: "3", title: "30레벨 이후 사냥터 어디가 좋아요?", created_at: m(95), nick: "초보농부" },
      { id: 14, board: "2", title: "골드 시세 정리 (10월 3주)", created_at: m(60 * 4), nick: "시세봇" },
      { id: 15, board: "1", title: "어제 길드전 다시보기 링크 모음", created_at: m(60 * 9), nick: "새벽코어" },
    ],
    counts: { notice: 3, 1: 128, 2: 46, 3: 72 },
    messages: [
      { id: 101, nick: "달토끼", content: "오늘 레이드 9시 맞죠?", created_at: m(3) },
      { id: 102, nick: "운영진", content: "네, 9시에 길드 채널에서 모여요", created_at: m(2) },
      { id: 103, nick: "모닥불", content: "저 힐러로 들어갈게요!", created_at: m(1) },
    ],
    online: ["새벽별", "달토끼", "모닥불", "운영진", "초코칩", "은빛여우", "모래시계"],
    members: 86,
  };

  window.GH = {
    DEMO, ICON, BOARDS, DEMO_DATA, h, ago, loadBoards,
    boardName: (k) => (BOARDS.find((b) => b.key === String(k)) || {}).name || "",
    boardHref: (k, id) => (k === "notice" ? "notice.html" + (id ? "?id=" + id : "") : "board.html?b=" + k + (id ? "&id=" + id : "")),
    firstBoardHref: () => (BOARDS[1] ? BOARDS[1].href : "main.html"),
    /* 증거 보관 잠금: 차단 중이거나 차단이 풀리기 전에 쓴 내 글·댓글·채팅은 수정·삭제 불가 (5단계 SQL)
       GH.lockCheck(sb) → (created_at) => 잠겼으면 true. 관리자는 페이지에서 따로 예외 처리해요. */
    async lockCheck(sb) {
      if (DEMO) return () => false;
      const { data, error } = await sb.rpc("my_lock_before");
      if (error || !data) return () => false;
      if (String(data).includes("infinity")) return () => true;
      const cut = new Date(data).getTime();
      return (created) => new Date(created).getTime() <= cut;
    },
    LOCK_MSG: "보관 중인 내용이라 수정하거나 지울 수 없어요.",

    /* 게시글 이미지 (7단계 SQL: post-images 저장소) */
    IMG: { BUCKET: "post-images", MAX_COUNT: 5, MAX_BYTES: 5 * 1024 * 1024, MAX_SIDE: 1920 },
    /* 올리기 전에 긴 변 1920px로 줄이고 압축 (gif는 움직임 유지를 위해 그대로) */
    async shrinkImage(file) {
      if (file.type === "image/gif") return file;
      let bmp;
      try { bmp = await createImageBitmap(file); } catch (e) { return file; }
      const scale = Math.min(1, GH.IMG.MAX_SIDE / Math.max(bmp.width, bmp.height));
      const c = document.createElement("canvas");
      c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
      c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
      const enc = (type, q) => new Promise((r) => c.toBlob(r, type, q));
      let out = await enc("image/webp", 0.85);
      if (!out || out.type !== "image/webp") out = await enc("image/jpeg", 0.85);   // webp 못 만드는 브라우저
      return out && out.size < file.size ? out : file;
    },

    /* 자동 로그아웃: 활동이 없으면 IDLE_MIN 분 뒤 로그아웃 (관리자는 nav.js에서 제외)
       - 여러 탭이 같은 기록(localStorage)을 써서, 한 탭에서 활동하면 다른 탭도 유지돼요.
       - 1분 전에 알림을 띄우고 '계속 이용하기'로 연장할 수 있어요. */
    IDLE_MIN: 10,
    async startIdleLogout() {
      if (GH._idle) return;
      GH._idle = true;
      const LIMIT = GH.IDLE_MIN * 60000, WARN = 60000, KEY = "gh-last-active";
      const s = await GH.session();
      if (!s) return;
      // 방금 로그인했으면 그 시각부터 셈 (예전 기록 때문에 바로 로그아웃되지 않게)
      const signedIn = s.user && s.user.last_sign_in_at ? new Date(s.user.last_sign_in_at).getTime() : 0;
      let mem = 0, lastWrite = 0;                            // 저장소를 못 쓰는 브라우저 대비
      const last = () => Math.max(Number(store.get(KEY)) || 0, mem, signedIn);
      const touch = () => { const n = Date.now(); mem = n; if (n - lastWrite > 5000) { lastWrite = n; store.set(KEY, String(n)); } };
      // 기록이 있는데 10분이 지났으면(탭을 닫아 뒀다가 다시 연 경우) 바로 로그아웃, 기록이 없으면 지금부터 셈
      if (Number(store.get(KEY)) && Date.now() - last() > LIMIT) return out();
      touch();
      ["pointerdown", "keydown", "scroll", "touchstart", "wheel"].forEach((ev) => window.addEventListener(ev, touch, { passive: true, capture: true }));

      let toast = null, timerText = null;
      function warn(left) {
        if (!toast) {
          timerText = h("b", null, "");
          const keep = h("button", { class: "primary", type: "button", onclick: () => { lastWrite = 0; touch(); hide(); } }, "계속 이용하기");
          toast = h("div", { class: "idle-toast", role: "alertdialog", "aria-live": "assertive" },
            h("div", null, "활동이 없어 ", timerText, " 뒤 자동으로 로그아웃돼요."), keep);
          document.body.appendChild(toast);
          keep.focus();
        }
        timerText.textContent = Math.max(1, Math.ceil(left / 1000)) + "초";
      }
      function hide() { if (toast) { toast.remove(); toast = null; } }
      async function out() {
        sess.set("gh-logout-reason", GH.IDLE_MIN + "분 동안 활동이 없어 보안을 위해 로그아웃했어요.");
        store.set(KEY, "");
        await GH.signOut();
      }
      setInterval(() => {
        const left = LIMIT - (Date.now() - last());
        if (left <= 0) return out();
        if (left <= WARN) warn(left); else hide();
      }, 1000);
    },
    /* 게시판 이름으로 아이콘 고르기 (관리에서 새 게시판을 만들면 이름에 맞춰 자동으로 골라요) */
    boardIcon: (b) => {
      const n = (b && b.name) || "";
      if (b && b.key === "notice" || /공지/.test(n)) return "megaphone";
      if (/자유|잡담|수다/.test(n)) return "talk";
      if (/공략|팁|가이드/.test(n)) return "bulb";
      if (/질문|답변|문의|Q&A/i.test(n)) return "help";
      return "doc";
    },
    theme: { current: currentTheme, set: setTheme, sync: syncTheme },
    sb() {
      if (DEMO) return null;
      if (!client) client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      return client;
    },
    async session() {
      if (DEMO) return sess.get("gh-demo") ? { user: { id: "demo", email: sess.get("gh-demo") } } : null;
      const { data } = await GH.sb().auth.getSession();
      return data.session;
    },
    async signIn(email, password) {
      if (DEMO) { sess.set("gh-demo", email || "demo"); return { error: null }; }
      return GH.sb().auth.signInWithPassword({ email, password });
    },
    async signOut() {
      if (DEMO) sess.del("gh-demo");
      else await GH.sb().auth.signOut();
      location.replace("index.html");
    },
  };

  document.addEventListener("DOMContentLoaded", () => { brand(); syncTheme(); demoPill(); });
})();
