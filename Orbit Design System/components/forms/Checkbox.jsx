import React from 'react';
import {Icon} from '../core/Icon.jsx';
export function Checkbox({label,description,checked,defaultChecked,onChange,disabled,name,value}){
  const[c,setC]=React.useState(!!defaultChecked);const on=checked!==undefined?checked:c;
  const t=()=>{if(disabled)return;if(checked===undefined)setC(!on);onChange&&onChange(!on);};
  return <label onClick={e=>{e.preventDefault();t()}} style={{display:'flex',gap:10,alignItems:'flex-start',cursor:disabled?'not-allowed':'pointer',opacity:disabled?.5:1}}>
    <span role="checkbox" aria-checked={on} tabIndex={0} onKeyDown={e=>{if(e.key===' '){e.preventDefault();t()}}} style={{flex:'none',width:18,height:18,marginTop:1,display:'grid',placeItems:'center',borderRadius:'var(--radius-xs)',border:'1.5px solid '+(on?'var(--accent)':'var(--sand-400)'),background:on?'var(--accent)':'var(--surface-card)',transition:'all var(--dur-fast)'}}>
      {on&&<Icon name="check" size={13} color="#fff"/>}</span>
    {(label||description)&&<span style={{display:'flex',flexDirection:'column',gap:2}}>{label&&<span style={{font:'var(--type-label)',fontWeight:400,fontSize:14,color:'var(--fg-1)'}}>{label}</span>}{description&&<span style={{font:'var(--type-caption)',color:'var(--fg-3)'}}>{description}</span>}</span>}
  </label>;
}
