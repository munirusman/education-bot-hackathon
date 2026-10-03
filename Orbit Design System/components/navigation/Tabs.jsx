import React from 'react';
export function Tabs({items=[],value,onChange,variant='underline'}){
  if(variant==='segmented')return <div role="tablist" style={{display:'inline-flex',gap:2,padding:2,background:'var(--surface-sunken)',borderRadius:'var(--radius-sm)'}}>
    {items.map(it=>{const a=it.id===value;return <button key={it.id} role="tab" aria-selected={a} onClick={()=>onChange&&onChange(it.id)} style={{height:28,padding:'0 12px',border:0,borderRadius:4,background:a?'var(--surface-card)':'transparent',boxShadow:a?'var(--shadow-sm)':'none',font:'var(--type-label)',color:a?'var(--fg-1)':'var(--fg-2)',cursor:'pointer'}}>{it.label}</button>})}</div>;
  return <div role="tablist" style={{display:'flex',gap:20,borderBottom:'1px solid var(--border-1)'}}>
    {items.map(it=>{const a=it.id===value;return <button key={it.id} role="tab" aria-selected={a} onClick={()=>onChange&&onChange(it.id)} style={{display:'inline-flex',alignItems:'center',gap:6,height:40,padding:0,marginBottom:-1,border:0,borderBottom:'2px solid '+(a?'var(--accent)':'transparent'),background:'transparent',font:'var(--type-label)',fontSize:14,color:a?'var(--fg-1)':'var(--fg-2)',cursor:'pointer'}}>{it.label}
      {it.count!=null&&<span style={{minWidth:18,height:18,padding:'0 5px',borderRadius:9,display:'inline-grid',placeItems:'center',background:a?'var(--plum-100)':'var(--sand-100)',color:a?'var(--plum-700)':'var(--fg-2)',font:'var(--fw-medium) 11px/1 var(--font-sans)'}}>{it.count}</span>}</button>})}</div>;
}
