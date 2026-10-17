/* E1 공통 상단바 · 검색 · 메뉴 · 휴대폰 탭바
   로그인 후 모든 페이지가 이 파일 하나로 main.html과 같은 상단바를 써요. (규칙: CLAUDE.md)
   먼저 불러올 것: theme.css, app.css, config.js, common.js

   E1Nav.init(sb, {
     active:  "home" | "notice" | 게시판 id(boards.id) | "chat" | "admin",  // 지금 페이지 표시
     isAdmin: true/false,                 // 메뉴에 '관리' 보이기
     write:   { href, label } | { onClick, label } | false,   // 글쓰기 버튼 (기본: 첫 번째 게시판)
     tabbar:  true/false,                 // 휴대폰 하단 탭바 (기본 true, 채팅처럼 입력창이 아래에 있으면 false)
   }) */
(function () {
  const { h, ICON, BOARDS, boardName, boardHref, ago, DEMO } = GH;
  const NAME = typeof SITE_NAME === "string" ? SITE_NAME : "E1";
  const ic = (name) => h("span", { class: "ic", html: ICON[name] });

  // 상단 바로가기: 공지 + boards 테이블의 게시판(앞 4개) + 채팅
  const makeLinks = () => [
    { key: "notice", label: "공지", href: "notice.html" },
    ...BOARDS.slice(1, 5).map((b) => ({ key: b.key, label: b.name, href: b.href })),
    { key: "chat", label: "채팅", href: "chat.html" },
  ];

  async function init(sb, opts) {
    opts = opts || {};
    if (document.querySelector("header.top")) return;
    await GH.loadBoards();
    if (document.querySelector("header.top")) return;
    const LINKS = makeLinks();
    const active = String(opts.active || "");
    const write = opts.write === false ? null : Object.assign({ href: GH.firstBoardHref(), label: "글쓰기" }, opts.write || {});
    const signOut = () => GH.signOut();

    /* ----- 상단바 ----- */
    const searchBtn = h("button", { class: "search-trigger", type: "button", "aria-label": "검색 열기" }, ic("search"), h("span", { class: "st" }, "글 검색"), h("kbd", null, "Ctrl K"));
    const menuBtn = h("button", { class: "icon-btn", type: "button", "aria-label": "메뉴 열기", html: ICON.menu });
    let writeBtn = null;
    if (write) {
      writeBtn = h(write.onClick ? "button" : "a", { class: "btn-primary write-btn", href: write.onClick ? null : write.href, type: write.onClick ? "button" : null }, ic("pen"), write.label);
      if (write.onClick) writeBtn.addEventListener("click", write.onClick);
    }
    const header = h("header", { class: "top" },
      h("div", { class: "top-in" },
        h("a", { class: "brand", href: "main.html", "aria-label": NAME + " 홈" }, NAME),
        h("nav", { class: "links", "aria-label": "주요 메뉴" }, LINKS.map((l) => h("a", { href: l.href, class: active === l.key ? "on" : null, "aria-current": active === l.key ? "page" : null }, l.label))),
        h("span", { class: "spacer" }),
        searchBtn,
        h("button", { class: "icon-btn", type: "button", "data-theme-toggle": "", "aria-label": "테마 바꾸기" }),
        writeBtn,
        menuBtn));
    document.body.prepend(header);

    /* ----- 검색 레이어 ----- */
    const q = h("input", { id: "e1-q", type: "search", placeholder: "공지와 게시글 제목·내용에서 찾기", maxlength: "40", autocomplete: "off" });
    const sres = h("div", { class: "sres" }, h("div", { class: "shint" }, "두 글자 이상 입력하세요."));
    const searchLayer = h("div", { class: "layer", role: "dialog", "aria-modal": "true", "aria-label": "검색" },
      h("div", { class: "scrim", "data-close": "" }),
      h("div", { class: "sheet search-sheet" },
        h("div", { class: "sbar" }, ic("search"), q, h("button", { class: "icon-btn", type: "button", "data-close": "", "aria-label": "검색 닫기", html: ICON.close })),
        sres));

    /* ----- 메뉴 레이어 ----- */
    const menuClose = h("button", { class: "icon-btn", type: "button", "data-close": "", "aria-label": "메뉴 닫기", html: ICON.close });
    const menuLayer = h("div", { class: "layer", role: "dialog", "aria-modal": "true", "aria-label": "메뉴" },
      h("div", { class: "scrim", "data-close": "" }),
      h("div", { class: "sheet menu-sheet" },
        h("div", { class: "menu-top" }, h("a", { class: "brand", href: "main.html" }, NAME), menuClose),
        h("div", { class: "menu-body" },
          // 순서: 커뮤니티(홈 → 공지·게시판들 → 전체 채팅) → 설정(관리 → 테마 → 로그아웃)
          h("div", { class: "menu-lbl" }, "커뮤니티"),
          h("a", { class: "menu-link" + (active === "home" ? " on" : ""), href: "main.html" }, ic("home"), "홈"),
          BOARDS.map((b) => h("a", { class: "menu-link" + (active === b.key ? " on" : ""), href: b.href }, ic(GH.boardIcon(b)), b.name)),
          h("a", { class: "menu-link" + (active === "chat" ? " on" : ""), href: "chat.html" }, ic("chat"), "전체 채팅"),
          h("div", { class: "menu-lbl" }, "설정"),
          opts.isAdmin ? h("a", { class: "menu-link" + (active === "admin" ? " on" : ""), href: "admin.html" }, ic("list"), "관리") : null,
          h("button", { class: "menu-link", type: "button", "data-theme-toggle": "" }, h("i", { class: "ic" }), h("span", { "data-theme-label": "" }, "테마 바꾸기")),
          h("button", { class: "menu-link danger", type: "button", onclick: signOut }, "로그아웃"))));

    document.body.append(searchLayer, menuLayer);

    /* ----- 휴대폰 탭바 ----- */
    if (opts.tabbar !== false) {
      const tabBoards = h("button", { type: "button", class: BOARDS.some((b) => b.key === active) ? "on" : null }, ic("list"), "게시판");
      const tabSearch = h("button", { type: "button" }, ic("search"), "검색");
      let tabWrite;
      if (write && write.onClick) { tabWrite = h("button", { type: "button", class: "plus", "aria-label": write.label }, ic("pen"), write.label); tabWrite.addEventListener("click", write.onClick); }
      else tabWrite = h("a", { class: "plus", href: write ? write.href : GH.firstBoardHref(), "aria-label": "글쓰기" }, ic("pen"), "글쓰기");
      const bar = h("nav", { class: "tabbar", "aria-label": "빠른 이동" },
        h("a", { href: "main.html", class: active === "home" ? "on" : null }, ic("home"), "홈"),
        tabBoards, tabWrite,
        h("a", { href: "chat.html", class: active === "chat" ? "on" : null }, ic("chat"), "채팅"),
        tabSearch);
      document.body.append(bar);
      document.body.classList.add("has-tabbar");
      tabBoards.addEventListener("click", () => open(menuLayer));
      tabSearch.addEventListener("click", () => open(searchLayer));
    }

    /* ----- 열고 닫기 ----- */
    let lastFocus = null;
    function open(layer) {
      lastFocus = document.activeElement;
      layer.classList.add("open");
      document.documentElement.style.overflow = "hidden";
      if (layer === searchLayer) setTimeout(() => q.focus(), 30); else menuClose.focus();
    }
    function closeAll() {
      [searchLayer, menuLayer].forEach((l) => l.classList.remove("open"));
      document.documentElement.style.overflow = "";
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    document.querySelectorAll(".layer [data-close]").forEach((e) => e.addEventListener("click", closeAll));
    searchBtn.addEventListener("click", () => open(searchLayer));
    menuBtn.addEventListener("click", () => open(menuLayer));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeAll();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); open(searchLayer); }
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); open(searchLayer); }
    });

    /* ----- 검색 ----- */
    let timer = null, seq = 0;
    async function run(raw) {
      const my = ++seq, t = raw.replace(/[%,()*\\"]/g, " ").trim();
      if (t.length < 2) return sres.replaceChildren(h("div", { class: "shint" }, "두 글자 이상 입력하세요."));
      sres.replaceChildren(h("div", { class: "shint" }, "찾는 중..."));
      let rows = [];
      if (DEMO) {
        const hit = (x) => x.title.includes(t);
        rows = [...GH.DEMO_DATA.notices.filter(hit).map((r) => ({ ...r, board: "notice" })), ...GH.DEMO_DATA.posts.filter(hit)];
      } else {
        const f = `title.ilike.%${t}%,content.ilike.%${t}%`;
        const [p, n] = await Promise.all([
          sb.from("posts").select("id,title,board_id,created_at").or(f).order("created_at", { ascending: false }).limit(30),
          sb.from("notices").select("id,title,created_at").or(f).order("created_at", { ascending: false }).limit(10),
        ]);
        if (my !== seq) return;                         // 더 최신 검색이 있으면 버려요
        if (p.error && n.error) return sres.replaceChildren(h("div", { class: "shint" }, "검색하지 못했어요."));
        rows = [...(n.data || []).map((r) => ({ ...r, board: "notice" })), ...(p.data || []).map((r) => ({ ...r, board: String(r.board_id) }))];
      }
      if (!rows.length) return sres.replaceChildren(h("div", { class: "shint" }, "‘" + t + "’ 검색 결과가 없어요."));
      sres.replaceChildren(h("div", { class: "shint" }, rows.length + "건을 찾았어요."), ...rows.map((r) =>
        h("a", { href: boardHref(r.board, r.id) }, h("div", { class: "t" }, r.title), h("div", { class: "m" }, h("b", null, boardName(r.board)), " · " + ago(r.created_at)))));
    }
    q.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(() => run(q.value), 300); });

    GH.theme.sync();
    // 보안: 활동 없으면 10분 뒤 자동 로그아웃 (관리자는 예외)
    if (!opts.isAdmin) GH.startIdleLogout();
  }

  window.E1Nav = { boards: BOARDS, boardName, init };
})();
