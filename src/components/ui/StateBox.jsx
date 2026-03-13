export default function StateBox({ variant = '', icon, title, text }) {
  const className = `state-box${variant ? ` state-box--${variant}` : ''}`;
  
  return (
    <div className={className}>
      {icon && <div className="state-box__icon">{icon}</div>}
      {title && <div className="state-box__title">{title}</div>}
      {text && <div className="state-box__text">{text}</div>}
    </div>
  );
}
