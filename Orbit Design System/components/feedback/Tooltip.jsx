import React from 'react';
export function Tooltip({content,children,side='top',open}){
  const[h,setH]=React.useState(false);const show=open!==undefined?open:h;
  const pos=side==='bottom'?{top:'100%',marginTop:6}:{bottom:'100%',marginBottom:6};
  return <span style={{position:'relative',display:'inline-flex'}} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}>{children}
    {show&&<span role="tooltip" style={{position:'absolute',left:'50%',transform:'translateX(-50%)',...pos,whiteSpace:'nowrap',padding:'5px 8px',borderRadius:'var(--radius-xs)',background:'var(--sand-900)',color:'var(--sand-25)',font:'var(--type-caption)',pointerEvents:'none',zIndex:50,animation:'orbit-fade-up var(--dur-fast) var(--ease-out)'}}>{content}</span>}</span>;
}
