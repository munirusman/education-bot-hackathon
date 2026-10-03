import * as React from 'react';
/** Hover label for icon buttons and truncated values. */
export interface TooltipProps{
  content:React.ReactNode;
  children:React.ReactNode;
  side?:'top'|'bottom';
  /** Force visible (docs). */
  open?:boolean;
}
export function Tooltip(props:TooltipProps):JSX.Element;
