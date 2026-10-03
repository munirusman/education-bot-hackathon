(()=>{
const {Button,Switch,Toast,Badge,Icon}=window.OrbitDesignSystem_5c1997;
function TeacherApp(){
  const D=window.ORBIT_DATA;
  const[view,setView]=React.useState('live');const[students,setStudents]=React.useState(D.students);const[sel,setSel]=React.useState(1);const[rules,setRules]=React.useState(D.rules);const[test,setTest]=React.useState(false);const[t,setT]=React.useState(null);
  const toast=m=>{setT(m);clearTimeout(window.__tt);window.__tt=setTimeout(()=>setT(null),2600)};
  const student=students.find(s=>s.id===sel);
  const upd=p=>setStudents(ss=>ss.map(s=>s.id===sel?{...s,...p}:s));
  const titles={live:'Live classroom',rules:'Tutor rules',insights:'Insights',files:'Class files'};
  return <div style={{display:'flex',height:'100%',background:'var(--bg-app)'}}>
    <Sidebar view={view} setView={setView} klass={D.klass}/>
    <main style={{flex:1,minWidth:0,display:'flex',flexDirection:'column'}}>
      <header style={{height:'var(--topbar-h)',flex:'none',display:'flex',alignItems:'center',gap:14,padding:'0 28px',borderBottom:'1px solid var(--border-1)',background:'var(--surface-page)'}}>
        <h1 style={{margin:0,font:'var(--type-h1)',fontSize:26,letterSpacing:'var(--ls-display)'}}>{titles[view]}</h1>
        {view==='live'&&<span style={{display:'inline-flex',alignItems:'center',gap:6,font:'var(--type-caption)',color:'var(--state-working-ink)'}}><span style={{width:7,height:7,borderRadius:'50%',background:'var(--state-working)'}}/>Live · 26 of 28 signed in</span>}
        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:14}}>{test&&<Badge tone="teacher">Test mode on</Badge>}<Switch checked={test} onChange={v=>{setTest(v);toast(v?'Test mode on — tutors will only clarify questions':'Test mode off')}} label="Test mode"/><Button variant="secondary" size="sm" icon="pause">Pause all</Button></div>
      </header>
      <div style={{flex:1,minHeight:0,display:'flex'}}>
        <div style={{flex:1,minWidth:0,overflow:'auto',padding:28}}>
          {view==='live'&&<ClassroomLive students={students} selected={sel} onSelect={setSel} sticking={D.sticking}/>}
          {view==='rules'&&<RulesView rules={rules} setRules={setRules} toast={toast}/>}
          {(view==='insights'||view==='files')&&<div style={{padding:60,textAlign:'center',color:'var(--fg-3)',font:'var(--type-body)'}}>Not designed yet.</div>}
        </div>
        {view==='live'&&student&&<SessionPanel student={student} transcript={sel===1?D.transcript:[{role:'student',time:'10:41',text:student.last||'—'},{role:'tutor',time:'10:41',text:'Let’s look at that together. What have you tried so far?',meta:'Hint given · answer withheld'}]} onClose={()=>setSel(null)} onUpdate={upd} toast={toast}/>}
      </div>
    </main>
    {t&&<div style={{position:'fixed',left:'calc(var(--sidebar-w) + 24px)',bottom:24,zIndex:200}}><Toast tone="success" title={t}/></div>}
  </div>;
}
ReactDOM.createRoot(document.getElementById('root')).render(<TeacherApp/>);

})();
