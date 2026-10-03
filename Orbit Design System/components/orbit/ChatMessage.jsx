import React from 'react';
import {Avatar} from '../core/Avatar.jsx';
import {Icon} from '../core/Icon.jsx';
export function ChatMessage({role='tutor',author,time,meta,children}){
  if(role==='system')return <div style={{display:'flex',alignItems:'center',gap:8,justifyContent:'center',font:'var(--type-caption)',color:'var(--fg-3)',padding:'4px 0'}}><Icon name="info" size={13}/>{children}</div>;
  if(role==='teacher')return <div style={{display:'flex',gap:10,padding:'12px 14px',background:'var(--surface-teacher)',borderRadius:'var(--radius-md)'}}>
    <Avatar name={author||'Teacher'} teacher size={26}/><div style={{flex:1,minWidth:0}}><div style={{display:'flex',gap:8,alignItems:'baseline'}}><span style={{font:'var(--type-label)',color:'var(--sun-700)'}}>{author||'Your teacher'}</span><span style={{font:'var(--type-eyebrow)',letterSpacing:'var(--ls-caps)',textTransform:'uppercase',color:'var(--sun-700)'}}>Teacher</span>{time&&<span style={{font:'var(--type-caption)',color:'var(--fg-3)',marginLeft:'auto'}}>{time}</span>}</div><div style={{font:'var(--type-body)',color:'var(--fg-1)',marginTop:3}}>{children}</div></div></div>;
  const me=role==='student';
  return <div style={{display:'flex',flexDirection:'column',alignItems:me?'flex-end':'flex-start',gap:4}}>
    <div style={{display:'flex',gap:6,alignItems:'center',font:'var(--type-caption)',color:'var(--fg-3)'}}>{!me&&<span style={{width:16,height:16,borderRadius:'50%',background:'var(--plum-600)',display:'grid',placeItems:'center'}}><Icon name="sparkle" size={10} color="#fff"/></span>}<span style={{color:'var(--fg-2)',fontWeight:500}}>{author||(me?'You':'Tutor')}</span>{time&&<span>{time}</span>}</div>
    <div style={{maxWidth:'82%',padding:me?'9px 13px':'2px 0',background:me?'var(--plum-600)':'transparent',color:me?'#fff':'var(--fg-1)',borderRadius:me?'14px 14px 4px 14px':0,font:me?'var(--type-body)':'var(--type-body-lg)',fontSize:me?14:15,whiteSpace:'pre-wrap'}}>{children}</div>
    {meta&&<div style={{display:'inline-flex',alignItems:'center',gap:5,font:'var(--fw-regular) 11px/1.3 var(--font-mono)',color:'var(--fg-3)'}}><Icon name="shield-check" size={12}/>{meta}</div>}</div>;
}
