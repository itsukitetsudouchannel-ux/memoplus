import { useState, useRef, useCallback } from "react";

const C = {
  bg:"#F5F7FA",surface:"#FFFFFF",border:"#E8ECF0",
  primary:"#3DBE8A",primaryD:"#2EA070",primaryBg:"#EAF7F1",
  text:"#1A1D23",sub:"#6B7280",muted:"#9CA3AF",
  danger:"#F05252",dangerBg:"#FEF2F2",
  correct:"#3DBE8A",correctBg:"#EAF7F1",
  shadow:"rgba(0,0,0,0.06)",shadow2:"rgba(0,0,0,0.10)",
};

function shuffle(arr){return [...arr].sort(()=>Math.random()-0.5);}
function generateOptions(correct,allCards){
  const others=shuffle(allCards.filter(c=>c.back!==correct.back)).slice(0,3);
  return shuffle([correct,...others]);
}

const BUILTIN_DECKS=[
  {id:"b1",name:"中学英単語 基礎",emoji:"🌱",source:"builtin",cards:[
    {front:"apple",back:"りんご",hint:"名詞"},{front:"book",back:"本",hint:"名詞"},
    {front:"cat",back:"猫",hint:"名詞"},{front:"dog",back:"犬",hint:"名詞"},
    {front:"eat",back:"食べる",hint:"動詞"},{front:"family",back:"家族",hint:"名詞"},
    {front:"go",back:"行く",hint:"動詞"},{front:"happy",back:"幸せな",hint:"形容詞"},
    {front:"idea",back:"考え・アイデア",hint:"名詞"},{front:"jump",back:"跳ぶ",hint:"動詞"},
    {front:"kind",back:"親切な",hint:"形容詞"},{front:"like",back:"好む・好き",hint:"動詞"},
    {front:"make",back:"作る",hint:"動詞"},{front:"name",back:"名前",hint:"名詞"},
    {front:"open",back:"開ける・開いた",hint:"動詞/形容詞"},{front:"play",back:"遊ぶ・演奏する",hint:"動詞"},
    {front:"question",back:"質問",hint:"名詞"},{front:"run",back:"走る",hint:"動詞"},
    {front:"school",back:"学校",hint:"名詞"},{front:"talk",back:"話す",hint:"動詞"},
    {front:"under",back:"〜の下に",hint:"前置詞"},{front:"very",back:"とても",hint:"副詞"},
    {front:"walk",back:"歩く",hint:"動詞"},{front:"year",back:"年",hint:"名詞"},
    {front:"zoo",back:"動物園",hint:"名詞"},{front:"also",back:"〜も・また",hint:"副詞"},
    {front:"bring",back:"持ってくる",hint:"動詞"},{front:"city",back:"都市・市",hint:"名詞"},
    {front:"dream",back:"夢",hint:"名詞"},{front:"early",back:"早い・早く",hint:"形容詞/副詞"},
    {front:"flower",back:"花",hint:"名詞"},{front:"give",back:"与える",hint:"動詞"},
    {front:"help",back:"助ける・助け",hint:"動詞/名詞"},{front:"important",back:"大切な・重要な",hint:"形容詞"},
    {front:"just",back:"ちょうど・ただ〜だけ",hint:"副詞"},{front:"keep",back:"保つ・続ける",hint:"動詞"},
    {front:"learn",back:"学ぶ・習う",hint:"動詞"},{front:"move",back:"動く・引っ越す",hint:"動詞"},
    {front:"need",back:"必要とする",hint:"動詞"},{front:"often",back:"しばしば・よく",hint:"副詞"},
    {front:"place",back:"場所",hint:"名詞"},{front:"ready",back:"準備ができた",hint:"形容詞"},
    {front:"show",back:"見せる・番組",hint:"動詞/名詞"},{front:"think",back:"考える・思う",hint:"動詞"},
    {front:"use",back:"使う・使用",hint:"動詞/名詞"},{front:"visit",back:"訪問する",hint:"動詞"},
    {front:"want",back:"欲しい・〜したい",hint:"動詞"},{front:"write",back:"書く",hint:"動詞"},
    {front:"young",back:"若い",hint:"形容詞"},{front:"small",back:"小さい",hint:"形容詞"},
  ]},
  {id:"b2",name:"中学英単語 発展",emoji:"📗",source:"builtin",cards:[
    {front:"abroad",back:"海外に・外国に",hint:"副詞"},{front:"achieve",back:"達成する",hint:"動詞"},
    {front:"believe",back:"信じる",hint:"動詞"},{front:"careful",back:"注意深い",hint:"形容詞"},
    {front:"change",back:"変える・変化",hint:"動詞/名詞"},{front:"decide",back:"決める",hint:"動詞"},
    {front:"enjoy",back:"楽しむ",hint:"動詞"},{front:"explain",back:"説明する",hint:"動詞"},
    {front:"feel",back:"感じる",hint:"動詞"},{front:"forget",back:"忘れる",hint:"動詞"},
    {front:"grow",back:"成長する・育てる",hint:"動詞"},{front:"happen",back:"起こる",hint:"動詞"},
    {front:"interest",back:"興味・関心",hint:"名詞"},{front:"invite",back:"招待する",hint:"動詞"},
    {front:"join",back:"参加する",hint:"動詞"},{front:"knowledge",back:"知識",hint:"名詞"},
    {front:"leave",back:"去る・出発する",hint:"動詞"},{front:"message",back:"メッセージ・伝言",hint:"名詞"},
    {front:"nature",back:"自然",hint:"名詞"},{front:"opinion",back:"意見",hint:"名詞"},
    {front:"popular",back:"人気のある",hint:"形容詞"},{front:"practice",back:"練習する・練習",hint:"動詞/名詞"},
    {front:"promise",back:"約束する・約束",hint:"動詞/名詞"},{front:"protect",back:"守る・保護する",hint:"動詞"},
    {front:"receive",back:"受け取る",hint:"動詞"},{front:"remember",back:"覚えている・思い出す",hint:"動詞"},
    {front:"respect",back:"尊敬する・尊重",hint:"動詞/名詞"},{front:"same",back:"同じ",hint:"形容詞"},
    {front:"send",back:"送る",hint:"動詞"},{front:"share",back:"共有する・分かち合う",hint:"動詞"},
    {front:"smile",back:"微笑む・笑顔",hint:"動詞/名詞"},{front:"solve",back:"解く・解決する",hint:"動詞"},
    {front:"spend",back:"過ごす・使う",hint:"動詞"},{front:"step",back:"歩み・段階",hint:"名詞"},
    {front:"strange",back:"奇妙な・見知らぬ",hint:"形容詞"},{front:"succeed",back:"成功する",hint:"動詞"},
    {front:"support",back:"支援する・支持",hint:"動詞/名詞"},{front:"surprise",back:"驚かせる・驚き",hint:"動詞/名詞"},
    {front:"teach",back:"教える",hint:"動詞"},{front:"terrible",back:"ひどい・恐ろしい",hint:"形容詞"},
    {front:"tradition",back:"伝統",hint:"名詞"},{front:"trouble",back:"問題・困難",hint:"名詞"},
    {front:"try",back:"試みる・やってみる",hint:"動詞"},{front:"turn",back:"曲がる・回る・番",hint:"動詞/名詞"},
    {front:"understand",back:"理解する",hint:"動詞"},{front:"wait",back:"待つ",hint:"動詞"},
    {front:"wonder",back:"〜かと思う・不思議に思う",hint:"動詞"},{front:"word",back:"言葉・単語",hint:"名詞"},
    {front:"work",back:"働く・機能する・仕事",hint:"動詞/名詞"},{front:"worry",back:"心配する",hint:"動詞"},
  ]},
  {id:"b3",name:"高校英単語 標準",emoji:"📘",source:"builtin",cards:[
    {front:"abandon",back:"捨てる・諦める",hint:"動詞"},{front:"abstract",back:"抽象的な",hint:"形容詞"},
    {front:"accurate",back:"正確な",hint:"形容詞"},{front:"adapt",back:"適応する・改作する",hint:"動詞"},
    {front:"adequate",back:"十分な・適切な",hint:"形容詞"},{front:"admire",back:"称賛する",hint:"動詞"},
    {front:"affect",back:"影響を与える",hint:"動詞"},{front:"aggressive",back:"攻撃的な・積極的な",hint:"形容詞"},
    {front:"ancient",back:"古代の",hint:"形容詞"},{front:"anxiety",back:"不安・心配",hint:"名詞"},
    {front:"apparent",back:"明らかな・外見上の",hint:"形容詞"},{front:"appreciate",back:"感謝する・評価する",hint:"動詞"},
    {front:"appropriate",back:"適切な",hint:"形容詞"},{front:"approve",back:"承認する・賛成する",hint:"動詞"},
    {front:"argue",back:"議論する・主張する",hint:"動詞"},{front:"assume",back:"想定する・〜と思う",hint:"動詞"},
    {front:"attach",back:"付ける・添付する",hint:"動詞"},{front:"attempt",back:"試みる・試み",hint:"動詞/名詞"},
    {front:"attitude",back:"態度・姿勢",hint:"名詞"},{front:"avoid",back:"避ける",hint:"動詞"},
    {front:"aware",back:"気づいている・意識している",hint:"形容詞"},{front:"benefit",back:"利益・恩恵",hint:"名詞"},
    {front:"capable",back:"〜できる・有能な",hint:"形容詞"},{front:"cause",back:"原因・引き起こす",hint:"名詞/動詞"},
    {front:"challenging",back:"困難な・やりがいのある",hint:"形容詞"},{front:"compare",back:"比較する",hint:"動詞"},
    {front:"complex",back:"複雑な",hint:"形容詞"},{front:"concern",back:"心配・関心・関係する",hint:"名詞/動詞"},
    {front:"confident",back:"自信のある",hint:"形容詞"},{front:"conflict",back:"対立・衝突",hint:"名詞"},
    {front:"consequence",back:"結果・影響",hint:"名詞"},{front:"consider",back:"考慮する・〜だと考える",hint:"動詞"},
    {front:"contribute",back:"貢献する",hint:"動詞"},{front:"convince",back:"説得する・確信させる",hint:"動詞"},
    {front:"critical",back:"重要な・批判的な",hint:"形容詞"},{front:"culture",back:"文化",hint:"名詞"},
    {front:"debate",back:"議論・討論する",hint:"名詞/動詞"},{front:"define",back:"定義する",hint:"動詞"},
    {front:"demand",back:"要求する・需要",hint:"動詞/名詞"},{front:"demonstrate",back:"示す・証明する",hint:"動詞"},
    {front:"depend",back:"頼る・〜次第である",hint:"動詞"},{front:"describe",back:"描写する・説明する",hint:"動詞"},
    {front:"despite",back:"〜にもかかわらず",hint:"前置詞"},{front:"develop",back:"発展する・開発する",hint:"動詞"},
    {front:"discipline",back:"規律・訓練",hint:"名詞"},{front:"diverse",back:"多様な",hint:"形容詞"},
    {front:"encourage",back:"励ます・促進する",hint:"動詞"},{front:"enhance",back:"高める・向上させる",hint:"動詞"},
    {front:"environment",back:"環境",hint:"名詞"},{front:"establish",back:"設立する・確立する",hint:"動詞"},
  ]},
  {id:"b4",name:"高校英単語 上級",emoji:"📙",source:"builtin",cards:[
    {front:"elaborate",back:"詳細な・精巧な",hint:"形容詞"},{front:"eliminate",back:"排除する・取り除く",hint:"動詞"},
    {front:"emerge",back:"現れる・台頭する",hint:"動詞"},{front:"emphasize",back:"強調する",hint:"動詞"},
    {front:"evaluate",back:"評価する",hint:"動詞"},{front:"evidence",back:"証拠",hint:"名詞"},
    {front:"evolve",back:"進化する",hint:"動詞"},{front:"exaggerate",back:"誇張する",hint:"動詞"},
    {front:"explore",back:"探求する・探検する",hint:"動詞"},{front:"extent",back:"程度・範囲",hint:"名詞"},
    {front:"factor",back:"要因・要素",hint:"名詞"},{front:"failure",back:"失敗・故障",hint:"名詞"},
    {front:"flexible",back:"柔軟な",hint:"形容詞"},{front:"focus",back:"焦点・集中する",hint:"名詞/動詞"},
    {front:"fundamental",back:"基本的な・根本的な",hint:"形容詞"},{front:"generate",back:"生み出す・発生させる",hint:"動詞"},
    {front:"global",back:"世界的な・地球規模の",hint:"形容詞"},{front:"gradually",back:"徐々に",hint:"副詞"},
    {front:"guarantee",back:"保証する・保証",hint:"動詞/名詞"},{front:"hypothesis",back:"仮説",hint:"名詞"},
    {front:"ignore",back:"無視する",hint:"動詞"},{front:"illustrate",back:"説明する・例示する",hint:"動詞"},
    {front:"immediate",back:"即座の・直接の",hint:"形容詞"},{front:"impact",back:"影響・衝撃",hint:"名詞"},
    {front:"imply",back:"暗示する・意味する",hint:"動詞"},{front:"inevitable",back:"避けられない・必然的な",hint:"形容詞"},
    {front:"influence",back:"影響・影響を与える",hint:"名詞/動詞"},{front:"inspire",back:"鼓舞する・刺激する",hint:"動詞"},
    {front:"interpret",back:"解釈する・通訳する",hint:"動詞"},{front:"investigate",back:"調査する",hint:"動詞"},
    {front:"involve",back:"含む・〜に関わる",hint:"動詞"},{front:"maintain",back:"維持する・主張する",hint:"動詞"},
    {front:"majority",back:"大多数・過半数",hint:"名詞"},{front:"moral",back:"道徳的な・道徳",hint:"形容詞/名詞"},
    {front:"motivate",back:"動機づける",hint:"動詞"},{front:"navigate",back:"航行する・うまく対処する",hint:"動詞"},
    {front:"numerous",back:"多数の",hint:"形容詞"},{front:"objective",back:"客観的な・目標",hint:"形容詞/名詞"},
    {front:"obtain",back:"得る・獲得する",hint:"動詞"},{front:"overcome",back:"克服する",hint:"動詞"},
    {front:"phenomenon",back:"現象",hint:"名詞"},{front:"potential",back:"可能性・潜在的な",hint:"名詞/形容詞"},
    {front:"precisely",back:"正確に・まさに",hint:"副詞"},{front:"preserve",back:"保存する・守る",hint:"動詞"},
    {front:"primary",back:"主な・最初の",hint:"形容詞"},{front:"principle",back:"原則・原理",hint:"名詞"},
    {front:"prospect",back:"見通し・見込み",hint:"名詞"},{front:"relevant",back:"関連した・適切な",hint:"形容詞"},
    {front:"significant",back:"重要な・著しい",hint:"形容詞"},{front:"strategy",back:"戦略",hint:"名詞"},
  ]},
];

async function extractVocabFromImage(base64Image,mediaType){
  const res=await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "x-api-key":"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",
      "anthropic-version":"2023-06-01",
      "anthropic-dangerous-direct-browser-access":"true",
    },
    body:JSON.stringify({
      model:"claude-sonnet-4-20250514",
      max_tokens:1000,
      messages:[{
        role:"user",
        content:[
          {type:"image",source:{type:"base64",media_type:mediaType,data:base64Image}},
          {type:"text",text:`この画像の単語帳から単語ペアを抽出してください。JSON形式のみで返してください（説明不要）:\n{"deckName":"デッキ名","cards":[{"front":"外国語","back":"日本語訳","hint":"品詞"}]}\n見つからない場合: {"deckName":"不明","cards":[]}\n最大20ペアまで。`},
        ],
      }],
    }),
  });
  const data=await res.json();
  const text=data.content?.map(b=>b.text||"").join("")||"";
  return JSON.parse(text.replace(/```json|```/g,"").trim());
}function MemoLogo({size=28}){
  return(
    <div style={{display:"flex",alignItems:"center",gap:size<24?4:6}}>
      <div style={{display:"flex",alignItems:"center",background:C.primary,borderRadius:10,padding:`${size*0.18}px ${size*0.5}px`}}>
        <span style={{fontFamily:"'Nunito','Noto Sans JP',sans-serif",fontWeight:800,fontSize:size,color:"#fff",letterSpacing:"-0.5px",lineHeight:1}}>memo</span>
      </div>
      <span style={{fontFamily:"'Nunito','Noto Sans JP',sans-serif",fontWeight:900,fontSize:size*1.25,color:C.primary,lineHeight:1,marginLeft:2}}>+</span>
    </div>
  );
}
function Card({children,style}){
  return(<div style={{background:C.surface,borderRadius:16,border:`1px solid ${C.border}`,boxShadow:`0 2px 12px ${C.shadow}`,padding:"20px",...style}}>{children}</div>);
}
function Btn({children,variant="primary",onClick,style,full}){
  const base={display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"'Nunito','Noto Sans JP',sans-serif",fontWeight:700,fontSize:15,border:"none",borderRadius:12,padding:"13px 24px",cursor:"pointer",transition:"all 0.18s ease",width:full?"100%":undefined,...style};
  const variants={primary:{background:C.primary,color:"#fff",boxShadow:`0 4px 16px rgba(61,190,138,0.3)`},ghost:{background:"#fff",color:C.text,border:`1.5px solid ${C.border}`},danger:{background:C.dangerBg,color:C.danger,border:`1.5px solid #FECACA`}};
  return(<button style={{...base,...variants[variant]}} onClick={onClick} onMouseEnter={e=>{if(variant==="primary")e.currentTarget.style.background=C.primaryD;else e.currentTarget.style.background=C.bg;}} onMouseLeave={e=>{if(variant==="primary")e.currentTarget.style.background=C.primary;else e.currentTarget.style.background=variant==="ghost"?"#fff":C.dangerBg;}}>{children}</button>);
}
function Nav({onBack,title,right}){
  return(
    <div style={{position:"sticky",top:0,zIndex:50,background:"rgba(255,255,255,0.92)",backdropFilter:"blur(12px)",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",padding:"0 20px",height:56,gap:12}}>
      {onBack&&(<button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",padding:4,color:C.sub,fontSize:20,lineHeight:1,display:"flex"}}>←</button>)}
      {title&&<span style={{fontWeight:700,fontSize:16,color:C.text,flex:1}}>{title}</span>}
      {!title&&!onBack&&<MemoLogo size={22}/>}
      <div style={{marginLeft:"auto"}}>{right}</div>
    </div>
  );
}
function ScanScreen({onBack,onDeckCreated}){
  const [step,setStep]=useState("capture");
  const [imageData,setImg]=useState(null);
  const [mimeType,setMime]=useState("image/jpeg");
  const [extracted,setEx]=useState(null);
  const [error,setErr]=useState(null);
  const fileRef=useRef();
  const camRef=useRef();
  const handleFile=useCallback(file=>{
    if(!file)return;
    setMime(file.type||"image/jpeg");
    const r=new FileReader();
    r.onload=e=>{setImg({base64:e.target.result.split(",")[1],url:e.target.result});setStep("preview");};
    r.readAsDataURL(file);
  },[]);
  const analyze=async()=>{
    setStep("processing");setErr(null);
    try{
      const result=await extractVocabFromImage(imageData.base64,mimeType);
      if(!result.cards?.length){setErr("単語ペアが見つかりませんでした。別の画像を試してください。");setStep("preview");return;}
      setEx(result);setStep("confirm");
    }catch{setErr("読み取りに失敗しました。もう一度お試しください。");setStep("preview");}
  };
  return(
    <div style={{minHeight:"100vh",background:C.bg}}>
      <Nav onBack={onBack} title="単語帳をスキャン"/>
      <div style={{maxWidth:480,margin:"0 auto",padding:"24px 16px 48px"}}>
        {step==="capture"&&(
          <>
            <Card style={{textAlign:"center",padding:"36px 24px",marginBottom:20}}>
              <div style={{width:80,height:80,borderRadius:24,background:C.primaryBg,margin:"0 auto 20px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:36}}>📷</div>
              <h2 style={{margin:"0 0 10px",fontSize:20,fontWeight:800,color:C.text}}>写真で単語を取り込む</h2>
              <p style={{margin:0,color:C.sub,fontSize:14,lineHeight:1.7}}>単語帳やノートを撮影するだけで<br/>AIが自動で問題を作成します</p>
            </Card>
            <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:20}}>
              <Btn full onClick={()=>camRef.current?.click()}>📸　カメラで撮影</Btn>
              <Btn full variant="ghost" onClick={()=>fileRef.current?.click()}>🖼️　ライブラリから選ぶ</Btn>
            </div>
            <input ref={camRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
            <Card style={{background:C.primaryBg,border:`1px solid #C6EFDD`,padding:"16px 20px"}}>
              <p style={{margin:"0 0 8px",fontWeight:700,color:C.primaryD,fontSize:13}}>💡 読み取りのコツ</p>
              {["明るい場所で撮影する","文字がはっきり映るようにする","単語と訳が並んでいるページを選ぶ"].map(t=>(<p key={t} style={{margin:"3px 0",color:"#2d8f65",fontSize:13}}>• {t}</p>))}
            </Card>
          </>
        )}
        {step==="preview"&&imageData&&(
          <>
            <Card style={{padding:0,overflow:"hidden",marginBottom:16}}>
              <img src={imageData.url} alt="preview" style={{width:"100%",maxHeight:320,objectFit:"contain",display:"block"}}/>
            </Card>
            {error&&<p style={{color:C.danger,fontSize:13,background:C.dangerBg,padding:"10px 14px",borderRadius:10,marginBottom:12}}>⚠️ {error}</p>}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <Btn full onClick={analyze}>🔍　AIで読み取る</Btn>
              <Btn full variant="ghost" onClick={()=>{setStep("capture");setImg(null);setErr(null);}}>📷　撮り直す</Btn>
            </div>
          </>
        )}
        {step==="processing"&&(
          <Card style={{textAlign:"center",padding:"56px 24px"}}>
            <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
            <div style={{width:48,height:48,borderRadius:"50%",border:`3px solid ${C.border}`,borderTop:`3px solid ${C.primary}`,margin:"0 auto 20px",animation:"spin 0.8s linear infinite"}}/>
            <p style={{margin:"0 0 6px",fontWeight:700,fontSize:17,color:C.text}}>AIが単語を解析中...</p>
            <p style={{margin:0,color:C.sub,fontSize:13}}>少々お待ちください</p>
          </Card>
        )}
        {step==="confirm"&&extracted&&(
          <>
            <Card style={{display:"flex",alignItems:"center",gap:14,marginBottom:16,padding:"16px 20px",background:C.primaryBg,border:`1px solid #C6EFDD`}}>
              <span style={{fontSize:32}}>✅</span>
              <div>
                <p style={{margin:"0 0 2px",fontWeight:800,fontSize:16,color:C.text}}>{extracted.cards.length}語を読み取りました！</p>
                <p style={{margin:0,color:C.primaryD,fontSize:13,fontWeight:600}}>📚 {extracted.deckName}</p>
              </div>
            </Card>
            <Card style={{padding:"12px 16px",marginBottom:16,maxHeight:280,overflowY:"auto"}}>
              {extracted.cards.map((c,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 4px",borderBottom:i<extracted.cards.length-1?`1px solid ${C.border}`:undefined}}>
                  <span style={{fontWeight:700,color:C.text,fontSize:14,minWidth:90}}>{c.front}</span>
                  <span style={{color:C.muted,fontSize:12}}>→</span>
                  <span style={{fontWeight:600,color:C.primary,fontSize:14,flex:1}}>{c.back}</span>
                  {c.hint&&<span style={{fontSize:11,color:C.muted,background:C.bg,padding:"2px 8px",borderRadius:20}}>{c.hint}</span>}
                </div>
              ))}
            </Card>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <Btn full onClick={()=>onDeckCreated({id:`scan_${Date.now()}`,name:extracted.deckName||"スキャンデッキ",emoji:"📷",source:"scan",cards:extracted.cards})}>🚀　クイズを始める</Btn>
              <Btn full variant="ghost" onClick={()=>{setStep("capture");setImg(null);setEx(null);}}>📷　別の画像を使う</Btn>
            </div>
          </>
        )}
      </div>
    </div>
  );
}function QuizScreen({deck,onBack,onFinish}){
  const [questions]=useState(()=>shuffle(deck.cards).map(card=>({card,options:generateOptions(card,deck.cards)})));
  const [cur,setCur]=useState(0);
  const [sel,setSel]=useState(null);
  const [done,setDone]=useState(false);
  const [score,setScore]=useState(0);
  const [streak,setStreak]=useState(0);
  const [showS,setShowS]=useState(false);
  const [results,setResults]=useState([]);
  const timer=useRef();
  const answer=opt=>{
    if(done)return;
    setSel(opt);setDone(true);
    const ok=opt.back===questions[cur].card.back;
    if(ok){setScore(s=>s+1);setStreak(s=>{const n=s+1;if(n>=3){setShowS(true);clearTimeout(timer.current);timer.current=setTimeout(()=>setShowS(false),1800);}return n;});}
    else setStreak(0);
    setResults(r=>[...r,{card:questions[cur].card,correct:ok,chosen:opt}]);
  };
  const next=()=>{
    if(cur+1>=questions.length)onFinish({score,total:questions.length,results,deck});
    else{setCur(c=>c+1);setSel(null);setDone(false);}
  };
  const q=questions[cur];
  return(
    <div style={{minHeight:"100vh",background:C.bg}}>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}`}</style>
      {showS&&(<div style={{position:"fixed",top:70,left:"50%",transform:"translateX(-50%)",background:C.text,color:"#fff",fontWeight:800,fontSize:15,padding:"10px 24px",borderRadius:40,zIndex:200,boxShadow:"0 4px 20px rgba(0,0,0,0.2)",whiteSpace:"nowrap",animation:"popIn 0.25s ease"}}>🔥 {streak}連続正解！</div>)}
      <Nav onBack={onBack} title={`${deck.emoji} ${deck.name}`} right={<span style={{fontSize:13,fontWeight:700,color:C.primary}}>✅ {score}/{cur+(done?1:0)}</span>}/>
      <div style={{height:4,background:C.border}}><div style={{height:"100%",background:C.primary,width:`${(cur/questions.length)*100}%`,transition:"width 0.4s ease"}}/></div>
      <div style={{maxWidth:480,margin:"0 auto",padding:"24px 16px 48px",display:"flex",flexDirection:"column",gap:16}}>
        <p style={{margin:0,color:C.muted,fontSize:13,textAlign:"center"}}>{cur+1} / {questions.length}</p>
        <Card style={{textAlign:"center",padding:"36px 28px"}}>
          {q.card.hint&&<span style={{fontSize:12,color:C.primary,background:C.primaryBg,padding:"3px 12px",borderRadius:20,fontWeight:700}}>{q.card.hint}</span>}
          <h2 style={{margin:"16px 0 8px",fontSize:40,fontWeight:900,color:C.text,letterSpacing:"-0.5px"}}>{q.card.front}</h2>
          <p style={{margin:0,color:C.muted,fontSize:14}}>日本語の意味は？</p>
        </Card>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {q.options.map((opt,i)=>{
            const isOk=opt.back===q.card.back;
            const isSel=sel?.back===opt.back;
            let bg=C.surface,border=`1.5px solid ${C.border}`,col=C.text;
            if(done){if(isOk){bg=C.correctBg;border=`1.5px solid ${C.correct}`;col=C.primaryD;}else if(isSel){bg=C.dangerBg;border=`1.5px solid ${C.danger}`;col=C.danger;}}
            return(<button key={i} style={{padding:"16px 14px",borderRadius:14,cursor:"pointer",fontSize:15,fontWeight:700,display:"flex",alignItems:"center",gap:10,textAlign:"left",background:bg,border,color:col,boxShadow:`0 2px 8px ${C.shadow}`,transition:"all 0.18s ease"}} onClick={()=>answer(opt)} onMouseEnter={e=>{if(!done)e.currentTarget.style.background=C.bg;}} onMouseLeave={e=>{if(!done)e.currentTarget.style.background=bg;}}>
              <span style={{width:28,height:28,borderRadius:8,background:done?(isOk?C.correct:isSel?C.danger:C.border):C.border,color:done&&(isOk||isSel)?"#fff":C.sub,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,flexShrink:0,transition:"all 0.18s"}}>{done&&isOk?"✓":done&&isSel?"✗":["A","B","C","D"][i]}</span>
              {opt.back}
            </button>);
          })}
        </div>
        {done&&<Btn full onClick={next}>{cur+1>=questions.length?"結果を見る 🎉":"次の問題 →"}</Btn>}
      </div>
    </div>
  );
}
function ResultScreen({score,total,results,deck,onRetry,onHome}){
  const pct=Math.round((score/total)*100);
  return(
    <div style={{minHeight:"100vh",background:C.bg}}>
      <Nav title="クイズ結果" right={<MemoLogo size={18}/>}/>
      <div style={{maxWidth:480,margin:"0 auto",padding:"24px 16px 48px",display:"flex",flexDirection:"column",gap:16}}>
        <Card style={{textAlign:"center",padding:"40px 24px"}}>
          <div style={{fontSize:56,marginBottom:12}}>{score===total?"🏆":pct>=70?"🌟":"💪"}</div>
          <h2 style={{margin:"0 0 20px",fontSize:22,fontWeight:800,color:C.text}}>{score===total?"パーフェクト！":pct>=70?"よくできました！":"もう一度挑戦！"}</h2>
          <div style={{display:"inline-flex",alignItems:"baseline",gap:4,background:C.primaryBg,borderRadius:20,padding:"12px 32px",marginBottom:8}}>
            <span style={{fontSize:52,fontWeight:900,color:C.primary,lineHeight:1}}>{score}</span>
            <span style={{fontSize:22,color:C.muted,fontWeight:600}}>/ {total}</span>
          </div>
          <p style={{margin:0,color:C.sub,fontSize:15,fontWeight:600}}>{pct}% 正解</p>
        </Card>
        <Card style={{padding:"4px 8px"}}>
          <p style={{margin:"8px 12px",fontWeight:700,fontSize:13,color:C.sub}}>振り返り</p>
          {results.map((r,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,background:r.correct?C.correctBg:C.dangerBg,marginBottom:6}}>
              <span style={{fontSize:16}}>{r.correct?"✅":"❌"}</span>
              <span style={{fontWeight:700,color:C.text,fontSize:14}}>{r.card.front}</span>
              <span style={{color:C.muted,fontSize:12}}>→</span>
              <span style={{fontWeight:700,color:r.correct?C.primaryD:C.danger,fontSize:14}}>{r.card.back}</span>
              {!r.correct&&<span style={{marginLeft:"auto",color:C.muted,fontSize:12}}>あなた: {r.chosen.back}</span>}
            </div>
          ))}
        </Card>
        <div style={{display:"flex",gap:12}}>
          <Btn full onClick={onRetry}>🔄 もう一度</Btn>
          <Btn full variant="ghost" onClick={onHome}>🏠 ホームへ</Btn>
        </div>
      </div>
    </div>
  );
}
function HomeScreen({decks,onScan,onStart}){
  return(
    <div style={{minHeight:"100vh",background:C.bg}}>
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"0 20px"}}>
        <div style={{maxWidth:480,margin:"0 auto",height:60,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <MemoLogo size={24}/>
          <span style={{fontSize:13,color:C.sub}}>単語を、あなたのものに。</span>
        </div>
      </div>
      <div style={{maxWidth:480,margin:"0 auto",padding:"20px 16px 64px",display:"flex",flexDirection:"column",gap:16}}>
        <button onClick={onScan} style={{width:"100%",background:`linear-gradient(135deg,${C.primary},#2ab07a)`,border:"none",borderRadius:18,padding:"20px 24px",display:"flex",alignItems:"center",gap:16,cursor:"pointer",boxShadow:`0 6px 24px rgba(61,190,138,0.35)`,transition:"transform 0.18s,box-shadow 0.18s"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 10px 32px rgba(61,190,138,0.4)";}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 6px 24px rgba(61,190,138,0.35)";}}>
          <div style={{width:52,height:52,borderRadius:14,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>📷</div>
          <div style={{textAlign:"left"}}>
            <p style={{margin:"0 0 3px",fontWeight:800,fontSize:17,color:"#fff"}}>単語帳をスキャン</p>
            <p style={{margin:0,fontSize:13,color:"rgba(255,255,255,0.82)"}}>写真を撮るだけでAIが問題を作成</p>
          </div>
          <span style={{marginLeft:"auto",color:"rgba(255,255,255,0.8)",fontSize:20}}>›</span>
        </button>
        <p style={{margin:"4px 4px 0",fontWeight:700,fontSize:14,color:C.sub}}>デッキ一覧</p>
        {decks.map(deck=>(
          <button key={deck.id} onClick={()=>onStart(deck)} style={{width:"100%",background:C.surface,border:`1px solid ${C.border}`,borderRadius:16,padding:"16px 20px",display:"flex",alignItems:"center",gap:14,cursor:"pointer",boxShadow:`0 2px 8px ${C.shadow}`,transition:"all 0.18s ease",textAlign:"left"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 6px 20px ${C.shadow2}`;}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow=`0 2px 8px ${C.shadow}`;}}>
            <div style={{width:46,height:46,borderRadius:12,background:C.primaryBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{deck.emoji}</div>
            <div style={{flex:1}}>
              <p style={{margin:"0 0 3px",fontWeight:700,fontSize:15,color:C.text}}>{deck.name}</p>
              <p style={{margin:0,fontSize:12,color:C.muted}}>{deck.cards.length}語</p>
            </div>
            {deck.source==="scan"&&(<span style={{fontSize:11,fontWeight:700,color:C.primary,background:C.primaryBg,padding:"3px 10px",borderRadius:20,border:`1px solid #B7EDCC`}}>スキャン</span>)}
            <span style={{color:C.muted,fontSize:18}}>›</span>
          </button>
        ))}
      </div>
    </div>
  );
}
export default function MemoryPlus(){
  const [screen,setScreen]=useState("home");
  const [decks,setDecks]=useState(BUILTIN_DECKS);
  const [active,setActive]=useState(null);
  const [result,setResult]=useState(null);
  const handleCreated=deck=>{setDecks(d=>[deck,...d]);setActive(deck);setScreen("quiz");};
  const startQuiz=deck=>{setActive(deck);setResult(null);setScreen("quiz");};
  return(
    <>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}body{font-family:'Nunito','Noto Sans JP','Hiragino Sans',sans-serif;}@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&display=swap');`}</style>
      {screen==="home"&&<HomeScreen decks={decks} onScan={()=>setScreen("scan")} onStart={startQuiz}/>}
      {screen==="scan"&&<ScanScreen onBack={()=>setScreen("home")} onDeckCreated={handleCreated}/>}
      {screen==="quiz"&&active&&<QuizScreen deck={active} onBack={()=>setScreen("home")} onFinish={r=>{setResult(r);setScreen("result");}}/>}
      {screen==="result"&&result&&<ResultScreen {...result} onRetry={()=>startQuiz(active)} onHome={()=>setScreen("home")}/>}
    </>
  );
}
