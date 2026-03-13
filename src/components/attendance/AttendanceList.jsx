import { formatDate } from '../../utils';
import StateBox from '../ui/StateBox';

export default function AttendanceList({
  records,
  loading,
  error,
  selectedEmployeeId,
  filterDate,
}) {
  if (error) {
    return (
      <StateBox variant="error" icon="⚠" title="Error" text={error} />
    );
  }

  if (!selectedEmployeeId) {
    return (
      <StateBox
        icon="📊"
        title="Select an Employee"
        text='Click "View" on any employee to see their attendance'
      />
    );
  }

  if (loading) {
    return (
      <StateBox variant="loading" icon="⏳" title="Loading..." />
    );
  }

  if (records.length === 0) {
    return (
      <StateBox
        icon="📋"
        title="No Records"
        text={filterDate ? 'No records for this date' : 'No attendance records yet'}
      />
    );
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Employee</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {records.map((rec) => (
          <tr key={rec.id}>
            <td style={{ fontWeight: 500 }}>
              {formatDate(rec.date)}
            </td>
            <td>
              <span className="tag tag--blue">{rec.employee_code}</span>
              <span style={{ marginLeft: 8, color: 'var(--gray-500)' }}>
                {rec.employee_name}
              </span>
            </td>
            <td>
              <span className={`tag tag--${rec.status === 'Present' ? 'green' : 'red'}`}>
                {rec.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
