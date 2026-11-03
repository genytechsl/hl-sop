"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem("solvy360-theme"); } catch { /* Use device preference when storage is unavailable. */ }
    const value = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(value);
    document.documentElement.dataset.theme = value ? "dark" : "light";
    setReady(true);
    return () => { delete document.documentElement.dataset.theme; };
  }, []);
  function toggle() {
    const value = !dark;
    setDark(value);
    document.documentElement.dataset.theme = value ? "dark" : "light";
    try { localStorage.setItem("solvy360-theme", value ? "dark" : "light"); } catch { /* The current session can still change theme. */ }
  }
  return <button type="button" disabled={!ready} onClick={toggle} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} aria-pressed={dark} className="btn-outline gap-2 !px-3 !py-2">{dark ? <Sun size={17} /> : <Moon size={17} />}<span>{dark ? "Light mode" : "Dark mode"}</span></button>;
}
