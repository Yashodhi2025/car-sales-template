import Link from "next/link";

export default function NotFound() {
  return <main id="main-content" className="vm-page vm-container vm-section">
    <p className="vm-eyebrow">VANGUARD MOTORS · 404</p>
    <h1 className="vm-title">This road ends here.</h1>
    <p className="vm-copy">We couldn’t find that page. Explore the collection or return home.</p>
    <div className="vm-actions">
      <Link href="/inventory" className="vm-button vm-button-primary">Browse inventory</Link>
      <Link href="/" className="vm-text-link">Return home</Link>
    </div>
  </main>;
}
