/* E1 게시판 엔진: 소식(notices) · 라운지(posts) 공용 */
(function () {
  const KINDS = {
    news:   { title: "소식",   table: "notices", adminOnly: true,  pinned: true,
              boards: [["notice", "공지사항"], ["update", "업데이트"]] },
    lounge: { title: "라운지", table: "posts",   adminOnly: false, pinned: false,
              boards: [["free", "자유게시판"], ["tips", "공략&팁"], ["guild", "길드/클랜"]] }
  };
  const CSS = `
  .bd{max-width:720px;margin:0 auto;padding:16px;color:#e9e6f5;font-family:-apple-system,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif}
  .bd *{box-sizing:border-box}
  .bd-hide{display:none!important}
  .bd-bar{display:flex;justify-content:space-between;align-items:center;margin:4px 0 12px}
  .bd-bar h2{margin:0;font-size:20px}
  .bd-filter{margin-bottom:8px}
  .bd select,.bd input:not([type=checkbox]),.bd textarea{width:100%;padding:13px 16px;font-size:16px;font-family:inherit;color:#e9e6f5;background-color:#0b0912;border:1px solid #2a2540;border-radius:10px;outline:none}
  .bd select{padding-right:40px;appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%238a85a3' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M6 9l6 6 6-6'/></svg>");background-repeat:no-repeat;background-position:right 14px center}
  .bd select:focus,.bd input:focus,.bd textarea:focus{border-color:#7c5cff;box-shadow:0 0 0 3px rgba(124,92,255,.25)}
  .bd textarea{min-height:240px;resize:vertical;line-height:1.6}
  .bd form{display:grid;gap:12px}
  .bd-chk{display:flex;align-items:center;gap:10px;font-size:15px}
  .bd-chk input{width:20px;height:20px;accent-color:#7c5cff}
  .bd button{font-family:inherit;cursor:pointer}
  .bd-primary{padding:14px;font-size:16px;font-weight:600;color:#fff;background:#7c5cff;border:0;border-radius:10px}
  .bd-bar .bd-primary{padding:9px 16px;font-size:14px}
  .bd-primary:disabled{opacity:.6}
  .bd-ghost{padding:12px 14px;font-size:14px;color:#8a85a3;background:none;border:1px solid #2a2540;border-radius:8px}
  .bd-ghost:hover{color:#e9e6f5;border-color:#7c5cff}
  .bd-danger{color:#ff6b81;border-color:#4a2530}
  .bd-row{display:flex;gap:8px;margin-top:24px}.bd-row>*{flex:1}
  .bd-item{display:block;width:100%;text-align:left;padding:14px 4px;background:none;border:0;border-bottom:1px solid #1d1a2b;color:#e9e6f5}
  .bd-item:hover{background:#0e0b18}
  .bd-top{display:flex;gap:6px;align-items:center;margin-bottom:6px}
  .bd-chip{font-size:11px;font-weight:700;padding:2px 8px;border-radius:6px;color:#a78bfa;border:1px solid #3a2f66}
  .bd-pin{font-size:11px;font-weight:700;padding:2px 8px;border-radius:6px;color:#fff;background:#7c5cff}
  .bd-t{font-size:16px;font-weight:600;overflow-wrap:anywhere}
  .bd-m{font-size:13px;color:#8a85a3;margin-top:6px}
  .bd-empty{text-align:center;color:#8a85a3;padding:48px 0}
  .bd-more{display:block;width:100%;margin-top:14px;padding:12px;font-size:14px;color:#8a85a3;background:none;border:1px solid #2a2540;border-radius:10px}
  #b-detail h2{font-size:21px;margin:14px 0 8px;overflow-wrap:anywhere}
  .bd-meta{font-size:13px;color:#8a85a3;margin-bottom:20px}
  .bd-body{white-space:pre-wrap;overflow-wrap:anywhere;line-height:1.75;font-size:16px}
  .bd-msg{min-height:20px;margin:12px 0 0;font-size:14px;color:#ff6b81}
  .adm{color:#ff5a6e;font-weight:700}
  .badge{margin-left:5px;padding:1px 6px;font-size:10px;font-weight:700;color:#fff;background:#d6334a;border-radius:6px;vertical-align:1px}`;

  const h = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  function init(o) {
    const k = KINDS[o.kind], sb = o.sb, root = o.root, adminIds = o.adminIds || new Set();
    if (!document.getElementById("bd-css")) { const s = document.createElement("style"); s.id = "bd-css"; s.textContent = CSS; document.head.appendChild(s); }
    const opts = k.boards.map(b => '<option value="' + b[0] + '">' + b[1] + "</option>").join("");
    root.innerHTML = `
    <div class="bd">
      <div id="b-list">
        <div class="bd-bar"><h2>${k.title}</h2><button class="bd-primary bd-hide" id="b-write">글쓰기</button></div>
        <div class="bd-filter"><select id="b-sel" aria-label="게시판 선택"><option value="">전체</option>${opts}</select></div>
        <div id="b-items"></div>
        <button class="bd-more bd-hide" id="b-more">더 보기</button>
      </div>
      <div id="b-form" class="bd-hide">
        <div class="bd-bar"><h2 id="b-fh"></h2></div>
        <form id="b-f">
          <select id="f-board" aria-label="게시판">${opts}</select>
          <input id="f-title" placeholder="제목" maxlength="100" required>
          <textarea id="f-content" placeholder="내용" maxlength="5000" required></textarea>
          ${k.pinned ? '<label class="bd-chk"><input type="checkbox" id="f-pin"> 목록 맨 위에 고정</label>' : ""}
          <div class="bd-row"><button type="button" class="bd-ghost" id="f-cancel">취소</button><button type="submit" class="bd-primary" id="f-btn">저장</button></div>
        </form>
        <p class="bd-msg" id="f-msg" role="alert"></p>
      </div>
      <div id="b-detail" class="bd-hide">
        <button class="bd-ghost" id="d-back">← 목록</button>
        <h2 id="d-title"></h2><div class="bd-meta" id="d-meta"></div><div class="bd-body" id="d-body"></div>
        <div class="bd-row bd-hide" id="d-actions"><button class="bd-ghost" id="d-edit">수정</button><button class="bd-ghost bd-danger" id="d-del">삭제</button></div>
      </div>
    </div>`;

    const $ = (s) => root.querySelector(s);
    const PAGE = 30;
    let page = 0, filter = "", cur = null, editing = null;
    const label = (v) => (k.boards.find(b => b[0] === v) || ["", v])[1];
    const fmt = (s) => new Date(s).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
    const view = (n) => ["list", "form", "detail"].forEach(v => $("#b-" + v).classList.toggle("bd-hide", v !== n));
    const setUrl = () => history.replaceState(null, "", location.pathname + (filter ? "?board=" + filter : ""));
    const canWrite = !k.adminOnly || o.isAdmin;
    const nameEl = (nick, id) => {
      const w = h("span"), s = h("span", null, nick); w.appendChild(s);
      if (adminIds.has(id)) { s.className = "adm"; w.appendChild(h("span", "badge", "관리자")); }
      return w;
    };

    $("#b-write").classList.toggle("bd-hide", !canWrite);
    const params = new URLSearchParams(location.search);
    if (k.boards.some(b => b[0] === params.get("board"))) filter = params.get("board");
    $("#b-sel").value = filter;

    /* ----- 목록 ----- */
    const note = (t) => $("#b-items").appendChild(h("div", "bd-empty", t));
    async function load(reset) {
      if (reset) { page = 0; $("#b-items").replaceChildren(); $("#b-more").classList.add("bd-hide"); }
      const cols = k.table === "posts" ? "id,title,board,created_at,author_id,profiles(nickname)" : "id,title,board,pinned,created_at";
      let q = sb.from(k.table).select(cols);
      if (filter) q = q.eq("board", filter);
      if (k.pinned) q = q.order("pinned", { ascending: false });
      q = q.order("created_at", { ascending: false }).range(page * PAGE, page * PAGE + PAGE - 1);
      const { data, error } = await q;
      if (error) return note("불러오지 못했어요: " + error.message);
      if (!data.length && page === 0) note("등록된 글이 없어요.");
      data.forEach(p => {
        const b = h("button", "bd-item"), top = h("div", "bd-top");
        if (p.pinned) top.appendChild(h("span", "bd-pin", "고정"));
        top.appendChild(h("span", "bd-chip", label(p.board)));
        const m = h("div", "bd-m");
        if (k.table === "posts") m.append(nameEl(p.profiles ? p.profiles.nickname : "탈퇴한 회원", p.author_id), " · " + fmt(p.created_at));
        else m.textContent = fmt(p.created_at);
        b.append(top, h("div", "bd-t", p.title), m); b.onclick = () => openDetail(p.id);
        $("#b-items").appendChild(b);
      });
      $("#b-more").classList.toggle("bd-hide", data.length < PAGE);
    }
    $("#b-sel").onchange = () => { filter = $("#b-sel").value; setUrl(); load(true); };
    $("#b-more").onclick = () => { page++; load(false); };

    /* ----- 글 보기 ----- */
    async function openDetail(id) {
      const cols = k.table === "posts" ? "id,title,content,board,created_at,author_id,profiles(nickname)" : "id,title,content,board,pinned,created_at,updated_at";
      const { data, error } = await sb.from(k.table).select(cols).eq("id", id).single();
      if (error) { alert("글을 불러오지 못했어요."); view("list"); return; }
      cur = data;
      $("#d-title").textContent = data.title;
      const meta = $("#d-meta"); meta.replaceChildren(label(data.board) + " · ");
      if (k.table === "posts") meta.append(nameEl(data.profiles ? data.profiles.nickname : "탈퇴한 회원", data.author_id), " · " + fmt(data.created_at));
      else meta.append(fmt(data.created_at) + (data.updated_at && data.updated_at.slice(0, 10) !== data.created_at.slice(0, 10) ? " (수정 " + fmt(data.updated_at) + ")" : ""));
      $("#d-body").textContent = data.content;
      const mine = k.table === "posts" && data.author_id === o.user.id;
      $("#d-actions").classList.toggle("bd-hide", !(o.isAdmin || mine));
      $("#d-edit").classList.toggle("bd-hide", !k.adminOnly);
      view("detail"); window.scrollTo(0, 0);
    }
    $("#d-back").onclick = () => { setUrl(); view("list"); };
    $("#d-del").onclick = async () => {
      if (!confirm("이 글을 삭제할까요?")) return;
      const { data, error } = await sb.from(k.table).delete().eq("id", cur.id).select("id");
      if (error || !data || !data.length) { alert("삭제하지 못했어요."); return; }
      setUrl(); view("list"); load(true);
    };

    /* ----- 글쓰기·수정 ----- */
    function openForm(n) {
      editing = n ? n.id : null;
      $("#b-fh").textContent = n ? "수정" : "글쓰기";
      $("#f-board").value = n ? n.board : (filter || k.boards[0][0]);
      $("#f-title").value = n ? n.title : ""; $("#f-content").value = n ? n.content : "";
      if (k.pinned) $("#f-pin").checked = n ? n.pinned : false;
      $("#f-msg").textContent = ""; view("form"); window.scrollTo(0, 0);
    }
    $("#b-write").onclick = () => openForm(null);
    $("#d-edit").onclick = () => openForm(cur);
    $("#f-cancel").onclick = () => { if (editing) openDetail(editing); else view("list"); };
    $("#b-f").addEventListener("submit", async (e) => {
      e.preventDefault();
      const row = { board: $("#f-board").value, title: $("#f-title").value.trim(), content: $("#f-content").value.trim() };
      if (k.pinned) row.pinned = $("#f-pin").checked;
      if (!row.title || !row.content) { $("#f-msg").textContent = "제목과 내용을 입력해 주세요."; return; }
      $("#f-btn").disabled = true;
      const r = editing ? await sb.from(k.table).update(Object.assign({ updated_at: new Date().toISOString() }, row)).eq("id", editing)
                        : await sb.from(k.table).insert(row);
      $("#f-btn").disabled = false;
      if (r.error) { $("#f-msg").textContent = (r.error.message || "").includes("row-level security") ? "권한이 없거나 이용이 제한된 계정이에요." : "저장하지 못했어요: " + r.error.message; return; }
      filter = row.board; $("#b-sel").value = filter; setUrl(); view("list"); load(true);
    });

    /* ----- 시작 ----- */
    load(true);
    const id = params.get("id");
    if (id && /^\d+$/.test(id)) openDetail(id);
  }

  window.Board = { init };
})();
