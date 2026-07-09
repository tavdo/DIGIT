import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { ArrowRight, LogIn, LogOut, UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "../context/LanguageContext";
import { resolveUserRole } from "../utils/roles";
import DigitMark from "./DigitMark";
import ThemeToggle from "./ThemeToggle";
import LanguageSelector from "./LanguageSelector";
import { SITE_NAME } from "../constants/brand";
import "./Navbar.css";

const PUBLIC_LINKS = [
  { to: "/", labelKey: "nav.home", end: true },
  { to: "/services", labelKey: "nav.services" },
  { to: "/about", labelKey: "nav.about" },
];

function getNavLinks(role, isAuthenticated) {
  if (!isAuthenticated) return PUBLIC_LINKS;

  if (role === "developer") {
    return [
      { to: "/developer-dashboard", labelKey: "nav.myTasks", end: true },
      { to: "/profile", labelKey: "nav.profile" },
    ];
  }

  if (role === "admin") {
    return [
      { to: "/admin", labelKey: "nav.adminPanel", end: true },
      { to: "/dashboard", labelKey: "nav.tickets" },
      { to: "/specialists", labelKey: "nav.specialists" },
      { to: "/managers", labelKey: "nav.managers" },
      { to: "/profile", labelKey: "nav.profile" },
    ];
  }

  if (role === "manager") {
    return [
      { to: "/", labelKey: "nav.home", end: true },
      { to: "/dashboard", labelKey: "nav.tickets" },
      { to: "/specialists", labelKey: "nav.specialists" },
      { to: "/managers", labelKey: "nav.managers" },
      { to: "/profile", labelKey: "nav.profile" },
    ];
  }

  if (role === "customer") {
    return [
      { to: "/", labelKey: "nav.home", end: true },
      { to: "/services", labelKey: "nav.services" },
      { to: "/contact", labelKey: "nav.newRequest" },
      { to: "/my-requests", labelKey: "nav.myRequests" },
      { to: "/managers", labelKey: "nav.managers" },
      { to: "/profile", labelKey: "nav.profile" },
    ];
  }

  return PUBLIC_LINKS;
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, userProfile, loading, logout } = useAuth();
  const { t } = useTranslation();

  const closeMenu = () => setMenuOpen(false);

  const displayName =
    userProfile?.name ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    t("nav.profile");

  const role = resolveUserRole(userProfile);
  const navLinks = getNavLinks(role, Boolean(user));

  const handleLogout = async () => {
    closeMenu();
    await logout();
  };

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__logo" onClick={closeMenu}>
          <DigitMark size="sm" />
          <span className="navbar__logo-text">{SITE_NAME}</span>
        </NavLink>

        <button
          type="button"
          className={`navbar__toggle ${menuOpen ? "navbar__toggle--open" : ""}`}
          aria-label={menuOpen ? t("nav.menuClose") : t("nav.menuOpen")}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`navbar__nav ${menuOpen ? "navbar__nav--open" : ""}`}>
          <ul className="navbar__list">
            {navLinks.map(({ to, labelKey, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `navbar__link ${isActive ? "navbar__link--active" : ""}`
                  }
                  onClick={closeMenu}
                >
                  {t(labelKey)}
                </NavLink>
              </li>
            ))}
          </ul>

          <div
            className="navbar__auth"
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <LanguageSelector />
            <ThemeToggle />
            {loading ? (
              <span className="navbar__auth-loading">...</span>
            ) : user ? (
              <>
                <span className="navbar__user">{displayName}</span>
                <button
                  type="button"
                  className="navbar__auth-btn navbar__auth-btn--logout"
                  onClick={handleLogout}
                >
                  <LogOut size={15} />
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="navbar__auth-btn navbar__auth-btn--login navbar__auth-btn--animated"
                  onClick={closeMenu}
                >
                  <span className="navbar__auth-btn__text">
                    {t("nav.login")}
                  </span>
                  <span className="navbar__auth-btn__circle" />
                  <ArrowRight
                    size={16}
                    className="navbar__auth-btn__arr navbar__auth-btn__arr--2"
                  />
                  <LogIn
                    size={15}
                    className="navbar__auth-btn__arr navbar__auth-btn__arr--1"
                  />
                </Link>
                <Link
                  to="/register"
                  className="navbar__auth-btn navbar__auth-btn--register"
                  onClick={closeMenu}
                >
                  <UserPlus size={15} />
                  {t("nav.register")}
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>

      {menuOpen && (
        <button
          type="button"
          className="navbar__overlay"
          aria-label={t("nav.menuClose")}
          onClick={closeMenu}
        />
      )}
    </header>
  );
}

export default Navbar;
