import React from 'react';
export function Switch({checked,defaultChecked,onChange,label,disabled,size='md'}){
  const[c,setC]=React.useState(!!defaultChecked);const on=checked!==undefined?checked:c;
  const w=size==='sm'?28:36,h=size==='sm'?16:20,k=h-4;
  const t=()=>{if(disabled)return;if(checked===undefined)setC(!on);onChange&&onChange(!on)};
  return <label style={{display:'inline-flex',alignItems:'center',gap:8,cursor:disabled?'not-allowed':'pointer',opacity:disabled?.5:1}} onClick={e=>{e.preventDefault();t()}}>
    <span role="switch" aria-checked={on} tabIndex={0} onKeyDown={e=>{if(e.key===' '){e.preventDefault();t()}}} style={{position:'relative',flex:'none',width:w,height:h,borderRadius:h,background:on?'var(--accent)':'var(--sand-300)',transition:'background var(--dur-base) var(--ease-out)'}}>
      <span style={{position:'absolute',top:2,left:on?w-k-2:2,width:k,height:k,borderRadius:'50%',background:'#fff',boxShadow:'0 1px 2px rgba(0,0,0,.2)',transition:'left var(--dur-base) var(--ease-out)'}}/></span>
    {label&&<span style={{font:'var(--type-body)',color:'var(--fg-1)'}}>{label}</span>}</label>;
}
