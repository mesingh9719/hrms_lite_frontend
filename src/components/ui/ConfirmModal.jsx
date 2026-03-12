export default function ConfirmModal({ isOpen, title, message, employee, onConfirm, onCancel, loading }) {
  if (!isOpen) return null;

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';
  };

  return (
    <div className="modal-bg" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-box__icon-wrap">
          <div className="modal-box__icon">🗑️</div>
        </div>
        <h3 className="modal-box__title">{title}</h3>
        <p className="modal-box__msg">{message}</p>
        
        {employee && (
          <div className="modal-box__emp-card">
            <div className="modal-box__avatar">{getInitials(employee.full_name)}</div>
            <div className="modal-box__emp-info">
              <div className="modal-box__emp-name">{employee.full_name}</div>
              <div className="modal-box__emp-meta">{employee.email} • {employee.department}</div>
            </div>
          </div>
        )}
        
        <div className="modal-box__actions">
          <button className="btn btn--ghost" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn--danger-solid" onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
