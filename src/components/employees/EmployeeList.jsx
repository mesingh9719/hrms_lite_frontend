import EmployeeRow from './EmployeeRow';
import StateBox from '../ui/StateBox';

export default function EmployeeList({
  employees,
  loading,
  error,
  selectedId,
  onSelect,
  onDelete,
  deletingId,
}) {
  if (error) {
    return (
      <StateBox variant="error" icon="⚠" title="Error" text={error} />
    );
  }

  if (loading) {
    return (
      <StateBox variant="loading" icon="⏳" title="Loading..." />
    );
  }

  if (employees.length === 0) {
    return (
      <StateBox
        icon="👥"
        title="No Employees Yet"
        text="Add your first employee using the form"
      />
    );
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Employee</th>
          <th>ID</th>
          <th>Department</th>
          <th style={{ textAlign: 'right' }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {employees.map((emp) => (
          <EmployeeRow
            key={emp.id}
            employee={emp}
            isSelected={emp.id === selectedId}
            onSelect={onSelect}
            onDelete={onDelete}
            isDeleting={deletingId === emp.id}
          />
        ))}
      </tbody>
    </table>
  );
}
