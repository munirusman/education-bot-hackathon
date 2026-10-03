import React from 'react';
const T={neutral:['var(--sand-100)','var(--sand-700)','var(--sand-400)'],brand:['var(--plum-50)','var(--plum-700)','var(--plum-500)'],working:['var(--state-working-bg)','var(--state-working-ink)','var(--state-working)'],stuck:['var(--state-stuck-bg)','var(--state-stuck-ink)','var(--state-stuck)'],approval:['var(--state-approval-bg)','var(--state-approval-ink)','var(--state-approval)'],paused:['var(--state-paused-bg)','var(--state-paused-ink)','var(--state-paused)'],danger:['var(--state-danger-bg)','var(--state-danger-ink)','var(--state-danger)'],teacher:['var(--sun-100)','var(--sun-700)','var(--sun-500)']};
export function Badge({tone='neutral',dot,pulse,children,style}){
  const[bg,fg,dc]=T[tone]||T.neutral;
  return <span style={{display:'inline-flex',alignItems:'center',gap:6,height:22,padding:'0 8px',borderRadius:'var(--radius-full)',background:bg,color:fg,font:'var(--fw-medium) 12px/1 var(--font-sans)',whiteSpace:'nowrap',...style}}>
    {dot&&<span style={{width:7,height:7,borderRadius:'50%',background:dc,animation:pulse||(pulse!==false&&tone==='stuck')?'orbit-pulse 1.8s infinite':'none'}}/>}{children}</span>;
}
