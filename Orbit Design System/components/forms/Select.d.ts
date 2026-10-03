import * as React from 'react';
/** Native select styled to match Input. */
export interface SelectProps{
  label?:string;
  hint?:string;
  error?:string;
  options:(string|{value:string;label:string})[];
  value?:string;
  defaultValue?:string;
  onChange?:(e:React.ChangeEvent<HTMLSelectElement>)=>void;
  size?:'sm'|'md'|'lg';
  disabled?:boolean;
  style?:React.CSSProperties;
}
export function Select(props:SelectProps):JSX.Element;
