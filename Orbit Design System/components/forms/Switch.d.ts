import * as React from 'react';
/** On/off toggle that applies immediately (e.g. enabling a tutor rule). */
export interface SwitchProps{
  checked?:boolean;
  defaultChecked?:boolean;
  onChange?:(checked:boolean)=>void;
  label?:React.ReactNode;
  disabled?:boolean;
  size?:'sm'|'md';
}
export function Switch(props:SwitchProps):JSX.Element;
