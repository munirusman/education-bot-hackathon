import * as React from 'react';
/** The Orbit logo: lowercase "orbit" with a mortarboard on the first "o" (a student wearing the cap). */
export interface LogoProps{
  /** full = wordmark; mark = capped "o" symbol alone (app icon, favicon, tight spaces). */
  variant?:'full'|'mark';
  /** Wordmark: font-size in px (cap adds ~30% headroom). Mark: box size in px. Default 32. */
  size?:number;
  /** plum on light surfaces, white on plum/dark, ink for monochrome print. */
  tone?:'plum'|'white'|'ink';
  style?:React.CSSProperties;
}
export function Logo(props:LogoProps):JSX.Element;
