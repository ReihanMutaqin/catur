/**
 * Lichess-style SVG chess pieces as inline React components.
 * Source: https://github.com/lichess-org/lila/tree/master/public/piece/cburnett
 * License: GPLv2+
 */

import type { CSSProperties } from "react";

type SvgProps = { style?: CSSProperties; className?: string };

// ─── White pieces ─────────────────────────────────────────────────────────────

export function WK({ style, className }: SvgProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" style={style} className={className}>
      <g fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round" stroke="#000" strokeWidth="1.5">
        <path d="M22.5 11.63V6M20 8h5" strokeLinejoin="miter"/>
        <path fill="#fff" stroke="#000" d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/>
        <path fill="#fff" stroke="#000" d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V17s-5.5-13.5-16-4c-3 6 5 10.5 5 10.5v7z"/>
        <path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0" fill="none"/>
      </g>
    </svg>
  );
}

export function WQ({ style, className }: SvgProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" style={style} className={className}>
      <g fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round" stroke="#000" strokeWidth="1.5">
        <path fill="#fff" stroke="#000" d="M8 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0zM24.5 7.5a2 2 0 1 1 4 0 2 2 0 0 1-4 0zM41 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0zM16 8.5a2 2 0 1 1 4 0 2 2 0 0 1-4 0zM33 8.5a2 2 0 1 1 4 0 2 2 0 0 1-4 0z"/>
        <path fill="#fff" stroke="#000" d="M9 26c8.5-8.5 15-3 16 2 1-5 7.5-10.5 16-2l-8-9c0 6.5-5.5 6.5-8 0-2.5 6.5-8 6.5-8 0L9 26z"/>
        <path fill="#fff" stroke="#000" d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 3 16.5 3 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5 1.5-18.5 1.5-27 0z"/>
        <path fill="none" d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c4-1.5 17-1.5 21 0"/>
      </g>
    </svg>
  );
}

export function WR({ style, className }: SvgProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" style={style} className={className}>
      <g fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round" stroke="#000" strokeWidth="1.5">
        <path fill="#fff" stroke="#000" d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14V9h4v2h5V9h5v2h5V9h4v5"/>
        <path fill="#fff" stroke="#000" d="M34 14l-3 3H14l-3-3"/>
        <path fill="#fff" stroke="#000" d="M31 17v12.5H14V17"/>
        <path fill="#fff" stroke="#000" d="M31 29.5l1.5 2.5h-20l1.5-2.5"/>
        <path fill="none" d="M11 14h23"/>
      </g>
    </svg>
  );
}

export function WB({ style, className }: SvgProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" style={style} className={className}>
      <g fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round" stroke="#000" strokeWidth="1.5">
        <g fill="#fff" stroke="#000">
          <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z"/>
          <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
          <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
        </g>
        <path fill="none" stroke="#000" strokeLinejoin="miter" d="M17.5 26h10M15 30h15"/>
      </g>
    </svg>
  );
}

export function WN({ style, className }: SvgProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" style={style} className={className}>
      <g fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round" stroke="#000" strokeWidth="1.5">
        <path fill="#fff" d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/>
        <path fill="#fff" d="M24 18c.38 5.1-5.55 8.08-8 11-3 4 .44 6.93 6 7 3.73.05 8.98-1.5 13-2-.4-3.5.44-5.9 0-9-1.19-7.04-5.63-9.97-11-7"/>
        <path fill="#000" d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 0 1 .866.5z"/>
        <path fill="#fff" stroke="#000" d="M24.55 10.4l-.45 1.45.5.15c3.15 1 5.65 2.49 6.9 3.75 1.25 1.26 1.35 2.35 1.35 2.35l.05.05.4-.65-.4-1.5c-1.5-2.5-4.5-5-7.85-5.55-.1-.01-.4-.02-.5.4z"/>
      </g>
    </svg>
  );
}

export function WP({ style, className }: SvgProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" style={style} className={className}>
      <path fill="#fff" stroke="#000" strokeWidth="1.5" strokeLinecap="round" d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03C15.41 27.09 11 31.58 11 39.5H34c0-7.92-4.41-12.41-7.41-13.47C28.06 24.84 29 23.03 29 21c0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"/>
    </svg>
  );
}

// ─── Black pieces ─────────────────────────────────────────────────────────────

export function BK({ style, className }: SvgProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" style={style} className={className}>
      <g fill="none" fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round" stroke="#000" strokeWidth="1.5">
        <path d="M22.5 11.63V6" strokeLinejoin="miter"/>
        <path d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5" fill="#000" stroke="#000"/>
        <path d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V17s-5.5-13.5-16-4c-3 6 5 10.5 5 10.5v7z" fill="#000"/>
        <path d="M20 8h5" strokeLinejoin="miter" stroke="#fff"/>
        <path d="M32 29.5s8.5-4 6.03-9.65C34.15 14 25 18 22.5 24.5l.01 2.1-.01-2.1C20 18 9.906 14 6.997 19.85c-2.497 5.65 4.853 9 4.853 9" stroke="#fff"/>
        <path d="M11.5 30c5.5-3 15.5-3 21 0M11.5 33.5c5.5-3 15.5-3 21 0M11.5 37c5.5-3 15.5-3 21 0" stroke="#fff"/>
      </g>
    </svg>
  );
}

export function BQ({ style, className }: SvgProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" style={style} className={className}>
      <g fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round" stroke="#000" strokeWidth="1.5">
        <g fill="#000">
          <circle cx="6" cy="12" r="2.75"/>
          <circle cx="14" cy="9" r="2.75"/>
          <circle cx="22.5" cy="8" r="2.75"/>
          <circle cx="31" cy="9" r="2.75"/>
          <circle cx="39" cy="12" r="2.75"/>
        </g>
        <path fill="#000" d="M9 26c8.5-8.5 15-3 16 2 1-5 7.5-10.5 16-2l-8-9c0 6.5-5.5 6.5-8 0-2.5 6.5-8 6.5-8 0L9 26z"/>
        <path fill="#000" d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 3 16.5 3 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5 1.5-18.5 1.5-27 0z"/>
        <path fill="none" stroke="#fff" d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c4-1.5 17-1.5 21 0"/>
      </g>
    </svg>
  );
}

export function BR({ style, className }: SvgProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" style={style} className={className}>
      <g fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round" stroke="#000" strokeWidth="1.5">
        <path fill="#000" d="M9 39h27v-3H9v3zM12.5 32l1.5-2.5h17l1.5 2.5h-20zM12 36v-4h21v4H12z"/>
        <path fill="#000" strokeLinejoin="miter" d="M14 29.5v-13h17v13H14zM14 16.5L11 14h23l-3 2.5H14zM11 14V9h4v2h5V9h5v2h5V9h4v5H11z"/>
        <path fill="none" stroke="#fff" strokeWidth="1" strokeLinejoin="miter" d="M12 35.5h21M13 31.5h19M14 29.5h17M14 16.5h17M11 14h23"/>
      </g>
    </svg>
  );
}

export function BB({ style, className }: SvgProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" style={style} className={className}>
      <g fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round" stroke="#000" strokeWidth="1.5">
        <g fill="#000" stroke="#000">
          <path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2z"/>
          <path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/>
          <circle cx="22.5" cy="8" r="2.5"/>
        </g>
        <path fill="none" stroke="#fff" strokeLinejoin="miter" d="M17.5 26h10M15 30h15M22.5 15.5v5M20 18h5"/>
      </g>
    </svg>
  );
}

export function BN({ style, className }: SvgProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" style={style} className={className}>
      <g fillRule="evenodd" strokeLinecap="round" strokeLinejoin="round" stroke="#000" strokeWidth="1.5">
        <path fill="#000" d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/>
        <path fill="#000" d="M24 18c.38 5.1-5.55 8.08-8 11-3 4 .44 6.93 6 7 3.73.05 8.98-1.5 13-2-.4-3.5.44-5.9 0-9-1.19-7.04-5.63-9.97-11-7"/>
        <path fill="#fff" d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM14.933 15.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 0 1 .866.5z"/>
        <path stroke="#fff" d="M24.55 10.4l-.45 1.45.5.15c3.15 1 5.65 2.49 6.9 3.75 1.25 1.26 1.35 2.35 1.35 2.35l.05.05.4-.65-.4-1.5c-1.5-2.5-4.5-5-7.85-5.55-.1-.01-.4-.02-.5.4z"/>
      </g>
    </svg>
  );
}

export function BP({ style, className }: SvgProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" style={style} className={className}>
      <path fill="#000" stroke="#000" strokeWidth="1.5" strokeLinecap="round" d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03C15.41 27.09 11 31.58 11 39.5H34c0-7.92-4.41-12.41-7.41-13.47C28.06 24.84 29 23.03 29 21c0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"/>
    </svg>
  );
}
