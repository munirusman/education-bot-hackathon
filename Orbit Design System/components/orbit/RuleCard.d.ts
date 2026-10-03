import * as React from 'react';
/** A plain-language instruction the teacher applies to one or more tutors. */
export interface RuleCardProps{
  /** The rule, written as the teacher would say it. Rendered in mono. */
  rule:string;
  /** Who it applies to, e.g. "All students", "Maya K.", "Test mode". */
  scope?:string;
  /** behavior = how it answers; permission = what it may do; mode = time-bound. */
  kind?:'behavior'|'permission'|'mode';
  enabled?:boolean;
  defaultEnabled?:boolean;
  onToggle?:(on:boolean)=>void;
  onEdit?:()=>void;
}
export function RuleCard(props:RuleCardProps):JSX.Element;
