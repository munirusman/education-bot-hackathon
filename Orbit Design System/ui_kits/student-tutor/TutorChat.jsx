(()=>{
const {ChatMessage,Button,IconButton,Icon,Badge,Tag}=window.OrbitDesignSystem_5c1997;
function TutorChat({msgs,onSend,paused,thinking}){
  const[v,setV]=React.useState('');const ref=React.useRef();
  React.useEffect(()=>{if(ref.current)ref.current.scrollTop=ref.current.scrollHeight},[msgs,thinking]);
  const send=()=>{if(!v.trim()||paused)return;onSend(v);setV('')};
  return <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',background:'var(--surface-page)'}}>
    <header style={{height:'var(--topbar-h)',flex:'none',display:'flex',alignItems:'center',gap:12,padding:'0 28px',borderBottom:'1px solid var(--border-1)'}}>
      <h1 style={{margin:0,font:'var(--type-h1)',fontSize:24,letterSpacing:'var(--ls-display)'}}>Factoring quadratics</h1>
      <span style={{marginLeft:'auto',display:'inline-flex',alignItems:'center',gap:6,font:'var(--type-caption)',color:'var(--fg-2)'}}><Icon name="eye" size={14}/>Your teacher can see this session</span></header>
    <div style={{padding:'10px 28px',borderBottom:'1px solid var(--border-1)',background:'var(--surface-card)',display:'flex',alignItems:'center',gap:10,flexWrap:'wrap'}}>
      <span style={{font:'var(--type-eyebrow)',letterSpacing:'var(--ls-caps)',textTransform:'uppercase',color:'var(--fg-3)'}}>Your tutor will</span>
      <Tag mono>Give hints, not final answers</Tag><Tag mono>Read your files</Tag><Tag mono>Not run code</Tag></div>
    <div ref={ref} style={{flex:1,overflow:'auto'}}><div style={{maxWidth:720,margin:'0 auto',padding:'28px 28px 12px',display:'flex',flexDirection:'column',gap:18}}>
      {msgs.map((m,i)=><ChatMessage key={i} role={m.role} time={m.time} author={m.author} meta={m.meta}>{m.text}</ChatMessage>)}
      {thinking&&<div style={{font:'var(--type-caption)',color:'var(--fg-3)',display:'flex',gap:6,alignItems:'center'}}><Icon name="sparkle" size={12} color="var(--plum-500)"/>Tutor is thinking…</div>}
    </div></div>
    <div style={{maxWidth:720,width:'100%',margin:'0 auto',padding:'0 28px 24px'}}>
      <div style={{display:'flex',alignItems:'flex-end',gap:8,padding:8,background:paused?'var(--sand-100)':'var(--surface-card)',border:'1px solid var(--border-2)',borderRadius:'var(--radius-lg)',boxShadow:'var(--shadow-sm)'}}>
        <IconButton icon="paperclip" label="Attach file" disabled={paused}/>
        <textarea rows={1} value={v} disabled={paused} onChange={e=>setV(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} placeholder={paused?'Your teacher paused the tutor.':'Ask your tutor…'} style={{flex:1,resize:'none',border:0,outline:0,background:'transparent',font:'var(--type-body)',fontSize:15,padding:'8px 4px',color:'var(--fg-1)'}}/>
        <IconButton icon="arrow-up" label="Send" variant="primary" onClick={send} disabled={paused||!v.trim()}/></div>
      <div style={{font:'var(--type-caption)',color:'var(--fg-3)',textAlign:'center',marginTop:8}}>Your tutor helps you think it through. It won’t do the work for you.</div></div>
  </div>;
}
window.TutorChat=TutorChat;

})();
