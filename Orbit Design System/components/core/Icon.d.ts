import * as React from 'react';
/** Lucide icon (stroke 2, rendered via CSS mask so it inherits currentColor). */
export interface IconProps{
  /** Lucide icon name in kebab-case, e.g. "hand", "pause", "message-square". */
  name:string;
  /** Pixel size. Default 16. Use 14 in dense rows, 20 in empty states. */
  size?:number;
  color?:string;
  title?:string;
  style?:React.CSSProperties;
}
export function Icon(props:IconProps):JSX.Element;
