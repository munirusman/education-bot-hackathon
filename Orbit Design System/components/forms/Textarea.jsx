import React from 'react';
import {Field} from './Input.jsx';
export function Textarea({label,hint,error,rows=3,mono,value,defaultValue,onChange,placeholder,disabled,style}){
  const[f,setF]=React.useState(false);
  return <Field label={label} hint={hint} error={error}><textarea rows={rows} value={value} defaultValue={defaultValue} onChange={onChange} placeholder={placeholder} disabled={disabled} onFocus={()=>setF(true)} onBlur={()=>setF(false)} style={{resize:'vertical',padding:'8px 10px',background:'var(--surface-card)',border:'1px solid '+(error?'var(--red-500)':f?'var(--border-focus)':'var(--border-2)'),borderRadius:'var(--radius-sm)',boxShadow:f?'var(--ring-focus)':'none',outline:0,font:mono?'var(--type-rule)':'var(--type-body)',color:'var(--fg-1)',...style}}/></Field>;
}
