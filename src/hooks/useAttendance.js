import { useCallback, useState } from 'react';
import { createAttendance, getEmployeeAttendance } from '../api/client';

export function useAttendance(toast) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadForEmployee = useCallback(async (employeeId, filterDate = '') => {
    if (!employeeId) {
      setRecords([]);
      return [];
    }

    setLoading(true);
    setError('');
    try {
      const data = await getEmployeeAttendance(employeeId);
      const filtered = filterDate
        ? data.filter((record) => record.date === filterDate)
        : data;
      setRecords(filtered);
      return filtered;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload, employeeName) => {
    setSaving(true);
    setError('');
    try {
      await createAttendance(payload);
      toast?.success('Attendance Marked!', `${payload.status} recorded for ${employeeName || 'employee'}.`);
      return true;
    } catch (err) {
      setError(err.message);
      toast?.error('Failed to mark attendance', err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [toast]);

  const getPresentCount = useCallback(() => {
    return records.filter((r) => r.status === 'Present').length;
  }, [records]);

  const getAbsentCount = useCallback(() => {
    return records.filter((r) => r.status === 'Absent').length;
  }, [records]);

  return {
    records,
    loading,
    error,
    saving,
    loadForEmployee,
    create,
    getPresentCount,
    getAbsentCount,
  };
}
