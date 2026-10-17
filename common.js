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
    document.title = document.title ? NAME + " · " + document.title : NAME;
  }

  /* ---------- Supabase 또는 미리보기 ---------- */
  const DEMO = typeof SUPABASE_URL === "undefined" || /YOUR-PROJECT/.test(SUPABASE_URL);
  let client = null;

  const BOARDS = [
    { key: "notice", name: "공지사항", desc: "운영 소식과 안내", href: "notice.html" },
    { key: "free", name: "자유게시판", desc: "자유롭게 이야기해요", href: "board.html?b=free" },
    { key: "tips", name: "공략/팁", desc: "노하우를 나눠요", href: "board.html?b=tips" },
    { key: "qna", name: "질문/답변", desc: "궁금한 건 여기서 물어보세요", href: "board.html?b=qna" },
  ];

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
      { id: 11, board: "tips", title: "심연의 탑 3관문 파티 구성 정리", created_at: m(12), nick: "달토끼" },
      { id: 12, board: "free", title: "이번 패치 궁수 너프 체감 후기", created_at: m(48), nick: "모닥불" },
      { id: 13, board: "qna", title: "30레벨 이후 사냥터 어디가 좋아요?", created_at: m(95), nick: "초보농부" },
      { id: 14, board: "tips", title: "골드 시세 정리 (10월 3주)", created_at: m(60 * 4), nick: "시세봇" },
      { id: 15, board: "free", title: "어제 길드전 다시보기 링크 모음", created_at: m(60 * 9), nick: "새벽코어" },
    ],
    counts: { notice: 3, free: 128, tips: 46, qna: 72 },
    messages: [
      { id: 101, nick: "달토끼", content: "오늘 레이드 9시 맞죠?", created_at: m(3) },
      { id: 102, nick: "운영진", content: "네, 9시에 길드 채널에서 모여요", created_at: m(2) },
      { id: 103, nick: "모닥불", content: "저 힐러로 들어갈게요!", created_at: m(1) },
    ],
    online: ["새벽별", "달토끼", "모닥불", "운영진", "초코칩", "은빛여우", "모래시계"],
    members: 86,
  };

  window.GH = {
    DEMO, ICON, BOARDS, DEMO_DATA, h, ago,
    boardName: (k) => (BOARDS.find((b) => b.key === k) || {}).name || "",
    boardHref: (k, id) => (k === "notice" ? "notice.html" + (id ? "?id=" + id : "") : "board.html?b=" + k + (id ? "&id=" + id : "")),
    theme: { current: currentTheme, set: setTheme },
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
