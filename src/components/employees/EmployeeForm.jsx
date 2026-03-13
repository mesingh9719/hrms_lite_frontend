import { useMemo, useState } from 'react';

const INITIAL_FORM = {
  employee_id: '',
  full_name: '',
  email: '',
  department: '',
};

const INITIAL_ERRORS = {
  employee_id: '',
  full_name: '',
  email: '',
  department: '',
};

export default function EmployeeForm({ onSubmit, loading }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case 'employee_id':
        if (!value.trim()) return 'Employee ID is required';
        if (value.trim().length < 2) return 'Employee ID must be at least 2 characters';
        return '';
      case 'full_name':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 3) return 'Name must be at least 3 characters';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return 'Please enter a valid email';
        return '';
      case 'department':
        if (!value.trim()) return 'Department is required';
        return '';
      default:
        return '';
    }
  };

  const isValid = useMemo(() => {
    return Object.keys(INITIAL_FORM).every(
      (key) => form[key].trim() && !validateField(key, form[key])
    );
  }, [form]);

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
    
    // Validate all fields
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      newErrors[key] = validateField(key, form[key]);
    });
    setErrors(newErrors);
    setTouched({ employee_id: true, full_name: true, email: true, department: true });

    if (Object.values(newErrors).some((error) => error)) {
      return;
    }

    try {
      await onSubmit({
        employee_id: form.employee_id.trim(),
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        department: form.department.trim(),
      });
      setForm(INITIAL_FORM);
      setErrors(INITIAL_ERRORS);
      setTouched({});
    } catch (err) {
      // Handle server-side validation errors
      if (err.fields) {
        const serverErrors = {};
        Object.entries(err.fields).forEach(([field, message]) => {
          if (field in INITIAL_FORM) {
            serverErrors[field] = message;
          }
        });
        if (Object.keys(serverErrors).length > 0) {
          setErrors((prev) => ({ ...prev, ...serverErrors }));
          setTouched((prev) => ({
            ...prev,
            ...Object.keys(serverErrors).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
          }));
        }
      }
    }
  }

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <div className="field">
        <label className="field__label">
          Employee ID <span className="field__req">*</span>
        </label>
        <input
          type="text"
          name="employee_id"
          value={form.employee_id}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="EMP-001"
          className={`field__input ${errors.employee_id && touched.employee_id ? 'field__input--error' : ''}`}
        />
        {errors.employee_id && touched.employee_id && (
          <span className="field__error">{errors.employee_id}</span>
        )}
      </div>

      <div className="field">
        <label className="field__label">
          Full Name <span className="field__req">*</span>
        </label>
        <input
          type="text"
          name="full_name"
          value={form.full_name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="John Doe"
          className={`field__input ${errors.full_name && touched.full_name ? 'field__input--error' : ''}`}
        />
        {errors.full_name && touched.full_name && (
          <span className="field__error">{errors.full_name}</span>
        )}
      </div>

      <div className="field">
        <label className="field__label">
          Email Address <span className="field__req">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="john@company.com"
          className={`field__input ${errors.email && touched.email ? 'field__input--error' : ''}`}
        />
        {errors.email && touched.email && (
          <span className="field__error">{errors.email}</span>
        )}
      </div>

      <div className="field">
        <label className="field__label">
          Department <span className="field__req">*</span>
        </label>
        <input
          type="text"
          name="department"
          value={form.department}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Engineering"
          className={`field__input ${errors.department && touched.department ? 'field__input--error' : ''}`}
        />
        {errors.department && touched.department && (
          <span className="field__error">{errors.department}</span>
        )}
      </div>

      <button className="btn btn--primary btn--full" type="submit" disabled={!isValid || loading}>
        {loading ? 'Adding...' : '+ Add Employee'}
      </button>
    </form>
  );
}