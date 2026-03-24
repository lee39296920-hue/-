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

function getToday() { return new Date().toISOString().split("T")[0]; }
function getTodayLabel() { return new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" }); }
function getCurrentSession() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes() < 13 * 60 + 30 ? "morning" : "afternoon";
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
  if (done) return <span style={{ fontSize: 12, fontWeight: 600, color: "#94a3b8" }}>{stock ? value : "수량 : " + value}</span>;
  if (stock) return (
    <span style={{ fontSize: 12, fontWeight: 700, borderRadius: 6, padding: "3px 8px",
      background: "#fef2f2", color: "#dc2626", border: "1.5px solid #fca5a5",
      display: "inline-flex", alignItems: "center", gap: 3 }}>
      📦 재고 {value}
    </span>
  );
  return (
    <span style={{ fontSize: 12, fontWeight: 700, borderRadius: 6, padding: "3px 8px",
      background: "#2563eb", color: "#fff", display: "inline-flex", alignItems: "center", gap: 3 }}>
      🛒 {value}개 주문 필요
    </span>
  );
}

function SessionSection({ session, items, onToggle, onDelete, onCheckAll, onEdit }) {
  const sorted    = [...items].sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
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
        <button onClick={() => onCheckAll(session, !allDone)} className="btn"
          style={{ marginLeft: "auto", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
            background: allDone ? "#f1f5f9" : "#059669", color: allDone ? "#94a3b8" : "#fff", border: "none" }}>
          {allDone ? "✓ 전체완료" : "일괄 완료"}
        </button>
      </div>
      <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden",
        boxShadow: "0 1px 6px rgba(0,0,0,0.06)", borderTop: "3px solid " + SESSION_COLOR[session] }}>
        {sorted.map((item, idx) => (
          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "13px 14px",
            borderBottom: idx < sorted.length - 1 ? "1px solid #f1f5f9" : "none",
            background: item.urgent ? (item.done ? "#fefce8" : "#fffbeb") : "transparent" }}>
            <input type="checkbox" checked={item.done} onChange={() => onToggle(item.id, item.done)}
              style={{ width: 20, height: 20, accentColor: "#2563eb", cursor: "pointer", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontWeight: 700, fontSize: 15,
                  color: item.done ? "#94a3b8" : "#0f172a",
                  textDecoration: item.done ? "line-through" : "none" }}>
                  {item.urgent && <span style={{ color: item.done ? "#d1d5db" : "#f59e0b", marginRight: 4 }}>⭐</span>}
                  {item.drug_name}
                </span>
              </div>
              <div style={{ marginTop: 4 }}>
                <QtyBadge value={item.quantity} done={item.done} mode={item.qty_mode} />
              </div>
            </div>
            <span style={{ fontSize: 11, color: "#b0bec5", flexShrink: 0 }}>{item.created_at}</span>
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

export default function App() {
  const [orders, setOrders]               = useState([]);
  const [handovers, setHandovers]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [filterDate, setFilterDate]       = useState(getToday());
  const [filterSession, setFilterSession] = useState(getCurrentSession());
  const [addingSession, setAddingSession] = useState(null);
  const [editId, setEditId]               = useState(null);
  const [qtyMode, setQtyMode]             = useState("qty");
  const [drugName, setDrugName]           = useState("");
  const [quantity, setQuantity]           = useState("");
  const [isUrgent, setIsUrgent]           = useState(false);
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
  const recognitionRef                    = useRef(null);

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 1800); };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [o, h] = await Promise.all([
        api("orders", "GET", null, "?order=created_date.desc"),
        api("handovers", "GET", null, "?order=created_date.desc"),
      ]);
      setOrders(Array.isArray(o) ? o : []);
      setHandovers(Array.isArray(h) ? h : []);
    } catch(e) { showToast("데이터 로딩 실패"); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // 30초마다 자동 새로고침 (실시간 동기화)
  useEffect(() => {
    const timer = setInterval(fetchAll, 30000);
    return () => clearInterval(timer);
  }, [fetchAll]);

  useEffect(() => {
    const timer = setInterval(() => {
      setFilterDate(getToday());
      setFilterSession(getCurrentSession());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // 음성인식 함수
  function startListening() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("이 브라우저는 음성인식을 지원하지 않아요 (Chrome 권장)");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;
    setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      // "타이레놀 2개" 또는 "타이레놀 2" 패턴이면 약품명+수량 분리
      const match = transcript.match(/^(.+?)\s+(\d+)\s*개?$/);
      if (match) {
        setDrugName(match[1].trim());
        setQuantity(match[2]);
        showToast(`🎤 "${match[1].trim()}" ${match[2]}개`);
      } else {
        setDrugName(transcript);
        showToast(`🎤 "${transcript}"`);
      }
      setIsListening(false);
    };
    recognition.onerror = () => {
      showToast("음성인식 실패, 다시 시도해주세요");
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }

  function openForm(session) {
    if (addingSession === session && !editId) { setAddingSession(null); return; }
    setEditId(null); setAddingSession(session); setQtyMode("qty");
    setDrugName(""); setQuantity(""); setIsUrgent(false);
  }
  function openEdit(item) {
    setEditId(item.id); setAddingSession(item.session);
    setQtyMode(item.qty_mode || (isStockNote(item.quantity) ? "stock" : "qty"));
    setDrugName(item.drug_name); setQuantity(item.quantity);
    setIsUrgent(item.urgent || false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSave() {
    if (!drugName.trim() || !quantity.trim()) return;
    const timeStr = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    if (editId) {
      await api("orders", "PATCH", {
        drug_name: drugName.trim(), quantity: quantity.trim(), qty_mode: qtyMode, urgent: isUrgent
      }, `?id=eq.${editId}`);
      showToast("수정되었습니다");
    } else {
      await api("orders", "POST", {
        id: Date.now(), date: filterDate, session: addingSession,
        drug_name: drugName.trim(), quantity: quantity.trim(), qty_mode: qtyMode,
        urgent: isUrgent, done: false, created_at: timeStr,
      });
      showToast("주문이 등록되었습니다");
    }
    setDrugName(""); setQuantity(""); setAddingSession(null); setEditId(null); setIsUrgent(false);
    fetchAll();
  }

  async function toggleDone(id, done) {
    await api("orders", "PATCH", { done: !done }, `?id=eq.${id}`);
    fetchAll();
  }
  async function deleteOrder(id) {
    await api("orders", "DELETE", null, `?id=eq.${id}`);
    setConfirmDelete(null); showToast("삭제되었습니다"); fetchAll();
  }
  async function checkAll(session, done) {
    await api("orders", "PATCH", { done }, `?date=eq.${filterDate}&session=eq.${session}`);
    showToast(done ? "일괄 완료 처리했습니다" : "완료를 취소했습니다"); fetchAll();
  }

  async function handleHoSave() {
    if (!hoAuthor.trim() || !hoContent.trim()) return;
    const timeStr = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" });
    if (editHoId) {
      await api("handovers", "PATCH", {
        author: hoAuthor.trim(), category: hoCategory, priority: hoPriority, content: hoContent.trim()
      }, `?id=eq.${editHoId}`);
      showToast("수정되었습니다");
    } else {
      await api("handovers", "POST", {
        id: Date.now(), date: hoDate, author: hoAuthor.trim(),
        category: hoCategory, priority: hoPriority, content: hoContent.trim(),
        checked: false, created_at: timeStr,
      });
      showToast("등록되었습니다");
    }
    setHoContent(""); setShowHoForm(false); setEditHoId(null); fetchAll();
  }
  async function toggleHoChecked(id, checked) {
    await api("handovers", "PATCH", { checked: !checked }, `?id=eq.${id}`);
    fetchAll();
  }
  async function deleteHo(id) {
    await api("handovers", "DELETE", null, `?id=eq.${id}`);
    showToast("삭제되었습니다"); fetchAll();
  }
  function openEditHo(item) {
    setEditHoId(item.id); setHoAuthor(item.author); setHoCategory(item.category);
    setHoPriority(item.priority); setHoContent(item.content); setShowHoForm(true);
  }

  const filtered    = orders.filter(o => o.date === filterDate && (filterSession === "all" || o.session === filterSession));
  const morning     = filtered.filter(o => o.session === "morning");
  const afternoon   = filtered.filter(o => o.session === "afternoon");
  const doneCount   = filtered.filter(o => o.done).length;
  const accentColor = addingSession ? SESSION_COLOR[addingSession] : "#2563eb";
  const filteredHo  = handovers.filter(h => h.date === hoDate);
  const uncheckedHo = handovers.filter(h => !h.checked).length;

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
            {activeTab === "order" && filtered.length > 0 && (
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

      {/* 메인 탭 */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0" }}>
        <div style={{ maxWidth: 520, margin: "0 auto", display: "flex" }}>
          {[["order","📋 주문장"],["handover","📝 인수인계"]].map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} className="btn"
              style={{ flex: 1, padding: "12px 0", fontSize: 14, fontWeight: 700, position: "relative",
                background: "transparent", color: activeTab === key ? "#1e3a5f" : "#94a3b8",
                borderBottom: activeTab === key ? "2px solid #1e3a5f" : "2px solid transparent" }}>
              {label}
              {key === "handover" && uncheckedHo > 0 && (
                <span style={{ position: "absolute", top: 8, right: "calc(50% - 30px)",
                  background: "#ef4444", color: "#fff", borderRadius: 10, fontSize: 10,
                  fontWeight: 700, padding: "1px 5px" }}>{uncheckedHo}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "14px 14px 80px" }}>

        {/* 로딩 */}
        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>⏳</div>
            <div style={{ fontSize: 13 }}>불러오는 중...</div>
          </div>
        )}

        {/* ===== 주문장 탭 ===== */}
        {!loading && activeTab === "order" && (
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
              <span style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 4 }}>
                <span>{SESSION_ICON[getCurrentSession()]}</span>
                <span style={{ fontWeight: 600, color: SESSION_COLOR[getCurrentSession()] }}>{SESSION_LABEL[getCurrentSession()]}</span>
                <span> 시간 · 13:30 자동전환</span>
              </span>
              <button onClick={() => openForm(getCurrentSession())} className="btn"
                style={{ padding: "7px 16px", borderRadius: 20, fontWeight: 700, fontSize: 13,
                  background: addingSession ? SESSION_COLOR[addingSession] : "#1e3a5f",
                  color: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
                + 주문 추가
              </button>
            </div>

            {addingSession && (
              <div className="fade" style={{ background: "#fff", borderRadius: 14, padding: "16px", marginBottom: 14,
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)", borderTop: "3px solid " + accentColor }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: accentColor, marginBottom: 12 }}>
                  {editId ? "✏️ 주문 수정" : SESSION_ICON[addingSession] + " " + SESSION_LABEL[addingSession] + " 주문 등록"}
                </div>

                {/* 약품명 입력 + 🎤 마이크 버튼 */}
                <div style={{ position: "relative", marginBottom: 10 }}>
                  <input
                    autoFocus
                    placeholder="약품명"
                    value={drugName}
                    onChange={e => setDrugName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && document.getElementById("qty-input")?.focus()}
                    style={{ ...iStyle, paddingRight: 48 }}
                  />
                  <button
                    onClick={startListening}
                    className="btn"
                    title={isListening ? "듣는 중... (탭하여 중지)" : "음성으로 약품명 입력"}
                    style={{
                      position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                      width: 34, height: 34, borderRadius: "50%", border: "none",
                      background: isListening ? "#ef4444" : "#e0f2fe",
                      color: isListening ? "#fff" : "#2563eb",
                      fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center",
                      animation: isListening ? "micPulse 1s infinite" : "none",
                      flexShrink: 0,
                    }}
                  >
                    🎤
                  </button>
                </div>

                {/* 듣는 중 안내 텍스트 */}
                {isListening && (
                  <div style={{ fontSize: 12, color: "#ef4444", fontWeight: 600, marginBottom: 8,
                    display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%",
                      background: "#ef4444", animation: "micPulse 1s infinite" }} />
                    듣고 있어요... 약품명을 말해주세요
                  </div>
                )}

                <button onClick={() => setIsUrgent(!isUrgent)} className="btn"
                  style={{ width: "100%", padding: "9px", borderRadius: 10, marginBottom: 10,
                    fontWeight: 700, fontSize: 13, border: "1.5px solid " + (isUrgent ? "#f59e0b" : "#e2e8f0"),
                    background: isUrgent ? "#fffbeb" : "#f8fafc",
                    color: isUrgent ? "#d97706" : "#94a3b8" }}>
                  {isUrgent ? "⭐ 긴급 약품으로 표시됨" : "⭐ 긴급 표시 없음 (탭하여 설정)"}
                </button>
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  {[["qty","📦 수량 입력"],["stock","⚠️ 재고 메모"]].map(([m, label]) => (
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
                    onChange={e => setQuantity(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSave()}
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
                      onChange={e => setQuantity(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSave()}
                      style={iStyle} />
                  </div>
                )}
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setAddingSession(null); setDrugName(""); setQuantity(""); setEditId(null); setIsUrgent(false); }} className="btn"
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
                  <SessionSection session="morning" items={morning} onToggle={toggleDone} onDelete={setConfirmDelete} onCheckAll={checkAll} onEdit={openEdit} />}
                {(filterSession === "all" || filterSession === "afternoon") && afternoon.length > 0 &&
                  <SessionSection session="afternoon" items={afternoon} onToggle={toggleDone} onDelete={setConfirmDelete} onCheckAll={checkAll} onEdit={openEdit} />}
              </div>
            )}
          </div>
        )}

        {/* ===== 인수인계 탭 ===== */}
        {!loading && activeTab === "handover" && (
          <div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
              <input type="date" value={hoDate} onChange={e => setHoDate(e.target.value)}
                style={{ ...iStyle, flex: 1, width: "auto" }} />
              <button onClick={() => { setEditHoId(null); setHoContent(""); setShowHoForm(!showHoForm); }} className="btn"
                style={{ padding: "7px 16px", borderRadius: 20, fontWeight: 700, fontSize: 13,
                  background: showHoForm ? "#64748b" : "#1e3a5f", color: "#fff", flexShrink: 0 }}>
                {showHoForm ? "닫기" : "+ 작성"}
              </button>
            </div>

            {showHoForm && (
              <div className="fade" style={{ background: "#fff", borderRadius: 14, padding: "16px", marginBottom: 14,
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)", borderTop: "3px solid #1e3a5f" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1e3a5f", marginBottom: 12 }}>
                  {editHoId ? "✏️ 수정" : "📝 인수인계 작성"}
                </div>
                <input placeholder="작성자 이름" value={hoAuthor} onChange={e => setHoAuthor(e.target.value)}
                  style={{ ...iStyle, marginBottom: 10 }} />
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
                <textarea placeholder="내용을 입력하세요..." value={hoContent}
                  onChange={e => setHoContent(e.target.value)} rows={4}
                  style={{ ...iStyle, resize: "none", lineHeight: 1.6, marginBottom: 10 }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => { setShowHoForm(false); setEditHoId(null); setHoContent(""); }} className="btn"
                    style={{ flex: 1, padding: "10px", borderRadius: 10, background: "#f1f5f9", color: "#64748b", fontWeight: 600, fontSize: 14 }}>
                    취소
                  </button>
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
                            <span style={{ fontSize: 11, fontWeight: 700, background: "#fef2f2", color: "#dc2626",
                              border: "1px solid #fca5a5", borderRadius: 20, padding: "2px 8px" }}>🚨 긴급</span>
                          )}
                          <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 20, padding: "2px 8px",
                            background: CATEGORY_BG[item.category], color: CATEGORY_COLOR[item.category] }}>
                            {item.category === "handover" ? "인수인계" : item.category === "notice" ? "공지" : "전달사항"}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#475569" }}>{item.author}</span>
                          <span style={{ fontSize: 11, color: "#b0bec5", marginLeft: "auto" }}>{item.created_at}</span>
                        </div>
                        <div style={{ fontSize: 14, color: item.checked ? "#94a3b8" : "#1e293b",
                          lineHeight: 1.6, textDecoration: item.checked ? "line-through" : "none", whiteSpace: "pre-wrap" }}>
                          {item.content}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 10 }}>
                      <button onClick={() => openEditHo(item)} className="btn"
                        style={{ padding: "4px 10px", borderRadius: 7, background: "#eff6ff", color: "#2563eb", fontSize: 11, fontWeight: 700, border: "none" }}>
                        수정
                      </button>
                      <button onClick={() => deleteHo(item.id)} className="btn"
                        style={{ padding: "4px 10px", borderRadius: 7, background: "#fef2f2", color: "#ef4444", fontSize: 11, fontWeight: 700, border: "none" }}>
                        삭제
                      </button>
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="fade" style={{ background: "#fff", borderRadius: 16, padding: "24px 20px",
            width: 270, textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>🗑</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b", marginBottom: 5 }}>삭제할까요?</div>
            <div style={{ color: "#64748b", fontSize: 13, marginBottom: 18 }}>삭제 후 복구할 수 없습니다.</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setConfirmDelete(null)} className="btn"
                style={{ flex: 1, padding: 10, borderRadius: 10, background: "#f1f5f9", color: "#475569", fontWeight: 600 }}>취소</button>
              <button onClick={() => deleteOrder(confirmDelete)} className="btn"
                style={{ flex: 1, padding: 10, borderRadius: 10, background: "#ef4444", color: "#fff", fontWeight: 700 }}>삭제</button>
            </div>
          </div>
        </div>
      )}

      {/* 토스트 */}
      {toast && (
        <div className="toast-anim" style={{ position: "fixed", bottom: 26, left: "50%",
          transform: "translateX(-50%)", background: "#1e293b", color: "#fff",
          padding: "10px 22px", borderRadius: 30, fontSize: 13, fontWeight: 600,
          boxShadow: "0 4px 16px rgba(0,0,0,0.25)", zIndex: 300, whiteSpace: "nowrap" }}>
          {toast}
        </div>
      )}
    </div>
  );
}
