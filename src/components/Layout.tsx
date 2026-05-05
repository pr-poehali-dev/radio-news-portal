import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import Icon from "@/components/ui/icon";
import Player from "@/components/Player";

const navItems = [
  { to: "/", label: "Главная" },
  { to: "/news", label: "Новости" },
  { to: "/contests", label: "Конкурсы" },
  { to: "/battles", label: "Батлы" },
  { to: "/votes", label: "Голосования" },
  { to: "/requests", label: "Заказы" },
  { to: "/about", label: "О радио" },
  { to: "/contacts", label: "Контакты" },
];

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--radio-dark)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: "rgba(15,11,9,0.92)",
          backdropFilter: "blur(12px)",
          borderColor: "var(--radio-surface2)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-14 gap-8">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1">
              <span className="live-dot" />
            </span>
            <span
              className="font-display text-lg tracking-widest uppercase"
              style={{ color: "var(--radio-text)" }}
            >
              Радио{" "}
              <span style={{ color: "var(--radio-red)" }}>Генезия</span>
            </span>
          </NavLink>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 flex-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  "nav-link" + (isActive ? " active" : "")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Mobile burger */}
          <button
            className="md:hidden ml-auto p-2"
            style={{ color: "var(--radio-muted)" }}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Icon name={menuOpen ? "X" : "Menu"} size={20} />
          </button>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div
            className="md:hidden border-t px-4 py-4 flex flex-col gap-4"
            style={{
              borderColor: "var(--radio-surface2)",
              background: "var(--radio-surface)",
            }}
          >
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  "nav-link text-base" + (isActive ? " active" : "")
                }
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Sticky bottom player */}
      <Player />
    </div>
  );
}