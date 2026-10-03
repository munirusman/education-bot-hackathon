import * as React from 'react';
/** Initials avatar for students and teachers, with optional session-state dot. */
export interface AvatarProps{
  name:string;
  size?:number;
  status?:'working'|'stuck'|'approval'|'paused'|'offline';
  /** Teacher avatars use the sun palette. */
  teacher?:boolean;
  style?:React.CSSProperties;
}
export function Avatar(props:AvatarProps):JSX.Element;
