import { useEffect, useState } from "react";

export function Header() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      return localStorage.getItem("pos-theme") === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });
  useEffect(() => {
    document.title = "Store Billing | New Order";
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.style.colorScheme = theme;
    try {
      localStorage.setItem("pos-theme", theme);
    } catch {
      // Theme works even when browser storage is unavailable.
    }
  }, [theme]);

  return (
    <header className="pos-header">
      <div className="container-fluid px-3 px-lg-4">
        <div className="d-flex align-items-center justify-content-between gap-3 py-3">
          <div className="d-flex align-items-center gap-3">
            <div className="brand-icon">
              <i className="bi bi-shop-window" />
            </div>
            <div>
              <h1 className="brand-title mb-0">CounterFlow</h1>
              <p className="brand-subtitle mb-0">Retail billing workspace</p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="live-status">
              <span className="status-dot" />
              POS Active
            </span>
            <button
              type="button"
              className="icon-button"
              aria-label={
                theme === "dark"
                  ? "Switch to light theme"
                  : "Switch to dark theme"
              }
              title={
                theme === "dark"
                  ? "Switch to light theme"
                  : "Switch to dark theme"
              }
              onClick={() =>
                setTheme((current) => (current === "dark" ? "light" : "dark"))
              }
            >
              <i
                className={
                  theme === "dark" ? "bi bi-sun-fill" : "bi bi-moon-stars-fill"
                }
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
