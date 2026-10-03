(()=>{
const {Logo,Icon,Tag,Button}=window.OrbitDesignSystem_5c1997;
function Files({files,active,setActive}){
  return <aside style={{width:260,flex:'none',background:'var(--surface-page)',borderRight:'1px solid var(--border-1)',display:'flex',flexDirection:'column',padding:'18px 14px',gap:18}}>
    <div style={{padding:'0 10px'}}><Logo size={26}/></div>
    <div style={{display:'flex',flexDirection:'column',gap:4}}><div style={{font:'var(--type-eyebrow)',letterSpacing:'var(--ls-caps)',textTransform:'uppercase',color:'var(--fg-3)',padding:'0 6px 4px'}}>Algebra I · Ms. Ortega</div>
      {['Problem set 4.2','Factoring quadratics','Unit 3 review'].map((x,i)=><button key={x} style={{display:'flex',alignItems:'center',gap:8,height:34,padding:'0 8px',border:0,borderRadius:'var(--radius-sm)',background:i===1?'var(--plum-50)':'transparent',color:i===1?'var(--plum-700)':'var(--fg-2)',font:'var(--type-label)',fontSize:14,textAlign:'left',cursor:'pointer'}}><Icon name="message-square" size={15}/>{x}</button>)}</div>
    <div style={{display:'flex',flexDirection:'column',gap:6}}><div style={{font:'var(--type-eyebrow)',letterSpacing:'var(--ls-caps)',textTransform:'uppercase',color:'var(--fg-3)',padding:'0 6px'}}>Files your tutor can read</div>
      {files.map(f=><button key={f} onClick={()=>setActive(f)} style={{display:'flex',alignItems:'center',gap:8,padding:'8px',border:'1px solid '+(active===f?'var(--border-2)':'transparent'),borderRadius:'var(--radius-sm)',background:active===f?'var(--surface-card)':'transparent',font:'var(--type-rule)',fontSize:12,color:'var(--fg-1)',cursor:'pointer',textAlign:'left'}}><Icon name={f.endsWith('.jpg')?'image':'file-text'} size={15} color="var(--fg-2)"/>{f}</button>)}
      <Button variant="ghost" size="sm" icon="paperclip">Add a file</Button></div>
  </aside>;
}
window.Files=Files;

})();
