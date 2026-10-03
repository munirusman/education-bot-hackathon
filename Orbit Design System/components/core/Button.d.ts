import * as React from 'react';
/**
 * Primary action control.
 * @startingPoint section="Core" subtitle="Buttons in every variant and size" viewport="700x260"
 */
export interface ButtonProps{
  /** primary = one per view; teacher = teacher intervention (note, override); danger = pause/stop/end. */
  variant?:'primary'|'secondary'|'ghost'|'teacher'|'danger';
  size?:'sm'|'md'|'lg';
  /** Lucide icon name shown before the label. */
  icon?:string;
  iconRight?:string;
  disabled?:boolean;
  full?:boolean;
  type?:'button'|'submit';
  onClick?:(e:React.MouseEvent)=>void;
  children?:React.ReactNode;
  style?:React.CSSProperties;
}
export function Button(props:ButtonProps):JSX.Element;
