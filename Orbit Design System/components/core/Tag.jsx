import React from 'react';
import {Icon} from './Icon.jsx';
export function Tag({children,icon,onRemove,mono,style}){
  return <span style={{display:'inline-flex',alignItems:'center',gap:5,height:24,padding:onRemove?'0 4px 0 8px':'0 8px',borderRadius:'var(--radius-xs)',background:'var(--surface-sunken)',color:'var(--fg-1)',font:mono?'var(--fw-regular) 12px/1 var(--font-mono)':'var(--fw-medium) 12px/1 var(--font-sans)',whiteSpace:'nowrap',...style}}>
    {icon&&<Icon name={icon} size={13} color="var(--fg-2)"/>}{children}
    {onRemove&&<button type="button" aria-label="Remove" onClick={onRemove} style={{border:0,background:'transparent',padding:2,display:'grid',placeItems:'center',cursor:'pointer',color:'var(--fg-3)',borderRadius:3}}><Icon name="x" size={12}/></button>}
  </span>;
}
