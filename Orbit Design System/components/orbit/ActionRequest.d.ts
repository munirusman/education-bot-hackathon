import * as React from 'react';
/** A tutor asking the teacher for permission to do something outside its rules. */
export interface ActionRequestProps{
  student?:string;
  /** Verb phrase completing "Maya’s tutor wants to …", e.g. "run code". */
  action:string;
  /** Mono preview of what will happen (code, file name). */
  detail?:string;
  time?:string;
  state?:'pending'|'approved'|'denied';
  onApprove?:()=>void;
  onDeny?:()=>void;
}
export function ActionRequest(props:ActionRequestProps):JSX.Element;
