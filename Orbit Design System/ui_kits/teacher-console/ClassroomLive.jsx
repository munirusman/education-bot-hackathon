(()=>{
const {StudentTile,Tabs,Card,Badge,Input,Tabs:T2}=window.OrbitDesignSystem_5c1997;
function ClassroomLive({students,selected,onSelect,sticking}){
  const[f,setF]=React.useState('all');
  const c=s=>students.filter(x=>x.status===s).length;
  const shown=students.filter(s=>f==='all'||s.status===f);
  return <div style={{display:'flex',flexDirection:'column',gap:20,minWidth:0}}>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:12}}>
      {[['Working',c('working'),'working'],['Stuck',c('stuck'),'stuck'],['Needs approval',c('approval'),'approval'],['Paused',c('paused'),'paused']].map(([l,n,t])=><Card key={l} padding={14}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}><Badge tone={t} dot pulse={false}>{l}</Badge></div><div style={{font:'400 36px/1 var(--font-serif)',color:'var(--fg-1)'}}>{n}</div></Card>)}
    </div>
    <Card eyebrow="Live · last 15 min" title="Where students are stuck">
      <div style={{display:'flex',flexDirection:'column',gap:8}}>{sticking.map(([t,n])=><div key={t} style={{display:'flex',alignItems:'center',gap:12}}><span style={{flex:'0 0 260px',font:'var(--type-body)'}}>{t}</span><span style={{flex:1,height:6,borderRadius:3,background:'var(--sand-100)'}}><span style={{display:'block',height:6,borderRadius:3,width:(n/12*100)+'%',background:'var(--amber-500)'}}/></span><span style={{font:'var(--fw-regular) 12px/1 var(--font-mono)',color:'var(--fg-2)',width:70,textAlign:'right'}}>{n} students</span></div>)}</div>
    </Card>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
      <Tabs items={[{id:'all',label:'All',count:students.length},{id:'stuck',label:'Stuck',count:c('stuck')},{id:'approval',label:'Needs approval',count:c('approval')},{id:'working',label:'Working',count:c('working')}]} value={f} onChange={setF}/>
      <div style={{width:240}}><Input icon="search" size="sm" placeholder="Search students"/></div></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12}}>
      {shown.map(s=><StudentTile key={s.id} name={s.name} status={s.status} minutes={s.minutes} topic={s.topic} lastMessage={s.last} hasNote={s.note} selected={selected===s.id} onClick={()=>onSelect(s.id)}/>)}</div>
  </div>;
}
window.ClassroomLive=ClassroomLive;

})();
