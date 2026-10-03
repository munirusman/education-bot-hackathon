import React from 'react';
export function Card({eyebrow,title,actions,padding=16,interactive,selected,onClick,children,style}){
  const[h,setH]=React.useState(false);
  return <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{background:'var(--surface-card)',border:'1px solid '+(selected?'var(--plum-500)':'var(--border-1)'),borderRadius:'var(--radius-md)',boxShadow:selected?'0 0 0 1px var(--plum-500)':interactive&&h?'var(--shadow-md)':'var(--shadow-xs)',padding,cursor:interactive?'pointer':undefined,transition:'box-shadow var(--dur-base) var(--ease-out)',display:'flex',flexDirection:'column',gap:12,minWidth:0,...style}}>
    {(eyebrow||title||actions)&&<div style={{display:'flex',alignItems:'flex-start',gap:8}}><div style={{flex:1,minWidth:0}}>
      {eyebrow&&<div style={{font:'var(--type-eyebrow)',letterSpacing:'var(--ls-caps)',textTransform:'uppercase',color:'var(--fg-3)',marginBottom:4}}>{eyebrow}</div>}
      {title&&<div style={{font:'var(--type-h3)',color:'var(--fg-1)'}}>{title}</div>}</div>{actions}</div>}
    {children}</div>;
}
