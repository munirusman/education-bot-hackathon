import React from 'react';
import {Switch} from '../forms/Switch.jsx';
import {Icon} from '../core/Icon.jsx';
export function RuleCard({rule,scope='All students',kind='behavior',enabled,defaultEnabled=true,onToggle,onEdit}){
  const[e,setE]=React.useState(defaultEnabled);const on=enabled!==undefined?enabled:e;
  const ic={behavior:'message-circle-question',permission:'shield',mode:'timer'}[kind]||'scroll-text';
  return <div style={{display:'flex',gap:12,alignItems:'flex-start',padding:'14px 16px',background:'var(--surface-card)',border:'1px solid var(--border-1)',borderRadius:'var(--radius-md)',opacity:on?1:.62}}>
    <span style={{flex:'none',width:28,height:28,borderRadius:'var(--radius-sm)',background:'var(--plum-50)',display:'grid',placeItems:'center'}}><Icon name={ic} size={15} color="var(--plum-600)"/></span>
    <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column',gap:6}}>
      <div style={{font:'var(--type-rule)',color:'var(--fg-1)'}}>{rule}</div>
      <div style={{display:'flex',alignItems:'center',gap:6,font:'var(--type-caption)',color:'var(--fg-3)'}}><Icon name="users" size={12}/>{scope}{onEdit&&<><span>·</span><button onClick={onEdit} style={{border:0,padding:0,background:'transparent',font:'inherit',color:'var(--text-link)',cursor:'pointer'}}>Edit</button></>}</div></div>
    <Switch size="sm" checked={on} onChange={v=>{if(enabled===undefined)setE(v);onToggle&&onToggle(v)}}/></div>;
}
