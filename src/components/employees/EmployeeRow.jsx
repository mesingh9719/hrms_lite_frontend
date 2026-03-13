import { getInitials } from '../../utils';

export default function EmployeeRow({ employee, isSelected, onSelect, onDelete, isDeleting }) {
  return (
    <tr className={isSelected ? 'active' : ''}>
      <td>
        <div className="emp-info">
          <div className="emp-avatar">{getInitials(employee.full_name)}</div>
          <div>
            <div className="emp-name">{employee.full_name}</div>
            <div className="emp-email">{employee.email}</div>
          </div>
        </div>
      </td>
      <td>
        <span className="tag tag--blue">{employee.employee_id}</span>
      </td>
      <td>
        <span className="tag tag--gray">{employee.department}</span>
      </td>
      <td>
        <div className="actions">
          <button
            className={`btn btn--sm ${isSelected ? 'btn--primary' : 'btn--ghost'}`}
            onClick={() => onSelect(employee.id)}
          >
            {isSelected ? 'Viewing' : 'View'}
          </button>
          <button
            className="btn btn--sm btn--danger"
            onClick={() => onDelete(employee)}
            disabled={isDeleting}
          >
            {isDeleting ? <span className="btn__spinner"></span> : 'Delete'}
          </button>
        </div>
      </td>
    </tr>
  );
}
