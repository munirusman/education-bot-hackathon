(()=>{
const {Switch:Sw}=window.OrbitDesignSystem_5c1997;
function StudentApp(){
  const[msgs,setMsgs]=React.useState([
    {role:'system',text:'Ms. Ortega set this tutor to give hints only.'},
    {role:'student',time:'10:38',text:'How do I factor x² + x − 6?'},
    {role:'tutor',time:'10:38',text:'Start by looking for two numbers. What should they multiply to, and what should they add to?',meta:'Hint given · answer withheld'},
    {role:'student',time:'10:40',text:'Multiply to −6 and add to 1. So 3 and −2?'},
    {role:'tutor',time:'10:40',text:'Good. Now write it as two binomials and expand them to check. What do you get for the middle term?'}
  ]);
  const[thinking,setThinking]=React.useState(false);const[paused,setPaused]=React.useState(false);const[active,setActive]=React.useState('worksheet-4.2.pdf');const n=React.useRef(0);
  const replies=[['Look at the outer and inner products separately. What is x·(−2)? What is 3·x?','Hint given · answer withheld'],['Close. Add those two together. Does the sum match the middle term in your original expression?','Hint given · answer withheld'],['I can’t give you the final answer, but you’re one step away. Try writing out the expansion line by line.','Rule: Give hints, but never reveal the final answer.']];
  const send=t=>{setMsgs(m=>[...m,{role:'student',time:'now',text:t}]);setThinking(true);const r=replies[n.current++%replies.length];
    setTimeout(()=>{setThinking(false);setMsgs(m=>[...m,{role:'tutor',time:'now',text:r[0],meta:r[1]}]);
      if(n.current===2)setTimeout(()=>setMsgs(m=>[...m,{role:'teacher',author:'Ms. Ortega',time:'now',text:'Nice persistence, Maya. Check the sign on your second number.'}]),1200)},900)};
  return <div style={{display:'flex',height:'100%'}}>
    <Files files={['worksheet-4.2.pdf','my-work.jpg']} active={active} setActive={setActive}/>
    <TutorChat msgs={paused?[...msgs,{role:'system',text:'Your teacher paused the tutor.'}]:msgs} onSend={send} paused={paused} thinking={thinking}/>
    <div style={{position:'fixed',right:16,bottom:16,padding:'8px 12px',background:'var(--surface-card)',border:'1px dashed var(--border-2)',borderRadius:'var(--radius-sm)',font:'var(--type-caption)',color:'var(--fg-3)',display:'flex',gap:8,alignItems:'center'}}>Demo: <Sw size="sm" checked={paused} onChange={setPaused} label="Teacher paused"/></div>
  </div>;
}
ReactDOM.createRoot(document.getElementById('root')).render(<StudentApp/>);

})();
