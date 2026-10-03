import * as React from 'react';
/** Small rectangular chip for concepts, files and filters. */
export interface TagProps{
  children?:React.ReactNode;
  icon?:string;
  /** Shows a remove (x) affordance. */
  onRemove?:()=>void;
  /** Mono face, for file names and identifiers. */
  mono?:boolean;
  style?:React.CSSProperties;
}
export function Tag(props:TagProps):JSX.Element;
