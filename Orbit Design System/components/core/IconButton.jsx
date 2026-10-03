import React from 'react';
import {Icon} from './Icon.jsx';
function useHP(){const[h,setH]=React.useState(false);const[p,setP]=React.useState(false);return[{onMouseEnter:()=>setH(true),onMouseLeave:()=>{setH(false);setP(false)},onMouseDown:()=>setP(true),onMouseUp:()=>setP(false)},h,p];}
export function IconButton({icon,label,variant='ghost',size='md',active,disabled,onClick,style}){
  const[ev,h,p]=useHP();const d={sm:28,md:36,lg:44}[size]||36;const ic={sm:14,md:16,lg:18}[size]||16;
  const bg=variant==='primary'?(h?'var(--accent-hover)':'var(--accent)'):variant==='secondary'?(h?'var(--sand-50)':'var(--surface-card)'):(active?'var(--plum-50)':h?'var(--sand-100)':'transparent');
  const fg=variant==='primary'?'#fff':active?'var(--fg-brand)':'var(--fg-2)';
  return <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} {...ev} style={{width:d,height:d,display:'inline-grid',placeItems:'center',borderRadius:'var(--radius-sm)',border:variant==='secondary'?'1px solid var(--border-2)':'1px solid transparent',background:bg,color:h&&variant==='ghost'&&!active?'var(--fg-1)':fg,cursor:disabled?'not-allowed':'pointer',opacity:disabled?.45:1,transform:p?'translateY(1px)':'none',transition:'background var(--dur-fast)',padding:0,...style}}><Icon name={icon} size={ic}/></button>;
}
