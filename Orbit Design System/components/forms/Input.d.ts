import * as React from 'react';
/** Labelled single-line text field. */
export interface InputProps{
  label?:string;
  hint?:string;
  /** Error message; turns the border red. */
  error?:string;
  /** Leading Lucide icon. */
  icon?:string;
  size?:'sm'|'md'|'lg';
  value?:string;
  defaultValue?:string;
  onChange?:(e:React.ChangeEvent<HTMLInputElement>)=>void;
  placeholder?:string;
  disabled?:boolean;
  type?:string;
  style?:React.CSSProperties;
}
export function Input(props:InputProps):JSX.Element;
/** Label + hint/error wrapper used by all form controls. */
export function Field(props:{label?:string;hint?:string;error?:string;children?:React.ReactNode}):JSX.Element;
