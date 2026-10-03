import * as React from 'react';
/** Square icon-only button. Always pass a label (used for aria-label and native tooltip). */
export interface IconButtonProps{
  icon:string;
  label:string;
  variant?:'ghost'|'secondary'|'primary';
  size?:'sm'|'md'|'lg';
  /** Toggled-on state (plum tint). */
  active?:boolean;
  disabled?:boolean;
  onClick?:(e:React.MouseEvent)=>void;
  style?:React.CSSProperties;
}
export function IconButton(props:IconButtonProps):JSX.Element;
