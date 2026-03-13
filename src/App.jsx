import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Hooks
import { useToast, useEmployees, useAttendance, useDashboard } from './hooks';

// Components
import { Header } from './components/layout';
import DashboardStats from './components/DashboardStats';
import EmployeeForm from './components/employees/EmployeeForm';
import EmployeeList from './components/employees/EmployeeList';
import AttendanceForm from './components/attendance/AttendanceForm';
import AttendanceList from './components/attendance/AttendanceList';
import SelectedEmployeeBox from './components/attendance/SelectedEmployeeBox';
import ConfirmModal from './components/ui/ConfirmModal';
import Toast from './components/ui/Toast';
import DateFilter from './components/ui/DateFilter';
import StateBox from './components/ui/StateBox';

export default function App() {
  const attendanceSectionRef = useRef(null);
  
  // Toast notifications
  const toast = useToast();
  
  // Data hooks
  const employees = useEmployees(toast);
  const attendance = useAttendance(toast);
  const dashboard = useDashboard();
  
  // Selection state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [attendanceFilterDate, setAttendanceFilterDate] = useState('');
  
  // Modal state
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    employee: null,
    loading: false,
  });

  // Computed values
  const selectedEmployee = useMemo(
    () => employees.employees.find((emp) => emp.id === selectedEmployeeId),
    [employees.employees, selectedEmployeeId]
  );

  // Initial data load
  useEffect(() => {
    async function loadInitialData() {
      const data = await employees.load();
      await dashboard.load();
      
      if (data.length > 0) {
        setSelectedEmployeeId(data[0].id);
      }
    }
    loadInitialData();
  }, []);

  // Load attendance when employee or filter changes
  useEffect(() => {
    attendance.loadForEmployee(selectedEmployeeId, attendanceFilterDate);
  }, [selectedEmployeeId, attendanceFilterDate]);

  // Handlers
  const handleCreateEmployee = useCallback(async (payload) => {
    await employees.create(payload);
    const data = await employees.load();
    await dashboard.load();
    
    // Select newly created employee
    if (data.length > 0 && !selectedEmployeeId) {
      setSelectedEmployeeId(data[0].id);
    }
  }, [employees, dashboard, selectedEmployeeId]);

  const handleSelectEmployee = useCallback((employeeId) => {
    setAttendanceFilterDate('');
    setSelectedEmployeeId(employeeId);
    attendanceSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleCreateAttendance = useCallback(async (payload) => {
    const emp = employees.employees.find((e) => e.id === payload.employee);
    await attendance.create(payload, emp?.full_name);
    await dashboard.load();
    
    if (selectedEmployeeId === payload.employee) {
      await attendance.loadForEmployee(selectedEmployeeId, attendanceFilterDate);
    } else {
      setSelectedEmployeeId(payload.employee);
    }
  }, [employees.employees, attendance, dashboard, selectedEmployeeId, attendanceFilterDate]);

  const openDeleteModal = useCallback((employee) => {
    setDeleteModal({ isOpen: true, employee, loading: false });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModal({ isOpen: false, employee: null, loading: false });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    const employee = deleteModal.employee;
    if (!employee) return;

    setDeleteModal((prev) => ({ ...prev, loading: true }));
    
    try {
      await employees.remove(employee);
      const data = await employees.load();
      await dashboard.load();
      
      // Select first employee if deleted one was selected
      if (selectedEmployeeId === employee.id) {
        setSelectedEmployeeId(data.length > 0 ? data[0].id : null);
      }
      
      closeDeleteModal();
    } catch {
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  }, [deleteModal.employee, employees, dashboard, selectedEmployeeId, closeDeleteModal]);

  return (
    <div className="app">
      {/* Toast Notifications */}
      <Toast toasts={toast.toasts} removeToast={toast.removeToast} />

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
      <Header />

      {/* Stats */}
      <DashboardStats
        summary={dashboard.summary}
        totalEmployees={employees.employees.length}
      />

      {/* Main Layout: Left Panel + Right Content */}
      <div className="main-layout">
        {/* Left Panel - Forms */}
        <aside className="panel">
          {/* Add Employee Form */}
          <section className="panel__section">
            <h3 className="panel__title">
              <span className="panel__title-icon">👤</span>
              Add Employee
            </h3>
            <EmployeeForm onSubmit={handleCreateEmployee} loading={employees.saving} />
          </section>

          {/* Mark Attendance Form */}
          <section className="panel__section">
            <h3 className="panel__title">
              <span className="panel__title-icon">✓</span>
              Mark Attendance
            </h3>
            {employees.employees.length === 0 && !employees.loading ? (
              <StateBox icon="📋" title="No Employees" text="Add employees first" />
            ) : (
              <AttendanceForm
                employees={employees.employees}
                selectedEmployeeId={selectedEmployeeId}
                onSubmit={handleCreateAttendance}
                loading={attendance.saving}
              />
            )}
          </section>
        </aside>

        {/* Right Content - Tables */}
        <main className="content-area">
          {/* Employee List */}
          <section className="content-card">
            <div className="content-card__header">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="content-card__title">Employees</span>
                <span className="content-card__count">{employees.employees.length}</span>
              </div>
            </div>
            <div className="content-card__body">
              <EmployeeList
                employees={employees.employees}
                loading={employees.loading}
                error={employees.error}
                selectedId={selectedEmployeeId}
                onSelect={handleSelectEmployee}
                onDelete={openDeleteModal}
                deletingId={deleteModal.loading ? deleteModal.employee?.id : null}
              />
            </div>
          </section>

          {/* Attendance Records */}
          <section className="content-card" ref={attendanceSectionRef}>
            <div className="content-card__header">
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="content-card__title">Attendance Records</span>
                {selectedEmployee && (
                  <span className="content-card__count">{attendance.records.length}</span>
                )}
              </div>
            </div>

            {selectedEmployee && (
              <>
                <DateFilter
                  value={attendanceFilterDate}
                  onChange={setAttendanceFilterDate}
                  onClear={() => setAttendanceFilterDate('')}
                />
                <SelectedEmployeeBox
                  employee={selectedEmployee}
                  presentCount={attendance.getPresentCount()}
                  absentCount={attendance.getAbsentCount()}
                />
              </>
            )}

            <div className="content-card__body">
              <AttendanceList
                records={attendance.records}
                loading={attendance.loading}
                error={attendance.error}
                selectedEmployeeId={selectedEmployeeId}
                filterDate={attendanceFilterDate}
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
