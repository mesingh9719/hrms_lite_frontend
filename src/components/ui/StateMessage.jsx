const CONFIG = {
  loading: {
    icon: '⟳',
    title: 'Loading...',
  },
  empty: {
    icon: '📭',
    title: 'No Data',
  },
  error: {
    icon: '⚠',
    title: 'Error',
  },
  success: {
    icon: '✓',
    title: 'Success',
  },
  neutral: {
    icon: '💡',
    title: 'Info',
  },
};

export default function StateMessage({ type = 'neutral', title, message }) {
  const config = CONFIG[type] || CONFIG.neutral;
  
  return (
    <div className={`state-message state-message--${type}`}>
      <div className="state-message__icon">{config.icon}</div>
      <h3 className="state-message__title">{title || config.title}</h3>
      <p className="state-message__text">{message}</p>
    </div>
  );
}
