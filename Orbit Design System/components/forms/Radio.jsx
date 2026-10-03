import React from 'react';
import {Icon} from '../core/Icon.jsx';
export function Radio({label,description,checked,defaultChecked,onChange,disabled,name,value}){
  const[c,setC]=React.useState(!!defaultChecked);const on=checked!==undefined?checked:c;
  const t=()=>{if(disabled)return;if(checked===undefined)setC(true);onChange&&onChange(true);};
  return <label onClick={e=>{e.preventDefault();t()}} style={{display:'flex',gap:10,alignItems:'flex-start',cursor:disabled?'not-allowed':'pointer',opacity:disabled?.5:1}}>
    <span role="radio" aria-checked={on} tabIndex={0} onKeyDown={e=>{if(e.key===' '){e.preventDefault();t()}}} style={{flex:'none',width:18,height:18,marginTop:1,display:'grid',placeItems:'center',borderRadius:'50%',border:'1.5px solid '+(on?'var(--accent)':'var(--sand-400)'),background:'var(--surface-card)',transition:'all var(--dur-fast)'}}>
      {on&&<span style={{width:8,height:8,borderRadius:'50%',background:'var(--accent)'}}/>}</span>
    {(label||description)&&<span style={{display:'flex',flexDirection:'column',gap:2}}>{label&&<span style={{font:'var(--type-label)',fontWeight:400,fontSize:14,color:'var(--fg-1)'}}>{label}</span>}{description&&<span style={{font:'var(--type-caption)',color:'var(--fg-3)'}}>{description}</span>}</span>}
  </label>;
}
