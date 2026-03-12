const STATS_CONFIG = [
  { key: 'employees', label: 'Total Employees', icon: '👥', variant: 'blue' },
  { key: 'records', label: 'Total Records', icon: '📋', variant: 'orange' },
  { key: 'present', label: 'Present Today', icon: '✓', variant: 'green' },
  { key: 'absent', label: 'Absent Today', icon: '✕', variant: 'red' },
];

export default function DashboardStats({ summary, totalEmployees }) {
  const values = {
    employees: totalEmployees,
    records: summary.total_records || 0,
    present: summary.present_today || summary.total_present || 0,
    absent: summary.absent_today || summary.total_absent || 0,
  };

  return (
    <section className="stats-grid">
      {STATS_CONFIG.map((stat) => (
        <article key={stat.key} className={`stat-box stat-box--${stat.variant}`}>
          <div className="stat-box__icon">{stat.icon}</div>
          <div className="stat-box__number">{values[stat.key]}</div>
          <div className="stat-box__label">{stat.label}</div>
        </article>
      ))}
    </section>
  );
}
