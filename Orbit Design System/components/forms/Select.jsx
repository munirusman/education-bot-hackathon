import React from 'react';
import {Field} from './Input.jsx';
import {Icon} from '../core/Icon.jsx';
export function Select({label,hint,error,options=[],value,defaultValue,onChange,size='md',disabled,style}){
  const h={sm:28,md:36,lg:44}[size]||36;
  return <Field label={label} hint={hint} error={error}><span style={{position:'relative',display:'flex'}}>
    <select value={value} defaultValue={defaultValue} onChange={onChange} disabled={disabled} style={{appearance:'none',WebkitAppearance:'none',width:'100%',height:h,padding:'0 32px 0 10px',background:'var(--surface-card)',border:'1px solid '+(error?'var(--red-500)':'var(--border-2)'),borderRadius:'var(--radius-sm)',font:'var(--type-body)',color:'var(--fg-1)',cursor:'pointer',outline:0,...style}}>
      {options.map(o=>typeof o==='string'?<option key={o} value={o}>{o}</option>:<option key={o.value} value={o.value}>{o.label}</option>)}</select>
    <Icon name="chevron-down" size={16} color="var(--fg-3)" style={{position:'absolute',right:10,top:'50%',marginTop:-8,pointerEvents:'none'}}/></span></Field>;
}
