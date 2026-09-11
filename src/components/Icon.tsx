type IconName =
  | "home" | "wrench" | "building" | "chevronDown" | "chevronUp" | "chevronLeft" | "chevronRight"
  | "dot" | "arrowRight" | "anchor" | "database" | "activity" | "droplet" | "snowflake"
  | "shield" | "fuel" | "wind" | "logout";

const paths: Record<IconName, React.ReactElement> = {
  home: <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10" />,
  wrench: <path strokeLinecap="round" strokeLinejoin="round" d="M14.7 6.3a4 4 0 10-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 005.4-5.4z" />,
  building: <path strokeLinecap="round" strokeLinejoin="round" d="M4 21V5a1 1 0 011-1h6a1 1 0 011 1v16M4 21h16M12 21v-6h4v6M8 7h.01M8 11h.01M8 15h.01" />,
  chevronDown: <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />,
  chevronUp: <path strokeLinecap="round" strokeLinejoin="round" d="M18 15l-6-6-6 6" />,
  chevronLeft: <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />,
  chevronRight: <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />,
  dot: <circle cx="12" cy="12" r="3" />,
  arrowRight: <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />,
  anchor: <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v6m0 0a3 3 0 100 6 3 3 0 000-6zm0 6v10m-7-4a7 7 0 0014 0M5 14H2m20 0h-3" />,
  database: <path strokeLinecap="round" strokeLinejoin="round" d="M4 6c0-1.1 3.6-2 8-2s8 .9 8 2-3.6 2-8 2-8-.9-8-2zm0 0v12c0 1.1 3.6 2 8 2s8-.9 8-2V6M4 12c0 1.1 3.6 2 8 2s8-.9 8-2" />,
  activity: <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h4l2-7 4 14 2-7h6" />,
  droplet: <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.5s6 7 6 11.5a6 6 0 11-12 0c0-4.5 6-11.5 6-11.5z" />,
  snowflake: <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M4.2 7l15.6 10M4.2 17L19.8 7" />,
  shield: <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" />,
  fuel: <path strokeLinecap="round" strokeLinejoin="round" d="M4 21V7a2 2 0 012-2h6a2 2 0 012 2v14M4 21h10m4-14l2 2v7a1.5 1.5 0 01-3 0v-3h-2" />,
  wind: <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h9a2.5 2.5 0 100-5M4 13h13a2.5 2.5 0 110 5M4 18h7" />,
  logout: <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V6a3 3 0 013-3h4a3 3 0 013 3v1" />,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const path = paths[name as IconName] ?? paths.dot;
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      {path}
    </svg>
  );
}