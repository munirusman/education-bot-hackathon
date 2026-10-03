import React from 'react';
import {Icon} from './Icon.jsx';
function useHP(){const[h,setH]=React.useState(false);const[p,setP]=React.useState(false);return[{onMouseEnter:()=>setH(true),onMouseLeave:()=>{setH(false);setP(false)},onMouseDown:()=>setP(true),onMouseUp:()=>setP(false)},h,p];}
const V={
 primary:{bg:'var(--accent)',h:'var(--accent-hover)',p:'var(--accent-press)',fg:'var(--fg-on-brand)',bd:'transparent'},
 secondary:{bg:'var(--surface-card)',h:'var(--sand-50)',p:'var(--sand-100)',fg:'var(--fg-1)',bd:'var(--border-2)'},
 ghost:{bg:'transparent',h:'var(--sand-100)',p:'var(--sand-200)',fg:'var(--fg-1)',bd:'transparent'},
 teacher:{bg:'var(--sun-300)',h:'#ecc35e',p:'var(--sun-500)',fg:'var(--sand-900)',bd:'transparent'},
 danger:{bg:'var(--red-500)',h:'var(--red-700)',p:'var(--red-700)',fg:'#fff',bd:'transparent'},
};
const S={sm:{h:28,px:10,fs:13,ic:14,g:6},md:{h:36,px:14,fs:14,ic:16,g:8},lg:{h:44,px:18,fs:15,ic:18,g:8}};
export function Button({variant='primary',size='md',icon,iconRight,disabled,full,type='button',onClick,children,style}){
  const[ev,h,p]=useHP();const v=V[variant]||V.primary;const s=S[size]||S.md;
  return <button type={type} disabled={disabled} onClick={onClick} {...ev} style={{display:full?'flex':'inline-flex',width:full?'100%':undefined,alignItems:'center',justifyContent:'center',gap:s.g,height:s.h,padding:'0 '+s.px+'px',borderRadius:'var(--radius-sm)',border:'1px solid '+v.bd,background:disabled?'var(--sand-100)':p?v.p:h?v.h:v.bg,color:disabled?'var(--fg-3)':v.fg,font:'var(--fw-medium) '+s.fs+'px/1 var(--font-sans)',cursor:disabled?'not-allowed':'pointer',whiteSpace:'nowrap',transform:p&&!disabled?'translateY(1px)':'none',transition:'background var(--dur-fast) var(--ease-out),transform var(--dur-fast)',boxShadow:variant==='secondary'?'var(--shadow-xs)':'none',...style}}>
    {icon&&<Icon name={icon} size={s.ic}/>}{children}{iconRight&&<Icon name={iconRight} size={s.ic}/>}
  </button>;
}
