import * as React from 'react';
/** White surface with a hairline border. The default container in Orbit. */
export interface CardProps{
  /** Mono uppercase label above the title. */
  eyebrow?:React.ReactNode;
  title?:React.ReactNode;
  /** Right-aligned header slot (IconButton, Badge). */
  actions?:React.ReactNode;
  padding?:number|string;
  /** Hover lift + pointer. */
  interactive?:boolean;
  /** Plum outline for the focused item. */
  selected?:boolean;
  onClick?:()=>void;
  children?:React.ReactNode;
  style?:React.CSSProperties;
}
export function Card(props:CardProps):JSX.Element;
