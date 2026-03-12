export default function EmployeeTable({ employees, selectedEmployeeId, onSelectEmployee, onDelete, deleting }) {
  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';
  };

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Employee ID</th>
            <th>Department</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => {
            const isSelected = employee.id === selectedEmployeeId;
            return (
              <tr key={employee.id} className={isSelected ? 'selected' : ''}>
                <td>
                  <div className="employee-cell">
                    <div className="employee-avatar">{getInitials(employee.full_name)}</div>
                    <div>
                      <div className="employee-info__name">{employee.full_name}</div>
                      <div className="employee-info__email">{employee.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge badge--primary">{employee.employee_id}</span>
                </td>
                <td>
                  <span className="badge badge--neutral">{employee.department}</span>
                </td>
                <td>
                  <div className="table__actions">
                    <button
                      type="button"
                      className={`btn btn--sm ${isSelected ? 'btn--primary' : 'btn--ghost'}`}
                      onClick={() => onSelectEmployee(employee.id)}
                    >
                      {isSelected ? 'Viewing' : 'View'}
                    </button>
                    <button
                      type="button"
                      className="btn btn--sm btn--danger"
                      onClick={() => onDelete(employee)}
                      disabled={deleting === employee.id}
                    >
                      {deleting === employee.id ? (
                        <span className="btn__spinner"></span>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
