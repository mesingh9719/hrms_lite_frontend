import { useEffect } from 'react';

export default function Toast({ toasts, removeToast }) {
  return (
    <div className="toast-wrapper">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };

  return (
    <div className={`toast-item toast-item--${toast.type}`}>
      <div className="toast-item__icon">{icons[toast.type]}</div>
      <div className="toast-item__body">
        <div className="toast-item__title">{toast.title}</div>
        {toast.message && <div className="toast-item__text">{toast.message}</div>}
      </div>
      <button className="toast-item__close" onClick={onClose}>×</button>
    </div>
  );
}
