import React from 'react';
import {Icon} from '../core/Icon.jsx';
import {Button} from '../core/Button.jsx';
import {Avatar} from '../core/Avatar.jsx';
export function ActionRequest({student,action,detail,time,state='pending',onApprove,onDeny}){
  return <div style={{display:'flex',flexDirection:'column',gap:10,padding:14,background:'var(--surface-card)',border:'1px solid '+(state==='pending'?'var(--blue-500)':'var(--border-1)'),borderRadius:'var(--radius-md)'}}>
    <div style={{display:'flex',alignItems:'center',gap:8}}>{student&&<Avatar name={student} size={22}/>}<span style={{font:'var(--type-label)',color:'var(--fg-1)'}}>{student?student+'’s tutor':'Tutor'} wants to {action}</span>{time&&<span style={{marginLeft:'auto',font:'var(--type-caption)',color:'var(--fg-3)'}}>{time}</span>}</div>
    {detail&&<div style={{font:'var(--type-rule)',fontSize:12,padding:'8px 10px',background:'var(--surface-sunken)',borderRadius:'var(--radius-sm)',color:'var(--fg-1)',whiteSpace:'pre-wrap'}}>{detail}</div>}
    {state==='pending'?<div style={{display:'flex',gap:8}}><Button size="sm" icon="check" onClick={onApprove}>Approve</Button><Button size="sm" variant="secondary" onClick={onDeny}>Deny</Button></div>
    :<div style={{display:'flex',alignItems:'center',gap:6,font:'var(--type-caption)',color:state==='approved'?'var(--state-working-ink)':'var(--state-danger-ink)'}}><Icon name={state==='approved'?'check':'x'} size={13}/>{state==='approved'?'Approved':'Denied'}</div>}</div>;
}
