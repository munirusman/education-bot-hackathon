(()=>{
const {Logo,Icon,Avatar}=window.OrbitDesignSystem_5c1997;
function Sidebar({view,setView,klass}){
  const items=[['live','layout-grid','Live classroom'],['rules','scroll-text','Tutor rules'],['insights','chart-no-axes-column','Insights'],['files','folder','Class files']];
  return <aside style={{width:'var(--sidebar-w)',flex:'none',background:'var(--surface-page)',borderRight:'1px solid var(--border-1)',display:'flex',flexDirection:'column',padding:'18px 12px',gap:18}}>
    <div style={{padding:'0 10px'}}><Logo size={26}/></div>
    <div style={{padding:'0 10px'}}><div style={{font:'var(--type-eyebrow)',letterSpacing:'var(--ls-caps)',textTransform:'uppercase',color:'var(--fg-3)',marginBottom:6}}>Class</div>
      <button style={{width:'100%',display:'flex',alignItems:'center',gap:8,height:36,padding:'0 10px',border:'1px solid var(--border-2)',borderRadius:'var(--radius-sm)',background:'var(--surface-card)',font:'var(--type-label)',color:'var(--fg-1)',cursor:'pointer'}}><span style={{flex:1,textAlign:'left'}}>{klass}</span><Icon name="chevrons-up-down" size={14} color="var(--fg-3)"/></button></div>
    <nav style={{display:'flex',flexDirection:'column',gap:2}}>{items.map(([id,ic,l])=>{const a=view===id;return <button key={id} onClick={()=>setView(id)} style={{display:'flex',alignItems:'center',gap:10,height:34,padding:'0 10px',border:0,borderRadius:'var(--radius-sm)',background:a?'var(--plum-50)':'transparent',color:a?'var(--plum-700)':'var(--fg-2)',font:'var(--type-label)',fontSize:14,cursor:'pointer',textAlign:'left'}}><Icon name={ic} size={16}/>{l}</button>})}</nav>
    <div style={{marginTop:'auto',display:'flex',alignItems:'center',gap:10,padding:'8px 10px'}}><Avatar name="Ana Ortega" teacher size={28}/><div><div style={{font:'var(--type-label)'}}>Ana Ortega</div><div style={{font:'var(--type-caption)',color:'var(--fg-3)'}}>Lincoln High</div></div></div>
  </aside>;
}
window.Sidebar=Sidebar;

})();
