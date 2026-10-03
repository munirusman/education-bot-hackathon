import React from 'react';
const C={plum:['var(--plum-700)','var(--plum-600)','var(--sun-500)'],white:['#fff','#fff','var(--sun-300)'],ink:['var(--sand-900)','var(--sand-900)','var(--sun-500)']};
function Cap({ink,sun}){return <svg viewBox="0 0 40 30" style={{display:'block',width:'100%',overflow:'visible',transform:'rotate(-10deg)'}}><path d="M20 4L38 11L20 18L2 11Z" fill={ink}/><path d="M20 11L32 14V21" fill="none" stroke={sun} strokeWidth="2"/><circle cx="32" cy="24" r="3.5" fill={sun}/></svg>;}
export function Logo({variant='full',size=32,tone='plum',style}){
  const[word,ink,sun]=C[tone]||C.plum;
  if(variant==='mark'){const ring=size*.44,bw=Math.max(2,size*.11);
    return <span role="img" aria-label="Orbit" style={{position:'relative',display:'inline-block',width:size,height:size,flex:'none',...style}}>
      <span style={{position:'absolute',left:'50%',bottom:size*.08,width:ring,height:ring,marginLeft:-ring/2,borderRadius:'50%',border:bw+'px solid '+ink,boxSizing:'border-box'}}/>
      <span style={{position:'absolute',left:'50%',top:size*.06,width:size*.78,marginLeft:-size*.39}}><Cap ink={ink} sun={sun}/></span></span>;}
  return <span role="img" aria-label="Orbit" style={{display:'inline-flex',alignItems:'baseline',font:'700 '+size+'px/1 var(--font-sans)',letterSpacing:'-.045em',color:word,whiteSpace:'nowrap',paddingTop:size*.3,...style}}>
    <span aria-hidden="true" style={{position:'relative',display:'inline-block',lineHeight:1}}>o<span style={{position:'absolute',left:'50%',bottom:'.48em',width:'.66em',marginLeft:'-.33em'}}><Cap ink={tone==='plum'?ink:word} sun={sun}/></span></span><span aria-hidden="true">rbit</span></span>;
}
