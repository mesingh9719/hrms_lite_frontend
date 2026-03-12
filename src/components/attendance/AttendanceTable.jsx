export default function AttendanceTable({ records }) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Employee</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>
                <span style={{ fontWeight: '500' }}>{formatDate(record.date)}</span>
              </td>
              <td>
                <span className="badge badge--primary">{record.employee_code}</span>
                <span style={{ marginLeft: '10px', color: 'var(--text-secondary)' }}>
                  {record.employee_name}
                </span>
              </td>
              <td>
                <span className={`badge badge--${record.status === 'Present' ? 'success' : 'danger'}`}>
                  {record.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
