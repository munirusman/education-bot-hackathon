import * as React from 'react';
/** Pill status label. Tones map to session states. */
export interface BadgeProps{
  tone?:'neutral'|'brand'|'working'|'stuck'|'approval'|'paused'|'danger'|'teacher';
  /** Leading status dot. */
  dot?:boolean;
  /** Pulse the dot. Defaults on for tone="stuck". */
  pulse?:boolean;
  children?:React.ReactNode;
  style?:React.CSSProperties;
}
export function Badge(props:BadgeProps):JSX.Element;
