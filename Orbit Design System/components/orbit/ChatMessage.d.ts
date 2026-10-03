import * as React from 'react';
/** A single turn in a student–tutor session. Teacher turns use the sun surface. */
export interface ChatMessageProps{
  role?:'student'|'tutor'|'teacher'|'system';
  author?:string;
  time?:string;
  /** Mono footnote under tutor turns explaining which rule shaped the answer. */
  meta?:React.ReactNode;
  children?:React.ReactNode;
}
export function ChatMessage(props:ChatMessageProps):JSX.Element;
