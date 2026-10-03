(()=>{
const {RuleCard,Textarea,Select,Button,Card,Checkbox}=window.OrbitDesignSystem_5c1997;
function RulesView({rules,setRules,toast}){
  const[text,setText]=React.useState('');const[scope,setScope]=React.useState('All students');
  const add=()=>{if(!text.trim())return;setRules(r=>[...r,{id:'r'+Date.now(),kind:'behavior',rule:text,scope}]);setText('');toast('Rule applied to '+(scope==='All students'?'28 tutors':scope))};
  return <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 340px',gap:24,alignItems:'start'}}>
    <div style={{display:'flex',flexDirection:'column',gap:10}}>{rules.map(r=><RuleCard key={r.id} kind={r.kind} rule={r.rule} scope={r.scope} defaultEnabled={!r.off} onEdit={()=>{}}/>)}</div>
    <Card eyebrow="New rule" title="Tell the tutors how to behave">
      <Textarea mono rows={3} value={text} onChange={e=>setText(e.target.value)} placeholder="Give hints, but never reveal the final answer." hint="Write it the way you’d say it to a teaching assistant."/>
      <Select label="Applies to" value={scope} onChange={e=>setScope(e.target.value)} options={['All students','Maya Kim','Leo Park','Test mode']}/>
      <Checkbox label="Tell students about this rule" description="Shown at the top of their tutor." defaultChecked/>
      <Button full icon="check" onClick={add}>Apply rule</Button></Card>
  </div>;
}
window.RulesView=RulesView;

})();
