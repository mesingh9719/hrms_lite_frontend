import { useEffect, useMemo, useState } from 'react';

const INITIAL_FORM = {
  employee: '',
  date: '',
  status: 'Present',
};

export default function AttendanceForm({ employees, selectedEmployeeId, onSubmit, loading }) {
  const [form, setForm] = useState({
    ...INITIAL_FORM,
    employee: selectedEmployeeId ? String(selectedEmployeeId) : '',
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (!selectedEmployeeId) return;
    setForm((prev) => ({ ...prev, employee: String(selectedEmployeeId) }));
  }, [selectedEmployeeId]);

  const isComplete = useMemo(() => form.employee && form.date && form.status, [form]);

  const validateField = (name, value) => {
    switch (name) {
      case 'employee':
        return !value ? 'Please select an employee' : '';
      case 'date':
        if (!value) return 'Date is required';
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate > today) return 'Cannot mark future attendance';
        return '';
      default:
        return '';
    }
  };

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  }

  function handleBlur(event) {
    const { name, value } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    
    const newErrors = {
      employee: validateField('employee', form.employee),
      date: validateField('date', form.date),
    };
    setErrors(newErrors);
    setTouched({ employee: true, date: true });

    if (Object.values(newErrors).some(e => e)) return;

    try {
      await onSubmit({
        employee: Number(form.employee),
        date: form.date,
        status: form.status,
      });
      setForm((prev) => ({ ...prev, date: '', status: 'Present' }));
      setErrors({});
      setTouched({});
    } catch {
      // Keep entered values when submission fails
    }
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <div className="field">
        <label className="field__label">
          Employee <span className="field__req">*</span>
        </label>
        <select
          name="employee"
          value={form.employee}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading || employees.length === 0}
          className={`field__select ${errors.employee && touched.employee ? 'field__select--error' : ''}`}
        >
          <option value="">Choose employee...</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.full_name}
            </option>
          ))}
        </select>
        {errors.employee && touched.employee && (
          <span className="field__error">{errors.employee}</span>
        )}
      </div>

      <div className="field-row">
        <div className="field">
          <label className="field__label">
            Date <span className="field__req">*</span>
          </label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            onBlur={handleBlur}
            max={today}
            className={`field__input ${errors.date && touched.date ? 'field__input--error' : ''}`}
          />
          {errors.date && touched.date && (
            <span className="field__error">{errors.date}</span>
          )}
        </div>

        <div className="field">
          <label className="field__label">Status</label>
          <div className="status-toggle">
            <button
              type="button"
              className={`status-toggle__btn ${form.status === 'Present' ? 'status-toggle__btn--active status-toggle__btn--green' : ''}`}
              onClick={() => setForm(prev => ({ ...prev, status: 'Present' }))}
            >
              ✓ Present
            </button>
            <button
              type="button"
              className={`status-toggle__btn ${form.status === 'Absent' ? 'status-toggle__btn--active status-toggle__btn--red' : ''}`}
              onClick={() => setForm(prev => ({ ...prev, status: 'Absent' }))}
            >
              ✕ Absent
            </button>
          </div>
        </div>
      </div>

      <button className="btn btn--success btn--full" type="submit" disabled={!isComplete || loading}>
        {loading ? 'Saving...' : '✓ Mark Attendance'}
      </button>
    </form>
  );
}
