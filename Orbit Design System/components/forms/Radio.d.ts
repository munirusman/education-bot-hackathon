import * as React from 'react';
/** Round single-select control; group several with the same name and control `checked`. */
export interface RadioProps{
  label?:React.ReactNode;
  description?:React.ReactNode;
  /** Controlled state. Omit to use defaultChecked. */
  checked?:boolean;
  defaultChecked?:boolean;
  onChange?:(checked:boolean)=>void;
  disabled?:boolean;
  name?:string;
  value?:string;
}
export function Radio(props:RadioProps):JSX.Element;
