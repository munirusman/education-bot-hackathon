import React from 'react';
import {Icon} from '../core/Icon.jsx';
export function Field({label,hint,error,children}){
  return <label style={{display:'flex',flexDirection:'column',gap:6,minWidth:0}}>
    {label&&<span style={{font:'var(--type-label)',color:'var(--fg-1)'}}>{label}</span>}{children}
    {(error||hint)&&<span style={{font:'var(--type-caption)',color:error?'var(--state-danger-ink)':'var(--fg-3)'}}>{error||hint}</span>}</label>;
}
export function Input({label,hint,error,icon,size='md',value,defaultValue,onChange,placeholder,disabled,type='text',style}){
  const[f,setF]=React.useState(false);const h={sm:28,md:36,lg:44}[size]||36;
  return <Field label={label} hint={hint} error={error}><span style={{display:'flex',alignItems:'center',gap:8,height:h,padding:'0 10px',background:disabled?'var(--sand-50)':'var(--surface-card)',border:'1px solid '+(error?'var(--red-500)':f?'var(--border-focus)':'var(--border-2)'),borderRadius:'var(--radius-sm)',boxShadow:f?'var(--ring-focus)':'none',transition:'box-shadow var(--dur-fast)',...style}}>
    {icon&&<Icon name={icon} size={16} color="var(--fg-3)"/>}
    <input type={type} value={value} defaultValue={defaultValue} onChange={onChange} placeholder={placeholder} disabled={disabled} onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={{flex:1,minWidth:0,border:0,outline:0,background:'transparent',font:'var(--type-body)',color:'var(--fg-1)'}}/></span></Field>;
}
