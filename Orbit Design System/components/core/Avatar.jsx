import React from 'react';
const P=[['var(--plum-100)','var(--plum-700)'],['var(--green-100)','var(--green-700)'],['var(--blue-100)','var(--blue-700)'],['var(--amber-100)','var(--amber-700)'],['var(--sand-100)','var(--sand-700)']];
const SC={working:'var(--state-working)',stuck:'var(--state-stuck)',approval:'var(--state-approval)',paused:'var(--state-paused)',offline:'var(--sand-300)'};
export function Avatar({name='',size=32,status,teacher,style}){
  const ini=name.split(' ').map(w=>w[0]).filter(Boolean).slice(0,2).join('').toUpperCase();
  let n=0;for(const c of name)n+=c.charCodeAt(0);const[bg,fg]=teacher?['var(--sun-300)','var(--sand-900)']:P[n%P.length];
  const d=Math.max(8,Math.round(size*.3));
  return <span style={{position:'relative',display:'inline-grid',placeItems:'center',flex:'none',width:size,height:size,borderRadius:'50%',background:bg,color:fg,font:'var(--fw-semibold) '+Math.round(size*.38)+'px/1 var(--font-sans)',...style}}>{ini}
    {status&&<span style={{position:'absolute',right:-1,bottom:-1,width:d,height:d,borderRadius:'50%',background:SC[status],boxShadow:'0 0 0 2px var(--surface-card)'}}/>}</span>;
}
