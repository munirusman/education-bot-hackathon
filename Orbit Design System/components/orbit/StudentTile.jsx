import React from 'react';
import {Avatar} from '../core/Avatar.jsx';
import {Badge} from '../core/Badge.jsx';
import {Icon} from '../core/Icon.jsx';
const L={working:'Working',stuck:'Stuck',approval:'Needs approval',paused:'Paused',offline:'Offline'};
export function StudentTile({name,status='working',topic,minutes,lastMessage,hasNote,selected,onClick}){
  const[h,setH]=React.useState(false);
  return <div onClick={onClick} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)} style={{display:'flex',flexDirection:'column',gap:10,padding:14,background:status==='offline'?'var(--sand-50)':'var(--surface-card)',border:'1px solid '+(selected?'var(--plum-500)':'var(--border-1)'),boxShadow:selected?'0 0 0 1px var(--plum-500)':h?'var(--shadow-md)':'var(--shadow-xs)',borderRadius:'var(--radius-md)',cursor:'pointer',transition:'box-shadow var(--dur-base) var(--ease-out)',minWidth:0}}>
    <div style={{display:'flex',alignItems:'center',gap:8}}><Avatar name={name} size={28}/><span style={{flex:1,minWidth:0,font:'var(--type-h3)',fontSize:14,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:status==='offline'?'var(--fg-3)':'var(--fg-1)'}}>{name}</span>{hasNote&&<Icon name="sticky-note" size={14} color="var(--teacher)" title="Teacher note"/>}</div>
    <div style={{display:'flex',alignItems:'center',gap:8}}><Badge tone={status==='offline'?'neutral':status} dot>{L[status]}</Badge>{minutes!=null&&<span style={{font:'var(--fw-regular) 11px/1 var(--font-mono)',color:'var(--fg-3)'}}>{minutes} min</span>}</div>
    {topic&&<div style={{font:'var(--type-caption)',color:'var(--fg-2)'}}>{topic}</div>}
    {lastMessage&&<div style={{font:'var(--type-body)',fontSize:13,color:'var(--fg-1)',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>“{lastMessage}”</div>}</div>;
}
