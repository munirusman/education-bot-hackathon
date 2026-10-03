(()=>{
const {Avatar,Badge,IconButton,Button,ChatMessage,ActionRequest,RuleCard,Textarea,Tabs,Dialog}=window.OrbitDesignSystem_5c1997;
function SessionPanel({student,transcript,onClose,onUpdate,toast}){
  const[tab,setTab]=React.useState('session');const[note,setNote]=React.useState('');const[msgs,setMsgs]=React.useState(transcript);const[confirm,setConfirm]=React.useState(false);const[req,setReq]=React.useState('pending');
  React.useEffect(()=>{setMsgs(transcript);setTab('session');setReq('pending')},[student.id]);
  const L={working:'Working',stuck:'Stuck',approval:'Needs approval',paused:'Paused',offline:'Offline'};
  const send=()=>{if(!note.trim())return;setMsgs(m=>[...m,{role:'teacher',time:'now',text:note}]);setNote('');onUpdate({note:true});toast('Note sent to '+student.name.split(' ')[0])};
  const paused=student.status==='paused';
  return <aside style={{width:420,flex:'none',borderLeft:'1px solid var(--border-1)',background:'var(--surface-card)',display:'flex',flexDirection:'column',minHeight:0}}>
    <div style={{padding:'16px 18px 0',display:'flex',flexDirection:'column',gap:12}}>
      <div style={{display:'flex',alignItems:'center',gap:10}}><Avatar name={student.name} size={36}/><div style={{flex:1,minWidth:0}}><div style={{font:'var(--type-h3)'}}>{student.name}</div><div style={{font:'var(--type-caption)',color:'var(--fg-3)'}}>{student.topic}</div></div><Badge tone={student.status==='offline'?'neutral':student.status} dot>{L[student.status]}</Badge><IconButton icon="x" label="Close" size="sm" onClick={onClose}/></div>
      <div style={{display:'flex',gap:8}}>{paused?<Button size="sm" icon="play" onClick={()=>{onUpdate({status:'working',topic:'Factoring quadratics'});toast('Tutor resumed')}}>Resume tutor</Button>:<Button size="sm" variant="danger" icon="pause" onClick={()=>setConfirm(true)}>Pause tutor</Button>}<Button size="sm" variant="secondary" icon="sliders-horizontal" onClick={()=>setTab('rules')}>Change behavior</Button></div>
      <Tabs items={[{id:'session',label:'Session'},{id:'rules',label:'Rules',count:3},{id:'files',label:'Files',count:2}]} value={tab} onChange={setTab}/></div>
    <div style={{flex:1,overflow:'auto',padding:18,display:'flex',flexDirection:'column',gap:14,background:tab==='session'?'var(--surface-page)':'var(--surface-card)'}}>
      {tab==='session'&&<>{student.status==='approval'&&<ActionRequest student={student.name} action="run code" detail={'python3 check_factors.py\n# expands (x+3)(x-2)'} time="1 min ago" state={req} onApprove={()=>{setReq('approved');onUpdate({status:'working'});toast('Approved once for '+student.name.split(' ')[0])}} onDeny={()=>{setReq('denied');onUpdate({status:'working'})}}/>}
        {msgs.map((m,i)=><ChatMessage key={i} role={m.role} time={m.time} author={m.role==='teacher'?'Ms. Ortega':m.role==='student'?student.name.split(' ')[0]:undefined} meta={m.meta}>{m.text}</ChatMessage>)}
        {paused&&<ChatMessage role="system">You paused this tutor.</ChatMessage>}</>}
      {tab==='rules'&&<><div style={{font:'var(--type-caption)',color:'var(--fg-3)'}}>Rules applied to {student.name.split(' ')[0]}’s tutor right now.</div><RuleCard rule="Give hints, but never reveal the final answer." scope="All students"/><RuleCard rule="This student needs more scaffolding." scope={student.name}/><RuleCard kind="permission" rule="Let students read files, but don’t let them run code." scope="All students"/></>}
      {tab==='files'&&<div style={{display:'flex',flexDirection:'column',gap:8}}>{['worksheet-4.2.pdf','my-work.jpg'].map(f=><div key={f} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',border:'1px solid var(--border-1)',borderRadius:'var(--radius-sm)',font:'var(--type-rule)'}}>{f}<span style={{marginLeft:'auto',font:'var(--type-caption)',color:'var(--fg-3)'}}>Tutor can read</span></div>)}</div>}
    </div>
    {tab==='session'&&<div style={{padding:14,borderTop:'1px solid var(--border-1)',display:'flex',flexDirection:'column',gap:8,background:'var(--surface-card)'}}>
      <Textarea rows={2} value={note} onChange={e=>setNote(e.target.value)} placeholder={'Leave a note for '+student.name.split(' ')[0]+'…'}/>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{font:'var(--type-caption)',color:'var(--fg-3)'}}>Appears in the student’s session as a teacher note.</span><Button size="sm" variant="teacher" icon="sticky-note" onClick={send}>Send note</Button></div></div>}
    <Dialog open={confirm} title={'Pause '+student.name.split(' ')[0]+'’s tutor?'} description={student.name.split(' ')[0]+' will see “Your teacher paused the tutor.” You can resume anytime.'} onClose={()=>setConfirm(false)} actions={<><Button variant="secondary" onClick={()=>setConfirm(false)}>Cancel</Button><Button variant="danger" icon="pause" onClick={()=>{setConfirm(false);onUpdate({status:'paused',topic:'Paused by you'});toast('Tutor paused')}}>Pause tutor</Button></>}/>
  </aside>;
}
window.SessionPanel=SessionPanel;

})();
