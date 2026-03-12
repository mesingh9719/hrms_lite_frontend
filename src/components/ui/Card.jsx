export default function Card({ title, subtitle, icon, iconType, actions, children }) {
  return (
    <section className="card">
      <header className="card__header">
        <div className="card__header-info">
          {icon && (
            <div className={`card__icon ${iconType ? `card__icon--${iconType}` : ''}`}>
              {icon}
            </div>
          )}
          <div>
            <h2 className="card__title">{title}</h2>
            {subtitle && <p className="card__subtitle">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="card__actions">{actions}</div>}
      </header>
      <div className="card__body">{children}</div>
    </section>
  );
}
