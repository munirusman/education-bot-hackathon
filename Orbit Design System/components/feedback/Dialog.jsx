import React from 'react';
import {IconButton} from '../core/IconButton.jsx';
export function Dialog({open=true,title,description,children,actions,onClose,width=440,inline}){
  if(!open)return null;
  const panel=<div role="dialog" aria-modal={!inline} style={{width,maxWidth:'100%',background:'var(--surface-card)',borderRadius:'var(--radius-lg)',boxShadow:'var(--shadow-lg)',border:'1px solid var(--border-1)',display:'flex',flexDirection:'column',animation:'orbit-fade-up var(--dur-slow) var(--ease-out)'}}>
    <div style={{display:'flex',gap:12,padding:'20px 20px 0'}}><div style={{flex:1}}><div style={{font:'var(--type-h2)',fontSize:18,color:'var(--fg-1)'}}>{title}</div>{description&&<div style={{font:'var(--type-body)',color:'var(--fg-2)',marginTop:6}}>{description}</div>}</div>{onClose&&<IconButton icon="x" label="Close" size="sm" onClick={onClose}/>}</div>
    {children&&<div style={{padding:'16px 20px 0'}}>{children}</div>}
    {actions&&<div style={{display:'flex',justifyContent:'flex-end',gap:8,padding:20}}>{actions}</div>}</div>;
  if(inline)return panel;
  return <div onClick={e=>{if(e.target===e.currentTarget&&onClose)onClose()}} style={{position:'fixed',inset:0,background:'var(--overlay-scrim)',display:'grid',placeItems:'center',padding:24,zIndex:100}}>{panel}</div>;
}
