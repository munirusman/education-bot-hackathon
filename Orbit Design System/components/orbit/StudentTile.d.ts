import * as React from 'react';
/**
 * One student's live session in the classroom grid.
 * @startingPoint section="Orbit" subtitle="Live classroom tiles in each session state" viewport="700x320"
 */
export interface StudentTileProps{
  name:string;
  status?:'working'|'stuck'|'approval'|'paused'|'offline';
  /** Current concept or assignment. */
  topic?:string;
  /** Minutes in the current state. */
  minutes?:number;
  /** Latest student question, clamped to 2 lines. */
  lastMessage?:string;
  /** Shows the sun note icon when the teacher left a note. */
  hasNote?:boolean;
  selected?:boolean;
  onClick?:()=>void;
}
export function StudentTile(props:StudentTileProps):JSX.Element;
