import { useState, useRef, useCallback } from "react";

/* ─── palette (Studyplus-inspired) ──────────────────────────── */
const C = {
  bg:       "#F5F7FA",
  surface:  "#FFFFFF",
  border:   "#E8ECF0",
  primary:  "#3DBE8A",   // green accent
  primaryD: "#2EA070",
  primaryBg:"#EAF7F1",
  text:     "#1A1D23",
  sub:      "#6B7280",
  muted:    "#9CA3AF",
  danger:   "#F05252",
  dangerBg: "#FEF2F2",
  correct:  "#3DBE8A",
  correctBg:"#EAF7F1",
  shadow:   "rgba(0,0,0,0.06)",
  shadow2:  "rgba(0,0,0,0.10)",
};

/* ─── helpers ───────────────────────────────────────────────── */
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function generateOptions(correct, allCards) {
  const others = shuffle(allCards.filter(c => c.back !== correct.back)).slice(0, 3);
  return shuffle([correct, ...others]);
}

/* ─── built-in decks ────────────────────────────────────────── */
const BUILTIN_DECKS = [
  { id:"b1", name:"基礎英単語", emoji:"🌱", source:"builtin", cards:[
    { front:"apple",     back:"りんご",   hint:"名詞" },
    { front:"beautiful", back:"美しい",   hint:"形容詞" },
    { front:"journey",   back:"旅",       hint:"名詞" },
    { front:"whisper",   back:"ささやく", hint:"動詞" },
    { front:"ancient",   back:"古代の",   hint:"形容詞" },
    { front:"courage",   back:"勇気",     hint:"名詞" },
  ]},
  { id:"b2", name:"TOEIC頻出", emoji:"📊", source:"builtin", cards:[
    { front:"negotiate",   back:"交渉する", hint:"動詞" },
    { front:"revenue",     back:"収益",     hint:"名詞" },
    { front:"substantial", back:"相当な",   hint:"形容詞" },
    { front:"implement",   back:"実施する", hint:"動詞" },
    { front:"deadline",    back:"締め切り", hint:"名詞" },
    { front:"collaborate", back:"協力する", hint:"動詞" },
  ]},
];

/* ─── AI extraction ─────────────────────────────────────────── */
async function extractVocabFromImage(base64Image, mediaType) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body: JSON.stringify({
      model:"claude-sonnet-4-20250514",
      max_tokens:1000,
      messages:[{
        role:"user",
        content:[
          { type:"image", source:{ type:"base64", media_type:mediaType, data:base64Image }},
          { type:"text",  text:`この画像の単語帳から単語ペアを抽出してください。JSON形式のみで返してください（説明不要）:
{"deckName":"デッキ名","cards":[{"front":"外国語","back":"日本語訳","hint":"品詞"}]}
見つからない場合: {"deckName":"不明","cards":[]}
最大20ペアまで。` },
        ],
      }],
    }),
  });
  const data = await res.json();
  const text = data.content?.map(b => b.text||"").join("") || "";
  return JSON.parse(text.replace(/```json|```/g,"").trim());
}

/* ─── Logo ──────────────────────────────────────────────────── */
function MemoLogo({ size = 28 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap: size < 24 ? 4 : 6 }}>
      {/* pill wordmark */}
      <div style={{
        display:"flex", alignItems:"center",
        background: C.primary,
        borderRadius: 10,
        padding:`${size*0.18}px ${size*0.5}px`,
      }}>
        <span style={{
          fontFamily:"'Nunito','Noto Sans JP',sans-serif",
          fontWeight:800,
          fontSize: size,
          color:"#fff",
          letterSpacing:"-0.5px",
          lineHeight:1,
        }}>memo</span>
      </div>
      <span style={{
        fontFamily:"'Nunito','Noto Sans JP',sans-serif",
        fontWeight:900,
        fontSize: size * 1.25,
        color: C.primary,
        lineHeight:1,
        marginLeft:2,
      }}>+</span>
    </div>
  );
}

/* ─── shared UI atoms ───────────────────────────────────────── */
function Card({ children, style }) {
  return (
    <div style={{
      background: C.surface,
      borderRadius: 16,
      border:`1px solid ${C.border}`,
      boxShadow:`0 2px 12px ${C.shadow}`,
      padding:"20px",
      ...style,
    }}>
      {children}
    </div>
  );
}

function Btn({ children, variant="primary", onClick, style, full }) {
  const base = {
    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
    fontFamily:"'Nunito','Noto Sans JP',sans-serif",
    fontWeight:700, fontSize:15,
    border:"none", borderRadius:12, padding:"13px 24px",
    cursor:"pointer", transition:"all 0.18s ease",
    width: full ? "100%" : undefined,
    ...style,
  };
  const variants = {
    primary: { background:C.primary, color:"#fff", boxShadow:`0 4px 16px rgba(61,190,138,0.3)` },
    ghost:   { background:"#fff", color:C.text, border:`1.5px solid ${C.border}` },
    danger:  { background:C.dangerBg, color:C.danger, border:`1.5px solid #FECACA` },
  };
  return (
    <button
      style={{ ...base, ...variants[variant] }}
      onClick={onClick}
      onMouseEnter={e=>{
        if(variant==="primary") e.currentTarget.style.background=C.primaryD;
        else e.currentTarget.style.background=C.bg;
      }}
      onMouseLeave={e=>{
        if(variant==="primary") e.currentTarget.style.background=C.primary;
        else e.currentTarget.style.background= variant==="ghost"?"#fff":C.dangerBg;
      }}
    >
      {children}
    </button>
  );
}

/* ─── Top Nav ───────────────────────────────────────────────── */
function Nav({ onBack, title, right }) {
  return (
    <div style={{
      position:"sticky", top:0, zIndex:50,
      background:"rgba(255,255,255,0.92)",
      backdropFilter:"blur(12px)",
      borderBottom:`1px solid ${C.border}`,
      display:"flex", alignItems:"center",
      padding:"0 20px", height:56,
      gap:12,
    }}>
      {onBack && (
        <button onClick={onBack} style={{ background:"none", border:"none", cursor:"pointer", padding:4, color:C.sub, fontSize:20, lineHeight:1, display:"flex" }}>
          ←
        </button>
      )}
      {title && <span style={{ fontWeight:700, fontSize:16, color:C.text, flex:1 }}>{title}</span>}
      {!title && !onBack && <MemoLogo size={22} />}
      <div style={{ marginLeft:"auto" }}>{right}</div>
    </div>
  );
}

/* ─── Scan Screen ───────────────────────────────────────────── */
function ScanScreen({ onBack, onDeckCreated }) {
  const [step, setStep]       = useState("capture");
  const [imageData, setImg]   = useState(null);
  const [mimeType, setMime]   = useState("image/jpeg");
  const [extracted, setEx]    = useState(null);
  const [error, setErr]       = useState(null);
  const fileRef   = useRef();
  const camRef    = useRef();

  const handleFile = useCallback(file => {
    if (!file) return;
    setMime(file.type || "image/jpeg");
    const r = new FileReader();
    r.onload = e => { setImg({ base64: e.target.result.split(",")[1], url: e.target.result }); setStep("preview"); };
    r.readAsDataURL(file);
  },[]);

  const analyze = async () => {
    setStep("processing"); setErr(null);
    try {
      const result = await extractVocabFromImage(imageData.base64, mimeType);
      if (!result.cards?.length) { setErr("単語ペアが見つかりませんでした。別の画像を試してください。"); setStep("preview"); return; }
      setEx(result); setStep("confirm");
    } catch { setErr("読み取りに失敗しました。もう一度お試しください。"); setStep("preview"); }
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg }}>
      <Nav onBack={onBack} title="単語帳をスキャン" />

      <div style={{ maxWidth:480, margin:"0 auto", padding:"24px 16px 48px" }}>

        {step==="capture" && (
          <>
            {/* hero card */}
            <Card style={{ textAlign:"center", padding:"36px 24px", marginBottom:20 }}>
              <div style={{ width:80, height:80, borderRadius:24, background:C.primaryBg, margin:"0 auto 20px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:36 }}>📷</div>
              <h2 style={{ margin:"0 0 10px", fontSize:20, fontWeight:800, color:C.text }}>写真で単語を取り込む</h2>
              <p style={{ margin:0, color:C.sub, fontSize:14, lineHeight:1.7 }}>単語帳やノートを撮影するだけで<br/>AIが自動で問題を作成します</p>
            </Card>

            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
              <Btn full onClick={()=>camRef.current?.click()}>📸　カメラで撮影</Btn>
              <Btn full variant="ghost" onClick={()=>fileRef.current?.click()}>🖼️　ライブラリから選ぶ</Btn>
            </div>

            <input ref={camRef}  type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])} />
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])} />

            <Card style={{ background:C.primaryBg, border:`1px solid #C6EFDD`, padding:"16px 20px" }}>
              <p style={{ margin:"0 0 8px", fontWeight:700, color:C.primaryD, fontSize:13 }}>💡 読み取りのコツ</p>
              {["明るい場所で撮影する","文字がはっきり映るようにする","単語と訳が並んでいるページを選ぶ"].map(t=>(
                <p key={t} style={{ margin:"3px 0", color:"#2d8f65", fontSize:13 }}>• {t}</p>
              ))}
            </Card>
          </>
        )}

        {step==="preview" && imageData && (
          <>
            <Card style={{ padding:0, overflow:"hidden", marginBottom:16 }}>
              <img src={imageData.url} alt="preview" style={{ width:"100%", maxHeight:320, objectFit:"contain", display:"block" }} />
            </Card>
            {error && <p style={{ color:C.danger, fontSize:13, background:C.dangerBg, padding:"10px 14px", borderRadius:10, marginBottom:12 }}>⚠️ {error}</p>}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <Btn full onClick={analyze}>🔍　AIで読み取る</Btn>
              <Btn full variant="ghost" onClick={()=>{ setStep("capture"); setImg(null); setErr(null); }}>📷　撮り直す</Btn>
            </div>
          </>
        )}

        {step==="processing" && (
          <Card style={{ textAlign:"center", padding:"56px 24px" }}>
            <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
            <div style={{ width:48, height:48, borderRadius:"50%", border:`3px solid ${C.border}`, borderTop:`3px solid ${C.primary}`, margin:"0 auto 20px", animation:"spin 0.8s linear infinite" }} />
            <p style={{ margin:"0 0 6px", fontWeight:700, fontSize:17, color:C.text }}>AIが単語を解析中...</p>
            <p style={{ margin:0, color:C.sub, fontSize:13 }}>少々お待ちください</p>
          </Card>
        )}

        {step==="confirm" && extracted && (
          <>
            <Card style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16, padding:"16px 20px", background:C.primaryBg, border:`1px solid #C6EFDD` }}>
              <span style={{ fontSize:32 }}>✅</span>
              <div>
                <p style={{ margin:"0 0 2px", fontWeight:800, fontSize:16, color:C.text }}>{extracted.cards.length}語を読み取りました！</p>
                <p style={{ margin:0, color:C.primaryD, fontSize:13, fontWeight:600 }}>📚 {extracted.deckName}</p>
              </div>
            </Card>

            <Card style={{ padding:"12px 16px", marginBottom:16, maxHeight:280, overflowY:"auto" }}>
              {extracted.cards.map((c,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 4px", borderBottom: i<extracted.cards.length-1 ? `1px solid ${C.border}`:undefined }}>
                  <span style={{ fontWeight:700, color:C.text, fontSize:14, minWidth:90 }}>{c.front}</span>
                  <span style={{ color:C.muted, fontSize:12 }}>→</span>
                  <span style={{ fontWeight:600, color:C.primary, fontSize:14, flex:1 }}>{c.back}</span>
                  {c.hint && <span style={{ fontSize:11, color:C.muted, background:C.bg, padding:"2px 8px", borderRadius:20 }}>{c.hint}</span>}
                </div>
              ))}
            </Card>

            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <Btn full onClick={()=>onDeckCreated({ id:`scan_${Date.now()}`, name:extracted.deckName||"スキャンデッキ", emoji:"📷", source:"scan", cards:extracted.cards })}>
                🚀　クイズを始める
              </Btn>
              <Btn full variant="ghost" onClick={()=>{ setStep("capture"); setImg(null); setEx(null); }}>
                📷　別の画像を使う
              </Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Quiz Screen ───────────────────────────────────────────── */
function QuizScreen({ deck, onBack, onFinish }) {
  const [questions] = useState(()=>
    shuffle(deck.cards).map(card=>({ card, options:generateOptions(card,deck.cards) }))
  );
  const [cur,  setCur]      = useState(0);
  const [sel,  setSel]      = useState(null);
  const [done, setDone]     = useState(false);
  const [score,setScore]    = useState(0);
  const [streak,setStreak]  = useState(0);
  const [showS, setShowS]   = useState(false);
  const [results,setResults]= useState([]);
  const timer = useRef();

  const answer = opt => {
    if (done) return;
    setSel(opt); setDone(true);
    const ok = opt.back === questions[cur].card.back;
    if (ok) {
      setScore(s=>s+1);
      setStreak(s=>{ const n=s+1; if(n>=3){setShowS(true);clearTimeout(timer.current);timer.current=setTimeout(()=>setShowS(false),1800);} return n; });
    } else setStreak(0);
    setResults(r=>[...r,{ card:questions[cur].card, correct:ok, chosen:opt }]);
  };

  const next = () => {
    if (cur+1>=questions.length) onFinish({ score, total:questions.length, results, deck });
    else { setCur(c=>c+1); setSel(null); setDone(false); }
  };

  const q   = questions[cur];
  const pct = (cur/questions.length)*100;

  return (
    <div style={{ minHeight:"100vh", background:C.bg }}>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}`}</style>

      {/* streak toast */}
      {showS && (
        <div style={{ position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",background:C.text,color:"#fff",fontWeight:800,fontSize:15,padding:"10px 24px",borderRadius:40,zIndex:200,boxShadow:"0 4px 20px rgba(0,0,0,0.2)",whiteSpace:"nowrap",animation:"popIn 0.25s ease" }}>
          🔥 {streak}連続正解！
        </div>
      )}

      <Nav onBack={onBack}
        title={`${deck.emoji} ${deck.name}`}
        right={<span style={{ fontSize:13, fontWeight:700, color:C.primary }}>✅ {score}/{cur+(done?1:0)}</span>}
      />

      {/* progress */}
      <div style={{ height:4, background:C.border }}>
        <div style={{ height:"100%", background:C.primary, width:`${pct}%`, transition:"width 0.4s ease" }} />
      </div>

      <div style={{ maxWidth:480, margin:"0 auto", padding:"24px 16px 48px", display:"flex", flexDirection:"column", gap:16 }}>
        <p style={{ margin:0, color:C.muted, fontSize:13, textAlign:"center" }}>{cur+1} / {questions.length}</p>

        {/* question */}
        <Card style={{ textAlign:"center", padding:"36px 28px" }}>
          {q.card.hint && <span style={{ fontSize:12, color:C.primary, background:C.primaryBg, padding:"3px 12px", borderRadius:20, fontWeight:700 }}>{q.card.hint}</span>}
          <h2 style={{ margin:"16px 0 8px", fontSize:40, fontWeight:900, color:C.text, letterSpacing:"-0.5px" }}>{q.card.front}</h2>
          <p style={{ margin:0, color:C.muted, fontSize:14 }}>日本語の意味は？</p>
        </Card>

        {/* options */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {q.options.map((opt,i)=>{
            const isOk  = opt.back===q.card.back;
            const isSel = sel?.back===opt.back;
            let bg=C.surface, border=`1.5px solid ${C.border}`, col=C.text;
            if(done){
              if(isOk)           { bg=C.correctBg; border=`1.5px solid ${C.correct}`; col=C.primaryD; }
              else if(isSel)     { bg=C.dangerBg;  border=`1.5px solid ${C.danger}`;  col=C.danger; }
            }
            return (
              <button key={i}
                style={{ padding:"16px 14px", borderRadius:14, cursor:"pointer", fontSize:15, fontWeight:700, display:"flex", alignItems:"center", gap:10, textAlign:"left", background:bg, border, color:col, boxShadow:`0 2px 8px ${C.shadow}`, transition:"all 0.18s ease" }}
                onClick={()=>answer(opt)}
                onMouseEnter={e=>{ if(!done) e.currentTarget.style.background=C.bg; }}
                onMouseLeave={e=>{ if(!done) e.currentTarget.style.background=bg; }}
              >
                <span style={{ width:28, height:28, borderRadius:8, background:done?(isOk?C.correct:isSel?C.danger:C.border):C.border, color:done&&(isOk||isSel)?"#fff":C.sub, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, flexShrink:0, transition:"all 0.18s" }}>
                  {done&&isOk ? "✓" : done&&isSel ? "✗" : ["A","B","C","D"][i]}
                </span>
                {opt.back}
              </button>
            );
          })}
        </div>

        {done && <Btn full onClick={next}>{cur+1>=questions.length ? "結果を見る 🎉" : "次の問題 →"}</Btn>}
      </div>
    </div>
  );
}

/* ─── Result Screen ─────────────────────────────────────────── */
function ResultScreen({ score, total, results, deck, onRetry, onHome }) {
  const pct = Math.round((score/total)*100);
  const emoji = score===total ? "🏆" : pct>=70 ? "🌟" : "💪";
  const msg   = score===total ? "パーフェクト！" : pct>=70 ? "よくできました！" : "もう一度挑戦！";

  return (
    <div style={{ minHeight:"100vh", background:C.bg }}>
      <Nav title="クイズ結果" right={<MemoLogo size={18}/>} />

      <div style={{ maxWidth:480, margin:"0 auto", padding:"24px 16px 48px", display:"flex", flexDirection:"column", gap:16 }}>

        <Card style={{ textAlign:"center", padding:"40px 24px" }}>
          <div style={{ fontSize:56, marginBottom:12 }}>{emoji}</div>
          <h2 style={{ margin:"0 0 20px", fontSize:22, fontWeight:800, color:C.text }}>{msg}</h2>
          {/* ring-ish score */}
          <div style={{ display:"inline-flex", alignItems:"baseline", gap:4, background:C.primaryBg, borderRadius:20, padding:"12px 32px", marginBottom:8 }}>
            <span style={{ fontSize:52, fontWeight:900, color:C.primary, lineHeight:1 }}>{score}</span>
            <span style={{ fontSize:22, color:C.muted, fontWeight:600 }}>/ {total}</span>
          </div>
          <p style={{ margin:0, color:C.sub, fontSize:15, fontWeight:600 }}>{pct}% 正解</p>
        </Card>

        {/* review */}
        <Card style={{ padding:"4px 8px" }}>
          <p style={{ margin:"8px 12px", fontWeight:700, fontSize:13, color:C.sub }}>振り返り</p>
          {results.map((r,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, background: r.correct ? C.correctBg : C.dangerBg, marginBottom:6 }}>
              <span style={{ fontSize:16 }}>{r.correct?"✅":"❌"}</span>
              <span style={{ fontWeight:700, color:C.text, fontSize:14 }}>{r.card.front}</span>
              <span style={{ color:C.muted, fontSize:12 }}>→</span>
              <span style={{ fontWeight:700, color: r.correct ? C.primaryD : C.danger, fontSize:14 }}>{r.card.back}</span>
              {!r.correct && <span style={{ marginLeft:"auto", color:C.muted, fontSize:12 }}>あなた: {r.chosen.back}</span>}
            </div>
          ))}
        </Card>

        <div style={{ display:"flex", gap:12 }}>
          <Btn full onClick={onRetry}>🔄 もう一度</Btn>
          <Btn full variant="ghost" onClick={onHome}>🏠 ホームへ</Btn>
        </div>
      </div>
    </div>
  );
}

/* ─── Home Screen ───────────────────────────────────────────── */
function HomeScreen({ decks, onScan, onStart }) {
  return (
    <div style={{ minHeight:"100vh", background:C.bg }}>
      {/* header */}
      <div style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"0 20px" }}>
        <div style={{ maxWidth:480, margin:"0 auto", height:60, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <MemoLogo size={24} />
          <span style={{ fontSize:13, color:C.sub }}>単語を、あなたのものに。</span>
        </div>
      </div>

      <div style={{ maxWidth:480, margin:"0 auto", padding:"20px 16px 64px", display:"flex", flexDirection:"column", gap:16 }}>

        {/* scan CTA */}
        <button
          onClick={onScan}
          style={{ width:"100%", background:`linear-gradient(135deg,${C.primary},#2ab07a)`, border:"none", borderRadius:18, padding:"20px 24px", display:"flex", alignItems:"center", gap:16, cursor:"pointer", boxShadow:`0 6px 24px rgba(61,190,138,0.35)`, transition:"transform 0.18s,box-shadow 0.18s" }}
          onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 10px 32px rgba(61,190,138,0.4)"; }}
          onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 6px 24px rgba(61,190,138,0.35)"; }}
        >
          <div style={{ width:52, height:52, borderRadius:14, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>📷</div>
          <div style={{ textAlign:"left" }}>
            <p style={{ margin:"0 0 3px", fontWeight:800, fontSize:17, color:"#fff" }}>単語帳をスキャン</p>
            <p style={{ margin:0, fontSize:13, color:"rgba(255,255,255,0.82)" }}>写真を撮るだけでAIが問題を作成</p>
          </div>
          <span style={{ marginLeft:"auto", color:"rgba(255,255,255,0.8)", fontSize:20 }}>›</span>
        </button>

        {/* section label */}
        <p style={{ margin:"4px 4px 0", fontWeight:700, fontSize:14, color:C.sub }}>デッキ一覧</p>

        {/* deck list */}
        {decks.map(deck=>(
          <button
            key={deck.id}
            onClick={()=>onStart(deck)}
            style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`, borderRadius:16, padding:"16px 20px", display:"flex", alignItems:"center", gap:14, cursor:"pointer", boxShadow:`0 2px 8px ${C.shadow}`, transition:"all 0.18s ease", textAlign:"left" }}
            onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 6px 20px ${C.shadow2}`; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=`0 2px 8px ${C.shadow}`; }}
          >
            {/* icon */}
            <div style={{ width:46, height:46, borderRadius:12, background:C.primaryBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>{deck.emoji}</div>
            {/* text */}
            <div style={{ flex:1 }}>
              <p style={{ margin:"0 0 3px", fontWeight:700, fontSize:15, color:C.text }}>{deck.name}</p>
              <p style={{ margin:0, fontSize:12, color:C.muted }}>{deck.cards.length}語</p>
            </div>
            {/* badge */}
            {deck.source==="scan" && (
              <span style={{ fontSize:11, fontWeight:700, color:C.primary, background:C.primaryBg, padding:"3px 10px", borderRadius:20, border:`1px solid #B7EDCC` }}>スキャン</span>
            )}
            <span style={{ color:C.muted, fontSize:18 }}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── App root ──────────────────────────────────────────────── */
export default function MemoryPlus() {
  const [screen, setScreen]   = useState("home");
  const [decks,  setDecks]    = useState(BUILTIN_DECKS);
  const [active, setActive]   = useState(null);
  const [result, setResult]   = useState(null);

  const handleCreated = deck => { setDecks(d=>[deck,...d]); setActive(deck); setScreen("quiz"); };
  const startQuiz     = deck => { setActive(deck); setResult(null); setScreen("quiz"); };

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'Nunito','Noto Sans JP','Hiragino Sans',sans-serif;}
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');
      `}</style>

      {screen==="home"   && <HomeScreen   decks={decks} onScan={()=>setScreen("scan")} onStart={startQuiz} />}
      {screen==="scan"   && <ScanScreen   onBack={()=>setScreen("home")} onDeckCreated={handleCreated} />}
      {screen==="quiz"   && active && <QuizScreen deck={active} onBack={()=>setScreen("home")} onFinish={r=>{ setResult(r); setScreen("result"); }} />}
      {screen==="result" && result && <ResultScreen {...result} onRetry={()=>startQuiz(active)} onHome={()=>setScreen("home")} />}
    </>
  );
}
