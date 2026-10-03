import * as React from 'react';
/** Square multi-select control with label and description. */
export interface CheckboxProps{
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
export function Checkbox(props:CheckboxProps):JSX.Element;
