const THEMES = [
  { id: 'epam', label: 'EPAM' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

function ThemeSwitcher({ theme, onChange }) {
  return (
    <div className="theme-switcher">
      <span className="theme-switcher-label">Theme</span>
      <div className="theme-switcher-buttons">
        {THEMES.map((t) => (
          <button
            key={t.id}
            className={`theme-btn${theme === t.id ? ' theme-btn--active' : ''}`}
            onClick={() => onChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ThemeSwitcher;
