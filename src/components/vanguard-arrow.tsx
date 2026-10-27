export function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg className="vm-icon" width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" aria-hidden="true"
      style={back ? { transform: "rotate(180deg)" } : undefined}>
      <path d="M4 12h15M13 5l7 7-7 7" />
    </svg>
  );
}
