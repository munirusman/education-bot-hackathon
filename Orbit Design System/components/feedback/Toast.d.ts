import * as React from 'react';
/** Transient confirmation on a dark plum surface, bottom-left. */
export interface ToastProps{
  tone?:'info'|'success'|'warning'|'teacher';
  title?:React.ReactNode;
  message?:React.ReactNode;
  /** Single inline action, e.g. Undo. */
  action?:{label:string;onClick?:()=>void};
  onClose?:()=>void;
}
export function Toast(props:ToastProps):JSX.Element;
