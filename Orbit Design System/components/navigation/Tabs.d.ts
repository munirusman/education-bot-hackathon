import * as React from 'react';
export interface TabItem{id:string;label:React.ReactNode;count?:number}
/** Tab bar. underline for page sections; segmented for view toggles (grid/list). */
export interface TabsProps{
  items:TabItem[];
  value:string;
  onChange?:(id:string)=>void;
  variant?:'underline'|'segmented';
}
export function Tabs(props:TabsProps):JSX.Element;
