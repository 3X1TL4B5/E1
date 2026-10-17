/* E1 공통 상단바: 로고 · 검색 · 메뉴 버튼 (모든 페이지에서 불러다 써요) */
(function () {
  const BOARDS = [
    { key: "notice", name: "공지사항", desc: "운영 소식과 안내", href: "notice.html" },
    { key: "free",   name: "자유게시판", desc: "자유롭게 이야기해요", href: "board.html?b=free" },
    { key: "tips",   name: "공략/팁", desc: "노하우를 나눠요", href: "board.html?b=tips" },
    { key: "qna",    name: "질문/답변", desc: "궁금한 건 여기서 물어보세요", href: "board.html?b=qna" },
  ];
  const boardName = (k) => (BOARDS.find(b => b.key === k) || {}).name || "";

  const ICON_S = '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>';
  const ICON_M = '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  const ICON_X = '<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19"/></svg>';

  const CSS = `
  #e1-header{display:flex;align-items:center;justify-content:space-between;padding:8px 14px;background:#000;border-bottom:1px solid #1c1830;position:sticky;top:env(safe-area-inset-top,0px);z-index:50;flex:none}
  #e1-header .logo img{width:34px;height:34px;display:block}
  #e1-header .tools{display:flex;gap:2px}
  .e1-ic{width:42px;height:42px;display:grid;place-items:center;background:none;border:0;color:#e9e6f5;cursor:pointer;border-radius:10px}
  .e1-ic:hover{background:#15111f}
  .e1-ic svg{width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round}
  .e1-layer{position:fixed;inset:0;z-index:100;background:#000;overflow-y:auto;display:none;padding:env(safe-area-inset-top,0px) 0 env(safe-area-inset-bottom,0px);font-family:-apple-system,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif;color:#e9e6f5}
  .e1-layer.open{display:block}
  .e1-top{display:flex;justify-content:space-between;align-items:center;padding:8px 14px;max-width:720px;margin:0 auto}
  .e1-top img{width:34px;height:34px}
  .e1-menu{max-width:720px;margin:0 auto;padding:4px 24px 48px}
  .e1-label{font-size:12px;letter-spacing:.14em;color:#8a85a3;margin:30px 0 6px}
  .e1-link{display:flex;align-items:baseline;gap:14px;width:100%;padding:15px 0;border:0;border-bottom:1px solid #1c1830;background:none;color:#e9e6f5;text-decoration:none;font:700 26px/1.3 inherit;font-family:inherit;text-align:left;cursor:pointer}
  .e1-link small{font-size:13px;font-weight:400;letter-spacing:.06em;color:#8a85a3;width:26px;flex:none}
  .e1-link:hover,.e1-link.on{color:#a78bfa}
  .e1-link.sm{font-size:19px;font-weight:600}
  .e1-search{max-width:720px;margin:0 auto;padding:4px 20px 48px}
  .e1-sbar{display:flex;align-items:center;gap:8px;border-bottom:2px solid #7c5cff;padding:6px 0}
  .e1-sbar input{flex:1;min-width:0;background:none;border:0;outline:0;color:#e9e6f5;font-size:22px;font-weight:600;padding:10px 0;font-family:inherit}
  .e1-sbar input::placeholder{color:#4d4863}
  .e1-hint{color:#8a85a3;font-size:14px;margin:18px 2px}
  .e1-res{display:block;width:100%;text-align:left;background:none;border:0;border-bottom:1px solid #1c1830;padding:14px 2px;color:#e9e6f5;cursor:pointer;font-family:inherit}
  .e1-res:hover{background:#0e0b18}
  .e1-res .t{font-size:16px;font-weight:600;overflow-wrap:anywhere}
  .e1-res .m{font-size:13px;color:#8a85a3;margin-top:5px}
  .e1-res .b{color:#a78bfa}
  `;

  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function layerTop(onClose) {
    const top = el("div", "e1-top");
    const img = el("img"); img.src = "logo.png"; img.alt = "E1";
    const x = el("button", "e1-ic"); x.setAttribute("aria-label", "닫기"); x.innerHTML = ICON_X; x.onclick = onClose;
    top.append(img, x); return top;
  }

  window.E1Nav = {
    boards: BOARDS, boardName,
    init(sb, opts) {
      opts = opts || {};
      if (document.getElementById("e1-header")) return;
      const st = el("style"); st.textContent = CSS; document.head.appendChild(st);

      /* 상단바 */
      const header = el("div"); header.id = "e1-header";
      const logo = el("a", "logo"); logo.href = "main.html"; logo.setAttribute("aria-label", "홈");
      const li = el("img"); li.src = "logo.png"; li.alt = "E1"; logo.appendChild(li);
      const tools = el("div", "tools");
      const bs = el("button", "e1-ic"); bs.setAttribute("aria-label", "검색창 열기"); bs.innerHTML = ICON_S;
      const bm = el("button", "e1-ic"); bm.setAttribute("aria-label", "메인 메뉴 열기"); bm.innerHTML = ICON_M;
      tools.append(bs, bm); header.append(logo, tools); document.body.prepend(header);

      const lock = (on) => { document.documentElement.style.overflow = on ? "hidden" : ""; };

      /* 메뉴 */
      const menu = el("div", "e1-layer");
      const closeMenu = () => { menu.classList.remove("open"); lock(false); };
      const box = el("div", "e1-menu");
      box.appendChild(el("div", "e1-label", "게시판"));
      BOARDS.forEach((b, i) => {
        const a = el("a", "e1-link" + (opts.active === b.key ? " on" : "")); a.href = b.href;
        a.append(el("small", "", String(i + 1).padStart(2, "0")), b.name); box.appendChild(a);
      });
      box.appendChild(el("div", "e1-label", "커뮤니티"));
      const chat = el("a", "e1-link sm" + (opts.active === "chat" ? " on" : "")); chat.href = "chat.html"; chat.textContent = "전체 채팅"; box.appendChild(chat);
      if (opts.isAdmin) {
        const ad = el("a", "e1-link sm" + (opts.active === "admin" ? " on" : "")); ad.href = "admin.html"; ad.textContent = "관리"; box.appendChild(ad);
      }
      box.appendChild(el("div", "e1-label", "계정"));
      const out = el("button", "e1-link sm", "로그아웃");
      out.onclick = async () => { await sb.auth.signOut(); location.replace("index.html"); };
      box.appendChild(out);
      menu.append(layerTop(closeMenu), box); document.body.appendChild(menu);
      bm.onclick = () => { menu.classList.add("open"); lock(true); };

      /* 검색 */
      const sl = el("div", "e1-layer");
      const closeSearch = () => { sl.classList.remove("open"); lock(false); };
      const wrap = el("div", "e1-search");
      const bar = el("div", "e1-sbar");
      const inp = el("input"); inp.type = "search"; inp.placeholder = "검색어를 입력하세요"; inp.maxLength = 40; inp.autocomplete = "off";
      bar.appendChild(inp);
      const res = el("div"); const hint = el("div", "e1-hint", "제목과 내용에서 두 글자 이상으로 찾아요.");
      wrap.append(bar, hint, res);
      sl.append(layerTop(closeSearch), wrap); document.body.appendChild(sl);
      bs.onclick = () => { sl.classList.add("open"); lock(true); setTimeout(() => inp.focus(), 50); };

      let timer = null, seq = 0;
      const fmt = (s) => new Date(s).toLocaleDateString("ko-KR", { year: "2-digit", month: "numeric", day: "numeric" });
      async function run(raw) {
        const my = ++seq, t = raw.replace(/[%,()*\\"]/g, " ").trim();
        res.replaceChildren();
        if (t.length < 2) { hint.textContent = "제목과 내용에서 두 글자 이상으로 찾아요."; return; }
        hint.textContent = "찾는 중...";
        const f = `title.ilike.%${t}%,content.ilike.%${t}%`;
        const [p, n] = await Promise.all([
          sb.from("posts").select("id,title,board,created_at").or(f).order("created_at", { ascending: false }).limit(30),
          sb.from("notices").select("id,title,created_at").or(f).order("created_at", { ascending: false }).limit(10),
        ]);
        if (my !== seq) return;                         // 더 최신 검색이 있으면 버려요
        if (p.error && n.error) { hint.textContent = "검색하지 못했어요."; return; }
        const rows = [
          ...(n.data || []).map(r => ({ ...r, board: "notice", href: "notice.html?id=" + r.id })),
          ...(p.data || []).map(r => ({ ...r, href: "board.html?b=" + r.board + "&id=" + r.id })),
        ];
        hint.textContent = rows.length ? rows.length + "건을 찾았어요." : "검색 결과가 없어요.";
        rows.forEach(r => {
          const b = el("button", "e1-res");
          b.append(el("div", "t", r.title));
          const m = el("div", "m"); m.append(el("span", "b", boardName(r.board)), " · " + fmt(r.created_at));
          b.appendChild(m); b.onclick = () => { location.href = r.href; }; res.appendChild(b);
        });
      }
      inp.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(() => run(inp.value), 300); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeMenu(); closeSearch(); } });
    },
  };
})();
