import React from 'react';
import {Icon} from '../core/Icon.jsx';
const I={info:['info','var(--plum-300)'],success:['check-circle-2','#7cc49f'],warning:['triangle-alert','var(--sun-300)'],teacher:['sticky-note','var(--sun-300)']};
export function Toast({tone='info',title,message,action,onClose}){
  const[ic,c]=I[tone]||I.info;
  return <div role="status" style={{display:'flex',gap:12,alignItems:'flex-start',width:360,maxWidth:'100%',padding:'12px 14px',background:'var(--surface-inverse)',color:'var(--fg-inverse)',borderRadius:'var(--radius-md)',boxShadow:'var(--shadow-lg)',animation:'orbit-fade-up var(--dur-base) var(--ease-out)'}}>
    <Icon name={ic} size={18} color={c} style={{marginTop:1}}/>
    <div style={{flex:1,minWidth:0}}>{title&&<div style={{font:'var(--type-label)',fontSize:14}}>{title}</div>}{message&&<div style={{font:'var(--type-body)',fontSize:13,color:'var(--plum-200)',marginTop:2}}>{message}</div>}</div>
    {action&&<button onClick={action.onClick} style={{border:0,background:'transparent',color:'var(--sun-300)',font:'var(--type-label)',cursor:'pointer',padding:'2px 4px'}}>{action.label}</button>}
    {onClose&&<button aria-label="Dismiss" onClick={onClose} style={{border:0,background:'transparent',color:'var(--plum-300)',cursor:'pointer',padding:2,display:'grid'}}><Icon name="x" size={14}/></button>}</div>;
}
