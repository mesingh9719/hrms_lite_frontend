import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  createAttendance,
  createEmployee,
  getDashboardSummary,
  getEmployeeAttendance,
  getEmployees,
  removeEmployee,
} from './api/client';
import AttendanceForm from './components/attendance/AttendanceForm';
import AttendanceTable from './components/attendance/AttendanceTable';
import DashboardStats from './components/DashboardStats';
import EmployeeForm from './components/employees/EmployeeForm';
import EmployeeTable from './components/employees/EmployeeTable';
import Card from './components/ui/Card';
import ConfirmModal from './components/ui/ConfirmModal';
import StateMessage from './components/ui/StateMessage';
import Toast from './components/ui/Toast';

export default function App() {
  const attendanceSectionRef = useRef(null);
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [employeesError, setEmployeesError] = useState('');
  const [employeeSaving, setEmployeeSaving] = useState(false);

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState('');
  const [attendanceSaving, setAttendanceSaving] = useState(false);

  const [summary, setSummary] = useState({});
  const [summaryError, setSummaryError] = useState('');

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [attendanceFilterDate, setAttendanceFilterDate] = useState('');

  // Modal state
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, employee: null, loading: false });

  // Toast state
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, title, message }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.id === selectedEmployeeId),
    [employees, selectedEmployeeId]
  );

  const selectedEmployeePresentDays = useMemo(() => {
    if (!selectedEmployeeId) return 0;
    return attendanceRecords.filter((record) => record.status === 'Present').length;
  }, [attendanceRecords, selectedEmployeeId]);

  const selectedEmployeeAbsentDays = useMemo(() => {
    if (!selectedEmployeeId) return 0;
    return attendanceRecords.filter((record) => record.status === 'Absent').length;
  }, [attendanceRecords, selectedEmployeeId]);

  const loadEmployees = useCallback(async () => {
    setEmployeesLoading(true);
    setEmployeesError('');
    try {
      const data = await getEmployees();
      setEmployees(data);
      setSelectedEmployeeId((prevSelected) => {
        if (data.length === 0) return null;
        if (prevSelected && data.some((employee) => employee.id === prevSelected)) {
          return prevSelected;
        }
        return data[0].id;
      });
    } catch (error) {
      setEmployeesError(error.message);
      addToast('error', 'Failed to load employees', error.message);
    } finally {
      setEmployeesLoading(false);
    }
  }, [addToast]);

  const loadSummary = useCallback(async () => {
    setSummaryError('');
    try {
      const data = await getDashboardSummary();
      setSummary(data || {});
    } catch (error) {
      setSummaryError(error.message);
    }
  }, []);

  const loadAttendance = useCallback(async () => {
    if (!selectedEmployeeId) {
      setAttendanceRecords([]);
      return;
    }

    setAttendanceLoading(true);
    setAttendanceError('');
    try {
      const data = await getEmployeeAttendance(selectedEmployeeId);
      const filtered = attendanceFilterDate
        ? data.filter((record) => record.date === attendanceFilterDate)
        : data;
      setAttendanceRecords(filtered);
    } catch (error) {
      setAttendanceError(error.message);
    } finally {
      setAttendanceLoading(false);
    }
  }, [attendanceFilterDate, selectedEmployeeId]);

  useEffect(() => {
    loadEmployees();
    loadSummary();
  }, [loadEmployees, loadSummary]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  async function handleCreateEmployee(payload) {
    setEmployeeSaving(true);
    setEmployeesError('');
    try {
      await createEmployee(payload);
      await loadEmployees();
      await loadSummary();
      addToast('success', 'Employee Added!', `${payload.full_name} has been added successfully.`);
    } catch (error) {
      setEmployeesError(error.message);
      addToast('error', 'Failed to add employee', error.message);
      throw error;
    } finally {
      setEmployeeSaving(false);
    }
  }

  function openDeleteModal(employee) {
    setDeleteModal({ isOpen: true, employee, loading: false });
  }

  function closeDeleteModal() {
    setDeleteModal({ isOpen: false, employee: null, loading: false });
  }

  async function handleConfirmDelete() {
    const employee = deleteModal.employee;
    if (!employee) return;

    setDeleteModal((prev) => ({ ...prev, loading: true }));
    setEmployeesError('');
    try {
      await removeEmployee(employee.id);
      await loadEmployees();
      await loadSummary();
      addToast('success', 'Employee Deleted', `${employee.full_name} has been removed.`);
      closeDeleteModal();
    } catch (error) {
      setEmployeesError(error.message);
      addToast('error', 'Failed to delete', error.message);
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  }

  async function handleCreateAttendance(payload) {
    setAttendanceSaving(true);
    setAttendanceError('');
    try {
      await createAttendance(payload);
      await loadSummary();
      const emp = employees.find((e) => e.id === payload.employee);
      addToast('success', 'Attendance Marked!', `${payload.status} recorded for ${emp?.full_name || 'employee'}.`);
      if (selectedEmployeeId === payload.employee) {
        await loadAttendance();
      } else {
        setSelectedEmployeeId(payload.employee);
      }
    } catch (error) {
      setAttendanceError(error.message);
      addToast('error', 'Failed to mark attendance', error.message);
      throw error;
    } finally {
      setAttendanceSaving(false);
    }
  }

  function handleSelectEmployee(employeeId) {
    setAttendanceFilterDate('');
    if (selectedEmployeeId === employeeId) {
      setAttendanceLoading(true);
      setAttendanceError('');
      getEmployeeAttendance(employeeId)
        .then((data) => setAttendanceRecords(data))
        .catch((error) => setAttendanceError(error.message))
        .finally(() => setAttendanceLoading(false));
    } else {
      setSelectedEmployeeId(employeeId);
    }
    attendanceSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '??';
  };

  return (
    <div className="app">
      {/* Toast Notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? All attendance records will also be removed."
        employee={deleteModal.employee}
        onConfirm={handleConfirmDelete}
        onCancel={closeDeleteModal}
        loading={deleteModal.loading}
      />

      {/* Header */}
      <header className="app-header">
        <div className="app-header__left">
          <div className="app-logo">E</div>
          <h1>Ethara HRMS</h1>
        </div>
        <div className="app-header__date">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </header>

      {/* Stats */}
      <DashboardStats summary={summary} totalEmployees={employees.length} />

      {/* Main Layout: Left Panel + Right Content */}
      <div className="main-layout">
        {/* Left Panel - Forms */}
        <div className="panel">
          {/* Add Employee Form */}
          <div className="panel__section">
            <h3 className="panel__title">
              <span className="panel__title-icon">👤</span>
              Add Employee
            </h3>
            <EmployeeForm onSubmit={handleCreateEmployee} loading={employeeSaving} />
          </div>

          {/* Mark Attendance Form */}
          <div className="panel__section">
            <h3 className="panel__title">
              <span className="panel__title-icon">✓</span>
              Mark Attendance
            </h3>
            {employees.length === 0 && !employeesLoading ? (
              <div className="state-box">
                <div className="state-box__icon">📋</div>
                <div className="state-box__title">No Employees</div>
                <div className="state-box__text">Add employees first</div>
              </div>
            ) : (
              <AttendanceForm
                employees={employees}
                selectedEmployeeId={selectedEmployeeId}
                onSubmit={handleCreateAttendance}
                loading={attendanceSaving}
              />
            )}
          </div>
        </div>

        {/* Right Content - Tables */}
        <div className="content-area">
          {/* Employee List */}
          <div className="content-card">
            <div className="content-card__header">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="content-card__title">Employees</span>
                <span className="content-card__count">{employees.length}</span>
              </div>
            </div>
            <div className="content-card__body">
              {employeesError && (
                <div className="state-box state-box--error">
                  <div className="state-box__icon">⚠</div>
                  <div className="state-box__title">Error</div>
                  <div className="state-box__text">{employeesError}</div>
                </div>
              )}
              {employeesLoading ? (
                <div className="state-box state-box--loading">
                  <div className="state-box__icon">⏳</div>
                  <div className="state-box__title">Loading...</div>
                </div>
              ) : employees.length === 0 ? (
                <div className="state-box">
                  <div className="state-box__icon">👥</div>
                  <div className="state-box__title">No Employees Yet</div>
                  <div className="state-box__text">Add your first employee using the form</div>
                </div>
              ) : (
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
                      <tr key={emp.id} className={emp.id === selectedEmployeeId ? 'active' : ''}>
                        <td>
                          <div className="emp-info">
                            <div className="emp-avatar">{getInitials(emp.full_name)}</div>
                            <div>
                              <div className="emp-name">{emp.full_name}</div>
                              <div className="emp-email">{emp.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="tag tag--blue">{emp.employee_id}</span></td>
                        <td><span className="tag tag--gray">{emp.department}</span></td>
                        <td>
                          <div className="actions">
                            <button
                              className={`btn btn--sm ${emp.id === selectedEmployeeId ? 'btn--primary' : 'btn--ghost'}`}
                              onClick={() => handleSelectEmployee(emp.id)}
                            >
                              {emp.id === selectedEmployeeId ? 'Viewing' : 'View'}
                            </button>
                            <button
                              className="btn btn--sm btn--danger"
                              onClick={() => openDeleteModal(emp)}
                              disabled={deleteModal.loading && deleteModal.employee?.id === emp.id}
                            >
                              {deleteModal.loading && deleteModal.employee?.id === emp.id ? (
                                <span className="btn__spinner"></span>
                              ) : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Attendance Records */}
          <div className="content-card" ref={attendanceSectionRef}>
            <div className="content-card__header">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="content-card__title">Attendance Records</span>
                {selectedEmployee && <span className="content-card__count">{attendanceRecords.length}</span>}
              </div>
            </div>

            {selectedEmployee && (
              <>
                <div className="filter-row">
                  <label>Filter by date:</label>
                  <input
                    type="date"
                    value={attendanceFilterDate}
                    onChange={(e) => setAttendanceFilterDate(e.target.value)}
                  />
                  {attendanceFilterDate && (
                    <button onClick={() => setAttendanceFilterDate('')}>Clear</button>
                  )}
                </div>
                <div className="selected-box">
                  <div className="selected-box__info">
                    <div className="emp-avatar">{getInitials(selectedEmployee.full_name)}</div>
                    <div>
                      <div className="emp-name">{selectedEmployee.full_name}</div>
                      <div className="emp-email">{selectedEmployee.email}</div>
                    </div>
                  </div>
                  <div className="selected-box__stats">
                    <div className="selected-box__stat">
                      <div className="selected-box__num selected-box__num--green">{selectedEmployeePresentDays}</div>
                      <div className="selected-box__lbl">Present</div>
                    </div>
                    <div className="selected-box__stat">
                      <div className="selected-box__num selected-box__num--red">{selectedEmployeeAbsentDays}</div>
                      <div className="selected-box__lbl">Absent</div>
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="content-card__body">
              {attendanceError && (
                <div className="state-box state-box--error">
                  <div className="state-box__icon">⚠</div>
                  <div className="state-box__title">Error</div>
                  <div className="state-box__text">{attendanceError}</div>
                </div>
              )}
              {!selectedEmployeeId ? (
                <div className="state-box">
                  <div className="state-box__icon">📊</div>
                  <div className="state-box__title">Select an Employee</div>
                  <div className="state-box__text">Click "View" on any employee to see their attendance</div>
                </div>
              ) : attendanceLoading ? (
                <div className="state-box state-box--loading">
                  <div className="state-box__icon">⏳</div>
                  <div className="state-box__title">Loading...</div>
                </div>
              ) : attendanceRecords.length === 0 ? (
                <div className="state-box">
                  <div className="state-box__icon">📋</div>
                  <div className="state-box__title">No Records</div>
                  <div className="state-box__text">{attendanceFilterDate ? 'No records for this date' : 'No attendance records yet'}</div>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Employee</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceRecords.map((rec) => (
                      <tr key={rec.id}>
                        <td style={{ fontWeight: 500 }}>
                          {new Date(rec.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td>
                          <span className="tag tag--blue">{rec.employee_code}</span>
                          <span style={{ marginLeft: 8, color: 'var(--gray-500)' }}>{rec.employee_name}</span>
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
