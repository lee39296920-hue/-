import { useState, useEffect, useCallback, useRef } from "react";

const SUPABASE_URL = "https://wiuwuacfpqmhjyzqekzl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpdXd1YWNmcHFtaGp5enFla3psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzNDEzMjAsImV4cCI6MjA4OTkxNzMyMH0.oTRdx_TmTa3EyyyNbqu_lY0seTM2tHsk_rhLY_yPH6Q";

const api = async (table, method = "GET", body = null, filter = "") => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${filter}`, {
    method,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": method === "POST" ? "return=representation" : "return=minimal",
    },
    body: body ? JSON.stringify(body) : null,
  });
  if (method === "GET") return res.json();
  return res.ok;
};

function getToday() {
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return `${kst.getUTCFullYear()}-${String(kst.getUTCMonth()+1).padStart(2,"0")}-${String(kst.getUTCDate()).padStart(2,"0")}`;
}
function getTodayLabel() { return new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" }); }
function getCurrentSession() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes() < 14 * 60 ? "morning" : "afternoon";
}

const DRUG_LIST = ["에보프림연질캅셀","무코스타정","라시도필캡슐","마이칼큐정","디카맥스디정","고덱스캡슐","우루사정100mg","인데놀정10MG","대화산화마그네슘정","아로나민씨플러스정","씨잘정5mg","소론도정","리보트릴정","오르필시럽","보령바이오아스트릭스캡슐100mg","옥시크로린정200mg","투리온정10MG","조인스정200mg","뉴히알유니점안액0.15%","아스피린프로텍트정100MG","종근당글리아티린연질캡슐","씨잘액","바이오탑하이포르테캡슐","루파핀정","동아가스터정20mg","애드민포르테정","헤르벤서방정90mg","칼디쓰리정","파라마셋세미정","중외시그마트정5mg","뉴트레부틴서방정","마그네스정","명문아트로다캡슐","플라빅스정75mg","신일폴산정","리바로정2mg","플라비톨정","알레그라정180mg","조피린장용정","에이프레쉬점안액","뮤테란캡슐200밀리그램","오마코연질캡슐","케이캡정50mg","가스모틴정5mg","큐알론점안액0.18%","바스티난엠알서방정","엔테론정150mg","메치론정4mg","한국유나이티드메토트렉세이트정","마이렙트정500mg","메치론정1mg","프리그렐정","오메드정10mg","트리티코정25mg","알프람정0.25MG","환인탄산리튬정 300mg","코솝에스점안액","모티리톤정","글리아타민연질캡슐","싱귤레어정10mg","리피토정10밀리그램","타이레놀8시간이알서방정","쎄레브렉스캡슐200밀리그램","스토가정10mg","자낙스정0.25밀리그램","레리진정5밀리그램","베타미가서방정50mg","울트라셋이알세미서방정","이모튼캡슐","케이캡정25mg","파마탄산칼슘정 500mg","씬지로이드정0.1mg","카발린캡슐25mg","대웅라베프라졸정10밀리그램","딜라트렌정3.125MG","다이아벡스엑스알서방정500mg","벤포렉스캡슐","카발린캡슐50mg","렉사프로정10mg","광동타목시펜정20mg","자디텐시럽","펜넬캡슐","씬지로이드정0.05mg","트리렙탈현탁액6%","크레스토정10mg","동아오팔몬정","메디아벤엘정","타크로벨캡슐1mg","아토르바정10mg","렉사프로정5mg","멜로덱스캡슐7.5밀리그램","아티반정0.5MG","리바로젯정2/10mg","아빌리파이정2밀리그램","다이아벡스엑스알서방정1000mg","아로베스트정","리리카캡슐75밀리그램","노바스크정5밀리그람","아빌리파이정1밀리그램","훼로바-유서방정","비스칸엔캡슐","레일라디에스정","프로그랍캅셀1mg","프로맥정","듀락칸시럽","하루날디정0.2mg","세콕시아캡슐200mg","레나메진캡슐","리피로우정10mg","디쿠아스-에스점안액3%","아달라트오로스정30","명도파정25/100밀리그램","라톤서방정2mg","씨앤유캡슐","기넥신에프정80mg","본키연질캡슐","딜라트렌정6.25MG","에스몰핀정","엘도스캡슐","씬지로이드정0.075mg","페브릭정40mg","보령에바스텔정","라믹탈정100mg","글루코파지정500mg","리피토플러스정10/10mg","란스톤엘에프디티정15mg","스티렌투엑스정","타스나정","아티반정1MG","카세핀정25mg","클리마토플란정","사이폴-엔연질캡슐50밀리그램","피레스파정200mg","파라마셋정","아토바미브정10/5밀리그램","알레그라정120mg","아빌리파이정5밀리그램","딜라트렌정12.5MG","자낙스정0.5밀리그램","글루코파지엑스알1000mg서방정","인데놀정40MG","포리부틴정","자나팜정0.125밀리그램","자디앙정10mg","데파킨크로노정300mg","아마릴정2mg","우루사정300mg","코자정50mg","퍼킨정25-100mg","듀록정300mg","디카맥스1000정","동아가바펜틴캡슐100mg","안플라그정100mg","코대원포르테시럽","트라젠타정","액시드캡슐150밀리그람","클로자릴정100밀리그램","아리셉트정10mg","우루사정200mg","아세리손정","트라펜세미서방정","하이네콜정","트리돌캡슐","다파엔정10밀리그램","프로스카정","씬지록신정88mcg","케이콘틴서방정","필로겐정","에소메졸캡슐20mg","자큐보정20밀리그램","레나라정","트리티코정50mg","글루파엑스알서방정850mg","이무테라정","펠루비서방정","레일라정","펙수클루정40mg","세파메칠정","마이폴캡슐","레가론캡슐140","아리셉트정5mg","울트라셋이알서방정","콩코르정2.5mg","폭세틴캡슐20mg","리바로젯정4/10mg","옥시크로린정100mg","치옥타시드에이취알정600mg","베니톨정","프로이머정","판토록정20mg","미카르디스정40mg","한미오메가연질캡슐","아토스타젯정10/10mg","라식스정","씨투스정50MG","브로낙점안액","메티마졸정","리피토정20밀리그램","딜라트렌에스알캡슐8mg","콜킨정","트루패스구강붕해정8mg","알닥톤필름코팅정25mg","글립타이드정200mg","이지트롤정","탬보코정","아나프록스정","딜라트렌에스알캡슐16mg","카발린캡슐75mg","쿠에타핀정12.5mg","데파스정0.5mg","드록틴캡슐30MG","글루코파지정250mg","멀티블루에프정","셀셉트캡슐250mg","노르믹스정","베믈리디정","비모보정500/20밀리그램","마이렙트캡슐250mg","카이닉스3점안액","로디엔정2.5mg","로포타현탁액","데파킨크로노정500mg","아빌리파이정10밀리그램","로수젯정10/5밀리그램","로수젯정10/20밀리그램","릭시아나정30mg","콩브럭정1.25mg","클라낙CR정","아토젯정10/10밀리그램","노바스크정2.5밀리그램","아보다트연질캡슐0.5mg","리바로정4mg","스틸녹스정10mg","에빅사정10mg","콜린세레이트정","로수젯정10/10밀리그램","씬지록신정125mcg","몬테리진캡슐","넥시움정20mg","트윈스타정40/5mg","키마라정10mg","셀벡스캡슐","쎄레브렉스캡슐100밀리그램","종근당리마틸정","직듀오서방정10/1000밀리그램","애니코프캡슐300mg","사이폴-엔연질캡슐100mg","비바코정10mg","원알파정","브리딘플러스점안액","라믹탈정50mg","에리우스정","엔테론정50mg","로리딘정","미노씬캡슐50MG","제미글로정50밀리그램","타나민정80mg","모노로바정5밀리그램","듀락칸이지시럽","코스카정25mg","듀오락스정","딜리드정2밀리그램","알프람정0.4mg","자이로릭정","졸로푸트정100밀리그램","아리미덱스정","메코민캅셀500MCG","레보투스정","메디락디에스장용캅셀","리퀴시아정5밀리그램","기넥신에프정240mg","에어탈정","아타칸정8mg","에제페노정","렉사프로정20mg","졸로푸트정50밀리그람","동아가바펜틴캡슐300mg","오코돈정5mg","리피딜슈프라정","크레젯정10/10mg","자렐토정15mg","엘리퀴스정2.5mg","엘리퀴스정5mg","브릴린타정60mg","브릴린타정90mg","자렐토정20mg","자렐토정10mg","릭시아나정60mg","릭시아나정15mg","프리그렐정","두드리진시럽","볼리브리스정5밀리그램","몬테리진캡슐","몬테리진츄정"];

function findSimilarDrugs(transcript, limit = 3) {
  const t = transcript.replace(/\s/g, "").toLowerCase();
  const scored = DRUG_LIST.map(drug => {
    const d = drug.replace(/\s/g, "").toLowerCase();
    if (d.includes(t) || t.includes(d.slice(0, 3))) return { drug, score: 3 };
    if (d.startsWith(t.slice(0, 2))) return { drug, score: 2 };
    let common = 0;
    for (const ch of t) { if (d.includes(ch)) common++; }
    return { drug, score: common / Math.max(t.length, 1) };
  });
  return scored.filter(s => s.score > 0.3).sort((a, b) => b.score - a.score).slice(0, limit).map(s => s.drug);
}

const SESSION_LABEL  = { morning: "오전 주문", afternoon: "오후 주문" };
const SESSION_ICON   = { morning: "☀️", afternoon: "🌙" };
const SESSION_COLOR  = { morning: "#f59e0b", afternoon: "#6366f1" };
const STOCK_PRESETS  = ["1개 남음", "2개 남음", "3개 남음", "거의 소진", "재고 없음"];
const CATEGORY_COLOR = { handover: "#2563eb", notice: "#7c3aed", message: "#059669" };
const CATEGORY_BG    = { handover: "#eff6ff", notice: "#f5f3ff", message: "#f0fdf4" };

const iStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 10,
  border: "1.5px solid #e2e8f0", fontSize: 14, color: "#1e293b",
  background: "#f8fafc", outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};

function isStockNote(val) { return val && isNaN(Number(val)); }

function QtyBadge({ value, done, mode }) {
  if (!value) return null;
  const stock = mode === "stock" || (mode !== "qty" && isStockNote(value));
  const stockLabel = isNaN(Number(value)) ? value : value + "개 남음";
  if (done) return <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>{stock ? stockLabel : "수량 : " + value}</span>;
  if (stock) return (
    <span style={{ fontSize: 12, fontWeight: 700, borderRadius: 6, padding: "3px 8px",
      background: "#fef2f2", color: "#dc2626", border: "1.5px solid #fca5a5",
      display: "inline-flex", alignItems: "center", gap: 3 }}>
      📦 {stockLabel}
    </span>
  );
  return (
    <span style={{ fontSize: 12, fontWeight: 700, borderRadius: 6, padding: "3px 8px",
      background: "#2563eb", color: "#fff", display: "inline-flex", alignItems: "center", gap: 3 }}>
      🛒 {value}개 주문 필요
    </span>
  );
}

function SessionSection({ session, items, onToggle, onDelete, onCheckAll, onEdit, sortOrder }) {
  const sorted = [...items].sort((a, b) => {
    if (b.soldout !== a.soldout) return (b.soldout ? 1 : 0) - (a.soldout ? 1 : 0);
    if (sortOrder === "alpha") {
      if (b.urgent !== a.urgent) return (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0);
      return a.drug_name.localeCompare(b.drug_name, "ko");
    }
    if (b.urgent !== a.urgent) return (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0);
    return a.id - b.id;
  });
  const doneCount = items.filter(i => i.done).length;
  const allDone   = doneCount === items.length;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>{SESSION_ICON[session]} {SESSION_LABEL[session]}</span>
        <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 20, padding: "2px 9px",
          background: allDone ? "#d1fae5" : "#f1f5f9", color: allDone ? "#059669" : "#64748b" }}>
          {allDone ? "완료" : doneCount + "/" + items.length}
        </span>
      </div>
      <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden",
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)", borderTop: "3px solid " + SESSION_COLOR[session] }}>
        {sorted.map((item, idx) => (
          <div key={item.id} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "13px 14px",
            borderBottom: idx < sorted.length - 1 ? "1px solid #f1f5f9" : "none",
            borderLeft: item.urgent && !item.done ? "4px solid #f59e0b" : item.soldout ? "4px solid #94a3b8" : "4px solid transparent",
            background: item.soldout ? "#f8fafc" : item.urgent ? (item.done ? "#fefce8" : "#fff7ed") : "transparent",
          }}>
            <input type="checkbox" checked={item.done} onChange={() => onToggle(item.id, item.done)}
              style={{ width: 20, height: 20, accentColor: "#2563eb", cursor: "pointer", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {(item.urgent && !item.done && !item.soldout || item.soldout) && (
                <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
                  {item.urgent && !item.done && !item.soldout && (
                    <span style={{ fontSize: 11, fontWeight: 800, borderRadius: 6, padding: "2px 8px",
                      background: "#f59e0b", color: "#fff", display: "inline-flex", alignItems: "center", gap: 3 }}>🚨 긴급</span>
                  )}
                  {item.soldout && (
                    <span style={{ fontSize: 11, fontWeight: 800, borderRadius: 6, padding: "2px 8px",
                      background: "#64748b", color: "#fff", display: "inline-flex", alignItems: "center", gap: 3 }}>🚫 품절주문불가</span>
                  )}
                </div>
              )}
              <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4,
                color: item.soldout ? "#94a3b8" : item.done ? "#94a3b8" : (item.urgent ? "#92400e" : "#0f172a"),
                textDecoration: item.done ? "line-through" : "none" }}>
                {item.drug_name}
                {item.pack_type === "ptp" && (
                  <span style={{ fontSize: 13, fontWeight: 700, borderRadius: 6, padding: "2px 7px",
                    background: "#eff6ff", color: "#2563eb", marginLeft: 6, verticalAlign: "middle",
                    display: "inline-block", whiteSpace: "nowrap" }}>PTP</span>
                )}
                {item.pack_type === "bottle" && (
                  <span style={{ fontSize: 13, fontWeight: 700, borderRadius: 6, padding: "2px 7px",
                    background: "#eff6ff", color: "#2563eb", marginLeft: 6, verticalAlign: "middle",
                    display: "inline-block", whiteSpace: "nowrap" }}>
                    {item.bottle_size ? item.bottle_size + " 병" : "병"}
                  </span>
                )}
              </div>
              <div style={{ marginTop: 4 }}>
                <QtyBadge value={item.quantity} done={item.done} mode={item.qty_mode} />
              </div>
            </div>
            <button onClick={() => onEdit(item)} className="btn"
              style={{ padding: "4px 8px", borderRadius: 7, background: "#eff6ff", color: "#2563eb",
                fontSize: 11, fontWeight: 700, border: "none", flexShrink: 0 }}>수정</button>
            <button onClick={() => onDelete(item.id)} className="btn"
              style={{ padding: "4px 8px", borderRadius: 7, background: "#fef2f2", color: "#ef4444",
                fontSize: 11, fontWeight: 700, border: "none", flexShrink: 0 }}>삭제</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ===================== 거래명세서 스캐너 컴포넌트 =====================
function InvoiceScanner() {
  const [geminiKey, setGeminiKey]       = useState(() => localStorage.getItem("gemini_key") || "");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [queue, setQueue]               = useState([]);
  const [results, setResults]           = useState([]);
  const [isRunning, setIsRunning]       = useState(false);
  const [progress, setProgress]         = useState({ done: 0, total: 0 });
  const [toast, setToast]               = useState(null);
  const [loadingDB, setLoadingDB]       = useState(true);
  const [previewImg, setPreviewImg]     = useState(null);
  const [editingItem, setEditingItem]   = useState(null); // {invoiceId, idx, field, value}
  const [filterDate, setFilterDate]     = useState(getToday());
  const idRef                           = useRef(0);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };
  const saveKey = (key) => { setGeminiKey(key); localStorage.setItem("gemini_key", key); };
  const keyValid = geminiKey.startsWith("AIza") && geminiKey.length > 20;

  // Supabase에서 저장된 결과 불러오기
  useEffect(() => {
    const load = async () => {
      try {
        const inv = await api("invoices", "GET", null, "?order=created_at.desc&limit=100");
        if (!Array.isArray(inv) || inv.length === 0) { setLoadingDB(false); return; }
        const loaded = [];
        for (const r of inv) {
          const items = await api("invoice_items", "GET", null, `?invoice_id=eq.${r.id}`);
          const uploadDate = r.created_at 
            ? new Date(new Date(r.created_at).getTime() + 9*60*60*1000).toISOString().slice(0,10)
            : getToday();
          loaded.push({ id: r.id, fileName: r.file_name, supplier: r.supplier, date: r.date, uploadDate, total: r.total, items: Array.isArray(items) ? items : [] });
        }
        setResults(loaded);
      } catch(e) {}
      setLoadingDB(false);
    };
    load();
  }, []);

  // Supabase에 저장
  const saveToDB = async (result, fileName) => {
    try {
      const invRes = await fetch(`${SUPABASE_URL}/rest/v1/invoices`, {
        method: "POST",
        headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", "Prefer": "return=representation" },
        body: JSON.stringify({ supplier: result.supplier, date: result.date, total: result.total || 0, file_name: fileName })
      });
      const invData = await invRes.json();
      const invoiceId = invData[0]?.id;
      if (!invoiceId) return null;
      const itemsToInsert = (result.items || []).map(i => ({
        invoice_id: invoiceId, name: i.name || "", maker: i.maker || "", spec: i.spec || "",
        quantity: Number(i.quantity) || 0, unit_price: Number(i.unit_price) || 0, amount: Number(i.amount) || 0,
        insurance_code: i.insurance_code || "", lot: i.lot || "", expiry: i.expiry || ""
      }));
      if (itemsToInsert.length > 0) {
        await api("invoice_items", "POST", itemsToInsert);
      }
      return invoiceId;
    } catch(e) { return null; }
  };

  const deleteResult = async (id) => {
    await api("invoice_items", "DELETE", null, `?invoice_id=eq.${id}`);
    await api("invoices", "DELETE", null, `?id=eq.${id}`);
    setResults(prev => prev.filter(r => r.id !== id));
    showToast("삭제됐습니다");
  };

  const updateItem = async (invoiceId, itemIdx, editedData) => {
    setResults(prev => prev.map(r => {
      if (r.id !== invoiceId) return r;
      const newItems = [...(r.items||[])];
      newItems[itemIdx] = { ...newItems[itemIdx], ...editedData };
      return { ...r, items: newItems };
    }));
    setEditingItem(null);
    const result = results.find(r => r.id === invoiceId);
    if (result?.items?.[itemIdx]?.id) {
      await api("invoice_items", "PATCH", editedData, `?id=eq.${result.items[itemIdx].id}`);
    }
    showToast("수정됐습니다 ✓");
  };

  const handleFiles = async (files) => {
    const newItems = [];
    for (const file of files) {
      const thumb = await fileToDataURL(file);
      newItems.push({ id: ++idRef.current, file, thumb, name: file.name, status: "wait", data: null });
    }
    setQueue(prev => [...prev, ...newItems]);
  };

  const removeItem = (id) => setQueue(prev => prev.filter(q => q.id !== id));

  const startAll = async () => {
    if (!keyValid) { showToast("Gemini API 키를 먼저 설정해주세요"); setShowKeyInput(true); return; }
    const waitItems = queue.filter(q => q.status === "wait");
    if (!waitItems.length) return;
    setIsRunning(true);
    setProgress({ done: 0, total: waitItems.length });
    for (let i = 0; i < waitItems.length; i++) {
      const item = waitItems[i];
      setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: "processing" } : q));
      try {
        const base64 = item.thumb.split(",")[1];
        const result = await callGemini(geminiKey, base64, item.file.type || "image/jpeg");
        const dbId = await saveToDB(result, item.name);
        const savedResult = { 
          id: dbId || item.id, 
          fileName: item.name, 
          thumb: item.thumb, 
          ...result,
          date: result.date || getToday(),
          uploadDate: getToday()
        };
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: "done", data: result } : q));
        setResults(prev => [savedResult, ...prev]);
      } catch (e) {
        setQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: "error", errorMsg: e.message } : q));
      }
      setProgress({ done: i + 1, total: waitItems.length });
      if (i < waitItems.length - 1) await sleep(5000);
    }
    setIsRunning(false);
  };

  const callGemini = async (apiKey, base64, mimeType, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await callGeminiOnce(apiKey, base64, mimeType);
      } catch (e) {
        if (attempt === retries) throw e;
        await sleep(5000 * attempt); // 5초, 10초, 15초
      }
    }
  };

  const callGeminiOnce = async (apiKey, base64, mimeType) => {
    const prompt = `이 이미지는 한국 약국의 의약품 거래명세서입니다.
아래 JSON 형식으로만 응답하세요. 마크다운 없이 JSON만 출력하세요.

{
  "supplier": "도매상 상호명",
  "date": "거래일자 YYYY-MM-DD",
  "total": 합계금액숫자,
  "items": [
    {
      "name": "약품명",
      "maker": "제조사명",
      "spec": "규격",
      "quantity": 수량숫자,
      "unit_price": 단가숫자,
      "amount": 금액숫자,
      "insurance_code": "보험코드",
      "lot": "제조번호",
      "expiry": "유효기한 YYYYMMDD"
    }
  ]
}

[도매상 상호명 추출 - 매우 중요]:
명세서 공급자 칸에서 "상호" 옆에 적힌 글자를 정확히 읽으세요. 절대 추측하지 마세요.
- 지점명(서울지점, 영등포지점 등) 제외하고 본사명만
- 주소, 지역명, 구청명 절대 금지
- 보이는 상호명 그대로: 복산나이스→"복산나이스", 지오영→"지오영", 신덕팜→"신덕팜", 백제약품→"백제약품", 케이에스팜→"KS팜"

[약품명 추출 - 매우 중요]:
- 품명 컬럼에서만 약품명을 읽으세요
- 약품명 아래 작은 글씨(유효기간, 제조번호)는 약품명이 아닙니다
- 행 앞의 번호(1,2,3...)나 코드번호는 제외하고 약품명만 추출
- 실제 한국 의약품명 예시: 케이캡정50mg, 프리그렐정75mg, 아빌리파이정5mg, 자디앙정10mg, 두드리진시럽, 자렐토정20mg, 크레스토정10mg, 넥시움정20mg, 아모잘탄정5/50mg, 디쿠아스에스점안액3%
- 글자 혼동 주의: 넥↔벽, 시↔씨, 레↔데, 젯↔셋, 로↔보, 캡↔갭, 틴↔팀, 푸↔트
- 졸로푸트(sertraline)를 졸로트렉으로 혼동하지 마세요

[보험코드]:
- 반드시 9자리 숫자 (예: 643304110, 050100020, 641105700)
- 지오영 명세서는 왼쪽 코드 컬럼에 "행번호+코드번호" 형태로 표기됩니다
  예: "1 641105700" → 행번호 1 제외, 보험코드는 641105700
  예: "2 073400310" → 행번호 2 제외, 보험코드는 073400310
- 10자리 이상이면 앞의 행번호(1~12)를 제거하고 9자리만 사용하세요
- 없으면 빈 문자열

[제조번호/유효기한 구분]:
- 제조번호(lot)와 유효기한(expiry)은 다른 항목입니다
- 지오영 명세서는 "사용기한" 컬럼만 있고 제조번호 컬럼이 없습니다 → lot: "", expiry: 사용기한
- 다른 도매상은 제조번호와 유효기한이 별도 컬럼으로 있습니다
- 유효기한/사용기한은 expiry에, 제조번호(영문+숫자 혼합, 예: WE1748, DPFD012)는 lot에 넣으세요

[기타]:
- 수량은 손글씨 동그라미 숫자 (①②③ 형태)
- 금액은 쉼표 없는 순수 숫자
- 빈 줄 무시, 실제 약품 행만 추출, 표 행 수 제한 없이 모든 약품 추출`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64 } }] }],
          generationConfig: { temperature: 0.05, maxOutputTokens: 16000 }
        })
      }
    );
    if (!res.ok) { const e = await res.json(); throw new Error(e.error?.message || "API 오류"); }
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    // 보험코드 후처리: 행번호 붙어서 10~11자리면 앞자리 제거해 9자리로
    if (parsed.items) {
      parsed.items = parsed.items.map(item => {
        if (item.insurance_code) {
          const code = String(item.insurance_code).replace(/ /g, "").replace(/[^0-9]/g, "");
          if (code.length === 10) item.insurance_code = code.slice(1);
          else if (code.length === 11) item.insurance_code = code.slice(2);
          else item.insurance_code = code;
        }
        return item;
      });
    }
    return parsed;
  };

  const fmtNum = (n) => n ? Number(n).toLocaleString() : "-";
  const fmtExpiry = (s) => s && s.length >= 8 ? s.slice(0,4)+"-"+s.slice(4,6)+"-"+s.slice(6,8) : (s || "-");

  const copyText = (text) => {
    navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = text; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
    });
    showToast("복사됨 ✓");
  };

  const copyResultTab = (r) => {
    const header = `[${r.supplier}] ${r.date} / 합계 ${fmtNum(r.total)}원\n약품명\t규격\t수량\t단가\t금액\t보험코드\t제조번호\t유효기한`;
    const rows = (r.items||[]).map(i => `${i.name}\t${i.spec||""}\t${i.quantity}\t${i.unit_price}\t${i.amount}\t${i.insurance_code||""}\t${i.lot||""}\t${i.expiry||""}`);
    copyText(header + "\n" + rows.join("\n"));
  };

  const copyAllTab = () => {
    if (!filteredResults.length) return;
    let out = "";
    filteredResults.forEach((r, i) => {
      if (i > 0) out += "\n\n";
      out += `[${r.supplier}] ${r.date} / 합계 ${fmtNum(r.total)}원\n약품명\t규격\t수량\t단가\t금액\t보험코드\t제조번호\t유효기한\n`;
      out += (r.items||[]).map(i => `${i.name}\t${i.spec||""}\t${i.quantity}\t${i.unit_price}\t${i.amount}\t${i.insurance_code||""}\t${i.lot||""}\t${i.expiry||""}`).join("\n");
    });
    copyText(out);
  };

  const waitingCount = queue.filter(q => q.status === "wait").length;
  const filteredResults = filterDate ? results.filter(r => (r.uploadDate || r.date) === filterDate) : results;

  return (
    <div>
      {/* 날짜 필터 */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", marginBottom: 12,
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 8 }}>
        <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
          style={{ ...iStyle, flex: 1 }} />
        <button onClick={() => setFilterDate("")} className="btn"
          style={{ padding: "8px 12px", borderRadius: 9, fontSize: 12, fontWeight: 700, flexShrink: 0,
            background: filterDate === "" ? "#1e3a5f" : "#f1f5f9",
            color: filterDate === "" ? "#fff" : "#64748b" }}>
          전체
        </button>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#1e3a5f", flexShrink: 0 }}>
          {filteredResults.length}건
        </div>
      </div>

      {/* API 키 설정 */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", marginBottom: 12,
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600, flexShrink: 0 }}>🔑 Gemini API</span>
        {showKeyInput ? (
          <>
            <input type="password" placeholder="AIza..." defaultValue={geminiKey}
              onChange={e => saveKey(e.target.value)} style={{ ...iStyle, flex: 1, fontSize: 12 }} />
            <button onClick={() => setShowKeyInput(false)} className="btn"
              style={{ padding: "6px 12px", borderRadius: 8, background: "#1e3a5f", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              저장
            </button>
          </>
        ) : (
          <>
            <span style={{ flex: 1, fontSize: 12, color: keyValid ? "#059669" : "#ef4444", fontWeight: 700 }}>
              {keyValid ? "✓ 설정됨" : "미설정"}
            </span>
            <button onClick={() => setShowKeyInput(true)} className="btn"
              style={{ padding: "6px 12px", borderRadius: 8, background: "#f1f5f9", color: "#475569", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              {keyValid ? "변경" : "설정"}
            </button>
          </>
        )}
      </div>

      {/* 업로드 영역 */}
      <div style={{ background: "#fff", borderRadius: 14, padding: "14px", marginBottom: 12,
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>📁 명세서 업로드</div>

        <label style={{ display: "block", border: "2px dashed #cbd5e1", borderRadius: 12, padding: "28px 16px",
          textAlign: "center", cursor: "pointer", background: "#f8fafc", transition: "all 0.2s" }}
          onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = "#2563eb"; e.currentTarget.style.background = "#eff6ff"; }}
          onDragLeave={e => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "#f8fafc"; }}
          onDrop={async e => {
            e.preventDefault();
            e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.background = "#f8fafc";
            const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
            if (files.length) await handleFiles(files);
          }}>
          <input type="file" accept="image/*" multiple style={{ display: "none" }}
            onChange={async e => { if (e.target.files?.length) { await handleFiles(Array.from(e.target.files)); e.target.value = ""; } }} />
          <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#334155", marginBottom: 4 }}>명세서 사진을 올려주세요</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>여러 장 한번에 선택 가능 · JPG, PNG, HEIC</div>
        </label>

        {/* 대기열 */}
        {queue.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "#64748b", fontWeight: 600 }}>{queue.length}장 (대기 {waitingCount}장)</span>
              <button onClick={startAll} disabled={isRunning || waitingCount === 0} className="btn"
                style={{ padding: "8px 16px", borderRadius: 20, fontWeight: 700, fontSize: 13,
                  background: isRunning || waitingCount === 0 ? "#e2e8f0" : "#1e3a5f",
                  color: isRunning || waitingCount === 0 ? "#94a3b8" : "#fff" }}>
                {isRunning ? "⏳ 분석중..." : "🔍 전체 분석"}
              </button>
            </div>

            {isRunning && (
              <div style={{ marginBottom: 10 }}>
                <div style={{ background: "#e2e8f0", borderRadius: 10, height: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "#2563eb", borderRadius: 10,
                    width: progress.total > 0 ? `${(progress.done/progress.total)*100}%` : "0%",
                    transition: "width 0.4s ease" }} />
                </div>
                <div style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 4 }}>
                  {progress.done} / {progress.total}장 처리중...
                </div>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {queue.map(item => (
                <div key={item.id} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  borderRadius: 10, border: "1px solid",
                  borderColor: item.status === "done" ? "#b2dfdb" : item.status === "error" ? "#ffcdd2" : item.status === "processing" ? "#93c5fd" : "#e2e8f0",
                  background: item.status === "done" ? "#f0fdf4" : item.status === "error" ? "#fff5f5" : item.status === "processing" ? "#eff6ff" : "#f8fafc",
                }}>
                  <img src={item.thumb} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                      {item.data ? `${item.data.supplier} · ${item.data.date}` : item.status === "error" ? (item.errorMsg || "인식 실패") : "대기중"}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 20, flexShrink: 0,
                    background: item.status === "done" ? "#d1fae5" : item.status === "error" ? "#fee2e2" : item.status === "processing" ? "#dbeafe" : "#f1f5f9",
                    color: item.status === "done" ? "#059669" : item.status === "error" ? "#ef4444" : item.status === "processing" ? "#2563eb" : "#94a3b8" }}>
                    {item.status === "done" ? "✓ 완료" : item.status === "error" ? "오류" : item.status === "processing" ? "분석중" : "대기"}
                  </span>
                  {(item.status === "wait" || item.status === "error") && (
                    <button onClick={() => removeItem(item.id)} className="btn"
                      style={{ background: "none", border: "none", color: "#94a3b8", fontSize: 16, padding: "2px", flexShrink: 0 }}>✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 전체 복사 버튼 */}
      {filteredResults.length > 1 && (
        <div style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", marginBottom: 12,
          boxShadow: "0 1px 6px rgba(0,0,0,0.06)", display: "flex", gap: 8 }}>
          <button onClick={copyAllTab} className="btn"
            style={{ flex: 1, padding: "10px", borderRadius: 10, background: "#1e3a5f", color: "#fff",
              fontSize: 13, fontWeight: 700 }}>
            📋 전체 {filteredResults.length}건 일괄 복사
          </button>
        </div>
      )}

      {/* 결과 카드들 */}
      {filteredResults.length === 0 && queue.length === 0 && (
        <div style={{ textAlign: "center", padding: "52px 0", color: "#94a3b8" }}>
          <div style={{ fontSize: 44, marginBottom: 10 }}>📄</div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>명세서를 업로드하면 여기에 결과가 쌓입니다</div>
        </div>
      )}

      {filteredResults.map(r => (
        <div key={r.id} style={{ background: "#fff", borderRadius: 14, overflow: "hidden",
          boxShadow: "0 1px 6px rgba(0,0,0,0.06)", marginBottom: 12 }}>
          {/* 카드 헤더 */}
          <div style={{ background: "#1e3a5f", padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
              {r.thumb && (
                <img src={r.thumb} alt="명세서" onClick={() => setPreviewImg(r.thumb)}
                  style={{ width: 44, height: 44, borderRadius: 8, objectFit: "cover", flexShrink: 0,
                    border: "2px solid rgba(255,255,255,0.3)", cursor: "pointer" }} />
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{r.supplier || "도매상 미상"}</div>
                <div style={{ color: "#93c5fd", fontSize: 12, marginTop: 2 }}>{r.date}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <div style={{ color: "#e0f2fe", fontWeight: 700, fontSize: 14 }}>{fmtNum(r.total)}원</div>
              <button onClick={() => deleteResult(r.id)} className="btn"
                style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 8,
                  padding: "4px 8px", fontSize: 11, fontWeight: 700 }}>삭제</button>
            </div>
          </div>

          {/* 요약 */}
          <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9" }}>
            {[["품목 수", (r.items?.length||0)+"개"], ["합계금액", fmtNum(r.total)+"원"]].map(([label, val]) => (
              <div key={label} style={{ flex: 1, padding: "10px 14px", textAlign: "center", borderRight: "1px solid #f1f5f9" }}>
                <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1e3a5f", marginTop: 2 }}>{val}</div>
              </div>
            ))}
            <div style={{ flex: 1, padding: "10px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>파일</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.fileName}</div>
            </div>
          </div>

          {/* 표 형식 + 행 클릭시 수정 */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#f1f5f9" }}>
                  {["#","약품명","규격","수량","단가","금액","보험코드","제조번호","유효기한",""].map(h => (
                    <th key={h} style={{ padding: "7px 8px", textAlign: "left", fontSize: 10, fontWeight: 700,
                      color: "#64748b", borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(r.items||[]).map((item, idx) => (
                  editingItem?.invoiceId === r.id && editingItem?.idx === idx ? (
                    <tr key={idx} style={{ background: "#eff6ff" }}>
                      <td style={{ padding: "6px 8px", color: "#94a3b8", fontSize: 11 }}>{idx+1}</td>
                      {[["name",120],["spec",60],["quantity",40],["unit_price",70],["amount",70],["insurance_code",90],["lot",80],["expiry",80]].map(([field, w]) => (
                        <td key={field} style={{ padding: "4px 4px" }}>
                          <input
                            value={editingItem.data?.[field] ?? ""}
                            onChange={e => setEditingItem(prev => ({ ...prev, data: { ...prev.data, [field]: e.target.value } }))}
                            style={{ width: w, padding: "4px 6px", borderRadius: 6, border: "1.5px solid #2563eb",
                              fontSize: 12, fontFamily: "inherit", outline: "none", background: "#fff" }}
                          />
                        </td>
                      ))}
                      <td style={{ padding: "4px 8px", whiteSpace: "nowrap" }}>
                        <button onClick={() => updateItem(r.id, idx, editingItem.data || {})} className="btn"
                          style={{ padding: "4px 8px", borderRadius: 6, background: "#1e3a5f", color: "#fff", fontSize: 11, fontWeight: 700, marginRight: 4 }}>저장</button>
                        <button onClick={() => setEditingItem(null)} className="btn"
                          style={{ padding: "4px 8px", borderRadius: 6, background: "#f1f5f9", color: "#64748b", fontSize: 11, fontWeight: 700 }}>취소</button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fafbff"}
                      onMouseLeave={e => e.currentTarget.style.background = ""}>
                      <td style={{ padding: "7px 8px", color: "#94a3b8", fontSize: 11 }}>{idx+1}</td>
                      <td style={{ padding: "7px 8px", fontWeight: 600, color: "#1e293b", minWidth: 120 }}>
                        {item.name}
                        {item.maker && <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 400 }}>{item.maker}</div>}
                      </td>
                      <td style={{ padding: "7px 8px", color: "#64748b", whiteSpace: "nowrap" }}>{item.spec||"-"}</td>
                      <td style={{ padding: "7px 8px", fontWeight: 700, textAlign: "right" }}>{item.quantity??"-"}</td>
                      <td style={{ padding: "7px 8px", textAlign: "right", fontFamily: "monospace" }}>{fmtNum(item.unit_price)}</td>
                      <td style={{ padding: "7px 8px", textAlign: "right", fontWeight: 600, color: "#1e3a5f", fontFamily: "monospace" }}>{fmtNum(item.amount)}</td>
                      <td style={{ padding: "7px 8px", fontFamily: "monospace", fontSize: 11, color: "#64748b" }}>{item.insurance_code||"-"}</td>
                      <td style={{ padding: "7px 8px", fontFamily: "monospace", fontSize: 11, color: "#94a3b8" }}>{item.lot||"-"}</td>
                      <td style={{ padding: "7px 8px", fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>{fmtExpiry(item.expiry)}</td>
                      <td style={{ padding: "7px 8px" }}>
                        <button onClick={() => setEditingItem({ invoiceId: r.id, idx, data: { name: item.name||"", spec: item.spec||"", maker: item.maker||"", quantity: String(item.quantity||""), unit_price: String(item.unit_price||""), amount: String(item.amount||""), insurance_code: item.insurance_code||"", lot: item.lot||"", expiry: item.expiry||"" } })} className="btn"
                          style={{ padding: "3px 7px", borderRadius: 6, background: "#eff6ff", color: "#2563eb", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>수정</button>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>

          {/* 복사 버튼 */}
          <div style={{ padding: "10px 14px", background: "#f8fafc", borderTop: "1px solid #f1f5f9", display: "flex", gap: 8 }}>
            <button onClick={() => copyResultTab(r)} className="btn"
              style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1px solid #e2e8f0",
                background: "#fff", color: "#475569", fontSize: 12, fontWeight: 600 }}>
              📋 탭구분 복사
            </button>
            <button onClick={() => {
              const rows = (r.items||[]).map(i => `${i.name},${i.spec||""},${i.quantity},${i.unit_price},${i.amount},${i.insurance_code||""},${i.lot||""},${i.expiry||""}`);
              copyText(`약품명,규격,수량,단가,금액,보험코드,제조번호,유효기한\n${rows.join("\n")}`);
            }} className="btn"
              style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1px solid #e2e8f0",
                background: "#fff", color: "#475569", fontSize: 12, fontWeight: 600 }}>
              📊 CSV 복사
            </button>
          </div>
        </div>
      ))}

      {/* 원본 이미지 전체화면 모달 */}
      {previewImg && (
        <div onClick={() => setPreviewImg(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)",
          zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <img src={previewImg} alt="원본" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 12, objectFit: "contain" }} />
          <button onClick={() => setPreviewImg(null)} style={{ position: "absolute", top: 16, right: 16,
            background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", borderRadius: "50%",
            width: 36, height: 36, fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
      )}

      {/* 토스트 */}
      {toast && (
        <div style={{ position: "fixed", bottom: 26, left: "50%", transform: "translateX(-50%)",
          background: "#1e293b", color: "#fff", padding: "10px 22px", borderRadius: 30,
          fontSize: 13, fontWeight: 600, boxShadow: "0 4px 16px rgba(0,0,0,0.25)", zIndex: 300, whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function fileToDataURL(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 1600;
        let w = img.width, h = img.height;
        if (w > MAX || h > MAX) {
          if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
          else { w = Math.round(w * MAX / h); h = MAX; }
        }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        res(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = rej;
      img.src = e.target.result;
    };
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ===================== 메인 앱 =====================
export default function App() {
  const [orders, setOrders]               = useState([]);
  const [handovers, setHandovers]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filterDate, setFilterDate]       = useState(getToday());
  const [filterSession, setFilterSession] = useState(getCurrentSession());
  const [sortOrder, setSortOrder]         = useState("time");
  const [showUndone, setShowUndone]       = useState(false);
  const [addingSession, setAddingSession] = useState(null);
  const [editId, setEditId]               = useState(null);
  const [qtyMode, setQtyMode]             = useState("qty");
  const [drugName, setDrugName]           = useState("");
  const [quantity, setQuantity]           = useState("");
  const [isUrgent, setIsUrgent]           = useState(false);
  const [isSoldOut, setIsSoldOut]         = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast]                 = useState(null);
  const [activeTab, setActiveTab]         = useState("order");
  const [hoDate, setHoDate]               = useState(getToday());
  const [hoAuthor, setHoAuthor]           = useState("");
  const [hoCategory, setHoCategory]       = useState("handover");
  const [hoPriority, setHoPriority]       = useState("normal");
  const [hoContent, setHoContent]         = useState("");
  const [showHoForm, setShowHoForm]       = useState(false);
  const [editHoId, setEditHoId]           = useState(null);
  const [isListening, setIsListening]     = useState(false);
  const [packType, setPackType]           = useState("");
  const [bottleSize, setBottleSize]       = useState("");
  const [suggestions, setSuggestions]     = useState([]);
  const recognitionRef                    = useRef(null);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 1800); };

  const fetchAll = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [o, h] = await Promise.all([
        api("orders", "GET", null, "?order=created_date.desc"),
        api("handovers", "GET", null, "?order=created_date.desc"),
      ]);
      const orders = Array.isArray(o) ? o : [];
      const today = getToday();
      const currentSession = getCurrentSession();
      const toCarryOver = orders.filter(order => !order.done && (order.date !== today || order.session !== currentSession));
      if (toCarryOver.length > 0) {
        const timeStr = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
        await Promise.all(toCarryOver.map(order =>
          api("orders", "PATCH", { date: today, session: currentSession, created_at: timeStr }, `?id=eq.${order.id}`)
        ));
        const updated = await api("orders", "GET", null, "?order=created_date.desc");
        setOrders(Array.isArray(updated) ? updated : []);
      } else {
        setOrders(orders);
      }
      setHandovers(Array.isArray(h) ? h : []);
    } catch(e) { showToast("데이터 로딩 실패"); }
    if (!silent) setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => { const t = setInterval(() => fetchAll(true), 60000); return () => clearInterval(t); }, [fetchAll]);
  useEffect(() => { const t = setInterval(() => { setFilterDate(getToday()); setFilterSession(getCurrentSession()); }, 60000); return () => clearInterval(t); }, []);

  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { showToast("이 브라우저는 음성인식을 지원하지 않아요 (Chrome 권장)"); return; }
    if (isListening) { recognitionRef.current?.stop(); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR"; recognition.interimResults = false; recognition.maxAlternatives = 1;
    recognitionRef.current = recognition; setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      const match = transcript.match(/^(.+?)\s+(\d+)\s*개?$/);
      const spokenName = match ? match[1].trim() : transcript;
      const spokenQty = match ? match[2] : "";
      const similar = findSimilarDrugs(spokenName);
      if (similar.length > 0) { setSuggestions(similar); setDrugName(spokenName); if (spokenQty) setQuantity(spokenQty); showToast(`🎤 "${spokenName}" → 아래에서 선택해주세요`); }
      else { setDrugName(spokenName); if (spokenQty) setQuantity(spokenQty); showToast(`🎤 "${spokenName}"`); }
      setIsListening(false);
    };
    recognition.onerror = () => { showToast("음성인식 실패, 다시 시도해주세요"); setIsListening(false); };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }

  function openForm(session) {
    if (addingSession === session && !editId) { setAddingSession(null); return; }
    setEditId(null); setAddingSession(session); setQtyMode("qty");
    setDrugName(""); setQuantity(""); setIsUrgent(false); setIsSoldOut(false); setSuggestions([]); setPackType(""); setBottleSize("");
  }
  function openEdit(item) {
    setEditId(item.id); setAddingSession(item.session);
    setQtyMode(item.qty_mode || (isStockNote(item.quantity) ? "stock" : "qty"));
    setDrugName(item.drug_name); setQuantity(item.quantity);
    setIsUrgent(item.urgent || false); setIsSoldOut(item.soldout || false);
    setPackType(item.pack_type || ""); setBottleSize(item.bottle_size || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSave() {
    if (!drugName.trim() || !quantity.trim()) return;
    const timeStr = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    if (editId) {
      await api("orders", "PATCH", { drug_name: drugName.trim(), quantity: quantity.trim(), qty_mode: qtyMode, urgent: isUrgent, soldout: isSoldOut, pack_type: packType, bottle_size: bottleSize }, `?id=eq.${editId}`);
      showToast("수정되었습니다");
    } else {
      await api("orders", "POST", { id: Date.now(), date: filterDate, session: addingSession, drug_name: drugName.trim(), quantity: quantity.trim(), qty_mode: qtyMode, urgent: isUrgent, soldout: false, pack_type: packType, bottle_size: bottleSize, order_type: activeTab === "otc" ? "otc" : "rx", done: false, created_at: timeStr });
      showToast("주문이 등록되었습니다");
    }
    setDrugName(""); setQuantity(""); setAddingSession(null); setEditId(null); setIsUrgent(false); setIsSoldOut(false); setSuggestions([]); setPackType(""); setBottleSize("");
    fetchAll();
  }

  async function toggleDone(id, done) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, done: !done } : o));
    api("orders", "PATCH", { done: !done }, `?id=eq.${id}`);
  }
  async function deleteOrder(id) {
    setOrders(prev => prev.filter(o => o.id !== id));
    setConfirmDelete(null); showToast("삭제되었습니다");
    api("orders", "DELETE", null, `?id=eq.${id}`);
  }
  async function checkAll(session, done) {
    setOrders(prev => prev.map(o => o.date === filterDate && o.session === session ? { ...o, done } : o));
    showToast(done ? "일괄 완료 처리했습니다" : "완료를 취소했습니다");
    api("orders", "PATCH", { done }, `?date=eq.${filterDate}&session=eq.${session}`);
  }

  async function handleHoSave() {
    if (!hoAuthor.trim() || !hoContent.trim()) return;
    const timeStr = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    if (editHoId) {
      await api("handovers", "PATCH", { author: hoAuthor.trim(), category: hoCategory, priority: hoPriority, content: hoContent.trim() }, `?id=eq.${editHoId}`);
      showToast("수정되었습니다");
    } else {
      await api("handovers", "POST", { id: Date.now(), date: hoDate, author: hoAuthor.trim(), category: hoCategory, priority: hoPriority, content: hoContent.trim(), checked: false, created_at: timeStr });
      showToast("등록되었습니다");
    }
    setHoContent(""); setShowHoForm(false); setEditHoId(null); fetchAll();
  }
  async function toggleHoChecked(id, checked) { await api("handovers", "PATCH", { checked: !checked }, `?id=eq.${id}`); fetchAll(); }
  async function deleteHo(id) { await api("handovers", "DELETE", null, `?id=eq.${id}`); showToast("삭제되었습니다"); fetchAll(); }
  function openEditHo(item) { setEditHoId(item.id); setHoAuthor(item.author); setHoCategory(item.category); setHoPriority(item.priority); setHoContent(item.content); setShowHoForm(true); }

  const orderType  = activeTab === "otc" ? "otc" : "rx";
  const filtered   = orders.filter(o => o.date === filterDate && (filterSession === "all" || o.session === filterSession) && (!showUndone || !o.done) && (o.order_type === orderType || (!o.order_type && orderType === "rx")));
  const morning    = filtered.filter(o => o.session === "morning");
  const afternoon  = filtered.filter(o => o.session === "afternoon");
  const doneCount  = filtered.filter(o => o.done).length;
  const accentColor = addingSession ? SESSION_COLOR[addingSession] : "#2563eb";
  const filteredHo = handovers.filter(h => h.date === hoDate);

  return (
    <div style={{ fontFamily: "Noto Sans KR, sans-serif", background: "#f5f7fa", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .btn { transition: opacity 0.15s, transform 0.1s; cursor: pointer; border: none; font-family: inherit; }
        .btn:hover { opacity: 0.88; } .btn:active { transform: scale(0.97); }
        .fade { animation: fadeUp 0.2s ease; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(5px); } to { opacity:1; transform:translateY(0); } }
        .toast-anim { animation: toastIn 0.25s ease; }
        @keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(8px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @keyframes micPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); } 50% { box-shadow: 0 0 0 7px rgba(239,68,68,0); } }
      `}</style>

      {/* 헤더 */}
      <div style={{ background: "#1e3a5f", padding: "16px 20px 14px" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ fontSize: 24 }}>💊</span>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 17 }}>약국 주문장</div>
              <div style={{ color: "#93c5fd", fontSize: 11, marginTop: 1 }}>{getTodayLabel()}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {(activeTab === "order" || activeTab === "otc") && filtered.length > 0 && (
              <div style={{ background: "rgba(255,255,255,0.12)", borderRadius: 20, padding: "5px 13px", color: "#e0f2fe", fontSize: 12, fontWeight: 600 }}>
                {doneCount}/{filtered.length} 완료
              </div>
            )}
            <button onClick={fetchAll} className="btn"
              style={{ background: "rgba(255,255,255,0.15)", border: "none", borderRadius: 20, padding: "5px 10px", color: "#e0f2fe", fontSize: 12, fontWeight: 600 }}>
              🔄 새로고침
            </button>
          </div>
        </div>
      </div>

      {/* 상단 탭: 주문장 / 명세서 */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", display: "flex" }}>
          {[["order","📋 주문장"],["invoice","📄 명세서"]].map(([key, label]) => (
            <button key={key} onClick={() => { setActiveTab(key); setAddingSession(null); }} className="btn"
              style={{ flex: 1, padding: "13px 0", fontSize: 15, fontWeight: 700,
                background: "transparent",
                color: activeTab === key ? "#1e3a5f" : "#94a3b8",
                borderBottom: activeTab === key ? "2px solid #1e3a5f" : "2px solid transparent" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 주문장 서브탭: 전문약 / 일반약 */}
      {(activeTab === "order" || activeTab === "otc") && (
        <div style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", padding: "0 14px", gap: 6 }}>
            {[["order","📋 전문약"],["otc","💊 일반약"]].map(([key, label]) => (
              <button key={key} onClick={() => { setActiveTab(key); setAddingSession(null); }} className="btn"
                style={{ padding: "8px 16px", fontSize: 13, fontWeight: 700,
                  background: "transparent",
                  color: activeTab === key ? "#2563eb" : "#94a3b8",
                  borderBottom: activeTab === key ? "2px solid #2563eb" : "2px solid transparent" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "14px 14px 80px" }}>

        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>⏳</div>
            <div style={{ fontSize: 13 }}>불러오는 중...</div>
          </div>
        )}

        {/* ===== 거래명세서 탭 ===== */}
        {activeTab === "invoice" && <InvoiceScanner />}

        {/* ===== 주문장 탭 ===== */}
        {!loading && (activeTab === "order" || activeTab === "otc") && (
          <div>
            <div style={{ background: "#fff", borderRadius: 14, padding: "12px 14px", marginBottom: 12,
              boxShadow: "0 1px 6px rgba(0,0,0,0.06)", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)}
                style={{ ...iStyle, flex: 1, minWidth: 130, width: "auto" }} />
              <div style={{ display: "flex", gap: 6 }}>
                {[["all","전체"],["morning","☀️ 오전"],["afternoon","🌙 오후"]].map(([val, label]) => (
                  <button key={val} onClick={() => setFilterSession(val)} className="btn"
                    style={{ padding: "7px 11px", borderRadius: 9, fontSize: 12, fontWeight: 700,
                      background: filterSession === val ? "#1e3a5f" : "#f1f5f9",
                      color: filterSession === val ? "#fff" : "#64748b" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>정렬</span>
                {[["time","🕐 시간순"],["alpha","가나다순"]].map(([val, label]) => (
                  <button key={val} onClick={() => setSortOrder(val)} className="btn"
                    style={{ padding: "5px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: sortOrder === val ? "#1e3a5f" : "#f1f5f9",
                      color: sortOrder === val ? "#fff" : "#64748b" }}>
                    {label}
                  </button>
                ))}
                <button onClick={() => setShowUndone(!showUndone)} className="btn"
                  style={{ padding: "5px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: showUndone ? "#1e3a5f" : "#f1f5f9",
                    color: showUndone ? "#fff" : "#64748b" }}>
                  미완료만
                </button>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { if (!addingSession) openForm(getCurrentSession()); setTimeout(() => startListening(), 300); }} className="btn"
                  style={{ padding: "7px 14px", borderRadius: 20, fontWeight: 700, fontSize: 16,
                    background: isListening ? "#ef4444" : "#e0f2fe", color: isListening ? "#fff" : "#2563eb",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)", animation: isListening ? "micPulse 1s infinite" : "none" }}>
                  🎤
                </button>
                <button onClick={() => openForm(getCurrentSession())} className="btn"
                  style={{ padding: "7px 16px", borderRadius: 20, fontWeight: 700, fontSize: 13,
                    background: addingSession ? SESSION_COLOR[addingSession] : "#1e3a5f",
                    color: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
                  + 주문 추가
                </button>
              </div>
            </div>

            {addingSession && (
              <div className="fade" style={{ background: "#fff", borderRadius: 14, padding: "16px", marginBottom: 14,
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)", borderTop: "3px solid " + accentColor }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: accentColor }}>
                    {editId ? "✏️ 주문 수정" : SESSION_ICON[addingSession] + " " + SESSION_LABEL[addingSession] + " 주문 등록"}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => setIsUrgent(!isUrgent)} className="btn"
                      style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                        border: "1.5px solid " + (isUrgent ? "#f59e0b" : "#e2e8f0"),
                        background: isUrgent ? "#fff7ed" : "#f8fafc", color: isUrgent ? "#d97706" : "#94a3b8" }}>
                      {isUrgent ? "🚨 긴급 ✓" : "🚨 긴급"}
                    </button>
                    {editId && (
                      <button onClick={() => setIsSoldOut(!isSoldOut)} className="btn"
                        style={{ padding: "4px 10px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                          border: "1.5px solid " + (isSoldOut ? "#64748b" : "#e2e8f0"),
                          background: isSoldOut ? "#f1f5f9" : "#f8fafc", color: isSoldOut ? "#1e293b" : "#94a3b8" }}>
                        {isSoldOut ? "🚫 품절 ✓" : "🚫 품절"}
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ position: "relative", marginBottom: 10 }}>
                  <input autoFocus placeholder="약품명 (2글자 이상 입력시 자동완성)" value={drugName}
                    onChange={e => {
                      const val = e.target.value; setDrugName(val);
                      if (val.length >= 2 && activeTab !== "otc") { setSuggestions(DRUG_LIST.filter(d => d.includes(val)).slice(0, 6)); }
                      else { setSuggestions([]); }
                    }}
                    onKeyDown={e => e.key === "Enter" && document.getElementById("qty-input")?.focus()}
                    onBlur={() => setTimeout(() => setSuggestions([]), 150)}
                    style={{ ...iStyle, paddingRight: 48 }} />
                  {suggestions.length > 0 && (
                    <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
                      background: "#fff", borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                      border: "1.5px solid #e2e8f0", overflow: "hidden", marginTop: 4 }}>
                      {suggestions.map((s, i) => (
                        <div key={i} onClick={() => { setDrugName(s); setSuggestions([]); document.getElementById("qty-input")?.focus(); }}
                          style={{ padding: "10px 14px", fontSize: 14, cursor: "pointer", color: "#1e293b",
                            borderBottom: i < suggestions.length - 1 ? "1px solid #f1f5f9" : "none", background: "#fff" }}
                          onMouseEnter={e => e.target.style.background = "#f0f9ff"}
                          onMouseLeave={e => e.target.style.background = "#fff"}>
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                  <button onClick={startListening} className="btn"
                    style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                      width: 34, height: 34, borderRadius: "50%", border: "none",
                      background: isListening ? "#ef4444" : "#e0f2fe", color: isListening ? "#fff" : "#2563eb",
                      fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center",
                      animation: isListening ? "micPulse 1s infinite" : "none", flexShrink: 0 }}>
                    🎤
                  </button>
                </div>

                {isListening && (
                  <div style={{ fontSize: 12, color: "#ef4444", fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#ef4444", animation: "micPulse 1s infinite" }} />
                    듣고 있어요... 약품명을 말해주세요
                  </div>
                )}

                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: packType === "bottle" ? 8 : 0 }}>
                    {[["ptp","PTP"],["bottle","병"]].map(([val, label]) => (
                      <button key={val} onClick={() => { setPackType(packType === val ? "" : val); setBottleSize(""); }} className="btn"
                        style={{ flex: 1, padding: "7px", borderRadius: 9, fontSize: 12, fontWeight: 700,
                          border: "1.5px solid " + (packType === val ? accentColor : "#e2e8f0"),
                          background: packType === val ? accentColor + "18" : "#f8fafc",
                          color: packType === val ? accentColor : "#94a3b8" }}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {packType === "bottle" && (
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {["28t","30t","60t","90t","100t","120t","200t","300t","500t","1000t"].map(size => (
                        <button key={size} onClick={() => setBottleSize(size)} className="btn"
                          style={{ padding: "5px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                            border: "1.5px solid " + (bottleSize === size ? "#059669" : "#e2e8f0"),
                            background: bottleSize === size ? "#f0fdf4" : "#f8fafc",
                            color: bottleSize === size ? "#059669" : "#64748b" }}>
                          {size}
                        </button>
                      ))}
                      <input placeholder="직접입력" value={!["28t","30t","60t","90t","100t","120t","200t","300t","500t","1000t"].includes(bottleSize) ? bottleSize : ""}
                        onChange={e => setBottleSize(e.target.value)}
                        style={{ ...iStyle, width: 80, padding: "5px 8px", fontSize: 12 }} />
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  {[["qty","📦 주문수량입력"],["stock","⚠️ 현재재고입력"]].map(([m, label]) => (
                    <button key={m} onClick={() => { setQtyMode(m); if (!editId) setQuantity(""); }} className="btn"
                      style={{ flex: 1, padding: "7px", borderRadius: 9, fontSize: 12, fontWeight: 700,
                        border: "1.5px solid " + (qtyMode === m ? accentColor : "#e2e8f0"),
                        background: qtyMode === m ? accentColor + "18" : "#f8fafc",
                        color: qtyMode === m ? accentColor : "#94a3b8" }}>
                      {label}
                    </button>
                  ))}
                </div>
                {qtyMode === "qty" && (
                  <input id="qty-input" placeholder="수량 입력 (예: 3, 2box)" value={quantity}
                    onChange={e => setQuantity(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSave()}
                    style={{ ...iStyle, marginBottom: 10 }} />
                )}
                {qtyMode === "stock" && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                      {STOCK_PRESETS.map(preset => (
                        <button key={preset} onClick={() => setQuantity(preset)} className="btn"
                          style={{ padding: "6px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                            border: "1.5px solid " + (quantity === preset ? "#c2410c" : "#e2e8f0"),
                            background: quantity === preset ? "#fff7ed" : "#f8fafc",
                            color: quantity === preset ? "#c2410c" : "#64748b" }}>
                          {preset}
                        </button>
                      ))}
                    </div>
                    <input id="qty-input" placeholder="직접 입력 (예: 반박스 남음)" value={quantity}
                      onChange={e => setQuantity(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSave()}
                      style={iStyle} />
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setAddingSession(null); setDrugName(""); setQuantity(""); setEditId(null); setIsUrgent(false); setIsSoldOut(false); }} className="btn"
                    style={{ flex: 1, padding: "10px", borderRadius: 10, background: "#f1f5f9", color: "#64748b", fontWeight: 600, fontSize: 14 }}>
                    취소
                  </button>
                  <button onClick={handleSave} className="btn"
                    style={{ flex: 2, padding: "10px", borderRadius: 10, fontWeight: 700, fontSize: 14,
                      background: drugName.trim() && quantity.trim() ? accentColor : "#e2e8f0",
                      color: drugName.trim() && quantity.trim() ? "#fff" : "#94a3b8" }}>
                    {editId ? "수정 완료" : "등록"}
                  </button>
                </div>
              </div>
            )}

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "52px 0", color: "#94a3b8" }}>
                <div style={{ fontSize: 44, marginBottom: 10 }}>📋</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>주문 내역이 없습니다</div>
                <div style={{ fontSize: 12, marginTop: 5 }}>위 버튼으로 주문을 등록해보세요</div>
              </div>
            ) : (
              <div>
                {(filterSession === "all" || filterSession === "morning") && morning.length > 0 &&
                  <SessionSection session="morning" items={morning} onToggle={toggleDone} onDelete={setConfirmDelete} onCheckAll={checkAll} onEdit={openEdit} sortOrder={sortOrder} />}
                {(filterSession === "all" || filterSession === "afternoon") && afternoon.length > 0 &&
                  <SessionSection session="afternoon" items={afternoon} onToggle={toggleDone} onDelete={setConfirmDelete} onCheckAll={checkAll} onEdit={openEdit} sortOrder={sortOrder} />}
              </div>
            )}
          </div>
        )}

        {/* ===== 인수인계 탭 ===== */}
        {!loading && activeTab === "handover" && (
          <div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
              <input type="date" value={hoDate} onChange={e => setHoDate(e.target.value)} style={{ ...iStyle, flex: 1, width: "auto" }} />
              <button onClick={() => { setEditHoId(null); setHoContent(""); setShowHoForm(!showHoForm); }} className="btn"
                style={{ padding: "7px 16px", borderRadius: 20, fontWeight: 700, fontSize: 13,
                  background: showHoForm ? "#64748b" : "#1e3a5f", color: "#fff", flexShrink: 0 }}>
                {showHoForm ? "닫기" : "+ 작성"}
              </button>
            </div>
            {showHoForm && (
              <div className="fade" style={{ background: "#fff", borderRadius: 14, padding: "16px", marginBottom: 14,
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)", borderTop: "3px solid #1e3a5f" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f", marginBottom: 12 }}>{editHoId ? "✏️ 수정" : "📝 인수인계 작성"}</div>
                <input placeholder="작성자 이름" value={hoAuthor} onChange={e => setHoAuthor(e.target.value)} style={{ ...iStyle, marginBottom: 10 }} />
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 5 }}>카테고리</div>
                    <div style={{ display: "flex", gap: 5 }}>
                      {[["handover","인수인계"],["notice","공지"],["message","전달사항"]].map(([c, label]) => (
                        <button key={c} onClick={() => setHoCategory(c)} className="btn"
                          style={{ flex: 1, padding: "5px 2px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                            border: "1.5px solid " + (hoCategory === c ? CATEGORY_COLOR[c] : "#e2e8f0"),
                            background: hoCategory === c ? CATEGORY_BG[c] : "#f8fafc",
                            color: hoCategory === c ? CATEGORY_COLOR[c] : "#94a3b8" }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 5 }}>중요도</div>
                    <div style={{ display: "flex", gap: 5 }}>
                      {[["normal","일반"],["urgent","긴급"]].map(([p, label]) => (
                        <button key={p} onClick={() => setHoPriority(p)} className="btn"
                          style={{ flex: 1, padding: "5px 2px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                            border: "1.5px solid " + (hoPriority === p ? (p === "urgent" ? "#dc2626" : "#2563eb") : "#e2e8f0"),
                            background: hoPriority === p ? (p === "urgent" ? "#fef2f2" : "#eff6ff") : "#f8fafc",
                            color: hoPriority === p ? (p === "urgent" ? "#dc2626" : "#2563eb") : "#94a3b8" }}>
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <textarea placeholder="내용을 입력하세요..." value={hoContent} onChange={e => setHoContent(e.target.value)} rows={4}
                  style={{ ...iStyle, resize: "none", lineHeight: 1.6, marginBottom: 10 }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setShowHoForm(false); setEditHoId(null); setHoContent(""); }} className="btn"
                    style={{ flex: 1, padding: "10px", borderRadius: 10, background: "#f1f5f9", color: "#64748b", fontWeight: 600, fontSize: 14 }}>취소</button>
                  <button onClick={handleHoSave} className="btn"
                    style={{ flex: 2, padding: "10px", borderRadius: 10, fontWeight: 700, fontSize: 14,
                      background: hoAuthor.trim() && hoContent.trim() ? "#1e3a5f" : "#e2e8f0",
                      color: hoAuthor.trim() && hoContent.trim() ? "#fff" : "#94a3b8" }}>
                    {editHoId ? "수정 완료" : "등록"}
                  </button>
                </div>
              </div>
            )}
            {filteredHo.length === 0 ? (
              <div style={{ textAlign: "center", padding: "52px 0", color: "#94a3b8" }}>
                <div style={{ fontSize: 44, marginBottom: 10 }}>📝</div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>작성된 내용이 없습니다</div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {filteredHo.map(item => (
                  <div key={item.id} className="fade" style={{ background: "#fff", borderRadius: 14, padding: "14px 16px",
                    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                    borderLeft: "3px solid " + (item.priority === "urgent" ? "#dc2626" : CATEGORY_COLOR[item.category]),
                    opacity: item.checked ? 0.55 : 1 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <input type="checkbox" checked={item.checked} onChange={() => toggleHoChecked(item.id, item.checked)}
                        style={{ width: 18, height: 18, accentColor: "#1e3a5f", cursor: "pointer", marginTop: 2, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                          {item.priority === "urgent" && (
                            <span style={{ fontSize: 11, fontWeight: 700, background: "#fef2f2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 20, padding: "2px 8px" }}>🚨 긴급</span>
                          )}
                          <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "2px 8px", background: CATEGORY_BG[item.category], color: CATEGORY_COLOR[item.category] }}>
                            {item.category === "handover" ? "인수인계" : item.category === "notice" ? "공지" : "전달사항"}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{item.author}</span>
                          <span style={{ fontSize: 11, color: "#b0bec5", marginLeft: "auto" }}>{item.created_at}</span>
                        </div>
                        <div style={{ fontSize: 14, color: item.checked ? "#94a3b8" : "#1e293b", lineHeight: 1.6, textDecoration: item.checked ? "line-through" : "none", whiteSpace: "pre-wrap" }}>
                          {item.content}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 10 }}>
                      <button onClick={() => openEditHo(item)} className="btn"
                        style={{ padding: "4px 10px", borderRadius: 7, background: "#eff6ff", color: "#2563eb", fontSize: 11, fontWeight: 700, border: "none" }}>수정</button>
                      <button onClick={() => deleteHo(item.id)} className="btn"
                        style={{ padding: "4px 10px", borderRadius: 7, background: "#fef2f2", color: "#ef4444", fontSize: 11, fontWeight: 700, border: "none" }}>삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      {confirmDelete && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="fade" style={{ background: "#fff", borderRadius: 16, padding: "24px 20px", width: 270, textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>🗑</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b", marginBottom: 5 }}>삭제할까요?</div>
            <div style={{ color: "#64748b", fontSize: 13, marginBottom: 18 }}>삭제 후 복구할 수 없습니다.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmDelete(null)} className="btn" style={{ flex: 1, padding: 10, borderRadius: 10, background: "#f1f5f9", color: "#475569", fontWeight: 600 }}>취소</button>
              <button onClick={() => deleteOrder(confirmDelete)} className="btn" style={{ flex: 1, padding: 10, borderRadius: 10, background: "#ef4444", color: "#fff", fontWeight: 700 }}>삭제</button>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 */}
      {toast && (
        <div className="toast-anim" style={{ position: "fixed", bottom: 26, left: "50%", transform: "translateX(-50%)",
          background: "#1e293b", color: "#fff", padding: "10px 22px", borderRadius: 30, fontSize: 13, fontWeight: 600,
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)", zIndex: 300, whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
