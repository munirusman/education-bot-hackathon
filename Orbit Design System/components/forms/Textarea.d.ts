import * as React from 'react';
/** Multi-line text field. Use mono for writing tutor rules. */
export interface TextareaProps{
  label?:string;
  hint?:string;
  error?:string;
  rows?:number;
  /** IBM Plex Mono — for tutor rule authoring. */
  mono?:boolean;
  value?:string;
  defaultValue?:string;
  onChange?:(e:React.ChangeEvent<HTMLTextAreaElement>)=>void;
  placeholder?:string;
  disabled?:boolean;
  style?:React.CSSProperties;
}
export function Textarea(props:TextareaProps):JSX.Element;
