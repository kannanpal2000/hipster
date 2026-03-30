import { memo } from 'react';

const NAV_LINKS = ['Home', 'Therapists', 'Sales', 'Clients', 'Transactions', 'Reports'];

const Navbar = memo(function Navbar() {
  return (
    <nav className="nav">
      <div className="nav-logo">
        <span className="nav-logo-a">🌿 Natureland</span>
        <span className="nav-logo-b">WELLNESS GROUP</span>
      </div>

      <div className="nav-links">
        {NAV_LINKS.map((link) => (
          <button
            key={link}
            className={`nav-link${link === 'Home' ? ' active' : ''}`}
          >
            {link}
          </button>
        ))}
      </div>

      <div className="nav-actions">
        <div className="nav-icon">🔔</div>
        <div className="nav-avatar">A</div>
      </div>
    </nav>
  );
});

export default Navbar;
