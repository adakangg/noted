"use client"; 
import dynamic from "next/dynamic";   

/* Dynamic import wrapper for DualEditor (client-side only since Remirror relies on browser APIs)  */

export const DualEditor = dynamic(
  () => import("./DualEditorImpl").then((mod) => mod.DualEditorImpl),
  { ssr: false }
);