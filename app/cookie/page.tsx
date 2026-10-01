"use client";

import ChallengeFrame from "@/components/ChallengeFrame";
import { useEffect, useState } from "react";

export default function CookiePage() {
  useEffect(() => {
    document.cookie = "relic=ember; path=/; SameSite=Strict; max-age=86400";
  }, []);

  return (
    <ChallengeFrame challengeId="the-cookie">
      <CookieContent />
    </ChallengeFrame>
  );
}

function CookieContent() {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div className="card">
        <div className="mono" style={{ color: "var(--text-muted)", fontSize: "0.6rem", letterSpacing: "0.2em", marginBottom: "16px" }}>
          COOKIE JAR — RESIDUE ANALYSIS
        </div>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, marginBottom: "16px" }}>
          Websites leave small notes inside your browser called <span style={{ color: "var(--accent-cyan)" }}>cookies</span>.
          NULL left one here — a single crumb with a name and a value. You won't see it on the page.
          You have to look where the browser keeps it.
        </p>
        <div style={{ padding: "16px", background: "var(--bg-elevated)", border: "1px solid var(--border-dim)", fontFamily: "'JetBrains Mono', monospace", fontSize: "0.8rem", lineHeight: 2, marginBottom: "16px" }}>
          <div style={{ color: "var(--text-muted)" }}>{"// Cookie jar inspection"}</div>
          <div><span style={{ color: "var(--accent-purple)" }}>relic</span><span style={{ color: "var(--text-muted)" }}>=</span><span style={{ color: "var(--accent-amber)" }}>[?]</span></div>
          <div style={{ color: "var(--text-muted)" }}>{"// The name is known. The value is not."}</div>
        </div>
        <div style={{ padding: "12px 14px", background: "rgba(124, 58, 237, 0.05)", border: "1px solid rgba(124, 58, 237, 0.15)", fontSize: "0.8rem", color: "var(--text-secondary)", fontStyle: "italic" }}>
          &quot;Local storage was one drawer. Cookies are another.&quot;
        </div>
      </div>
      <div>
        <button onClick={() => setShowGuide(!showGuide)} className="btn-secondary" style={{ fontSize: "0.75rem" }}>
          {showGuide ? "[ HIDE GUIDE ]" : "[ HOW TO FIND COOKIES ]"}
        </button>
        {showGuide && (
          <div className="hint-reveal card" style={{ marginTop: "12px" }}>
            <div className="mono" style={{ color: "var(--accent-cyan)", fontSize: "0.7rem", letterSpacing: "0.15em", marginBottom: "12px" }}>
              READING COOKIES
            </div>
            <ol style={{ color: "var(--text-secondary)", paddingLeft: "20px", lineHeight: 2.2, fontSize: "0.85rem" }}>
              <li>Press F12 or right-click the page → &quot;Inspect&quot;</li>
              <li>Open the <strong style={{ color: "var(--text-primary)" }}>Application</strong> tab (Chrome) or <strong style={{ color: "var(--text-primary)" }}>Storage</strong> tab (Firefox)</li>
              <li>Expand <strong style={{ color: "var(--text-primary)" }}>Cookies</strong> → click this site&apos;s URL</li>
              <li>Find the cookie named <code>relic</code> and read its value</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
