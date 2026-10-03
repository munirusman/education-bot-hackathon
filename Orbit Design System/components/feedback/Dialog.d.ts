import * as React from 'react';
/** Modal for confirmations (pause tutor, end test mode) and short forms. */
export interface DialogProps{
  open?:boolean;
  title:React.ReactNode;
  description?:React.ReactNode;
  children?:React.ReactNode;
  /** Footer buttons, right-aligned. Primary last. */
  actions?:React.ReactNode;
  onClose?:()=>void;
  width?:number;
  /** Render the panel without the fixed scrim (for docs/cards). */
  inline?:boolean;
}
export function Dialog(props:DialogProps):JSX.Element|null;
