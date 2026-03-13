import { useCallback, useState } from 'react';
import { createEmployee, getEmployees, removeEmployee } from '../api/client';

export function useEmployees(toast) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getEmployees();
      setEmployees(data);
      return data;
    } catch (err) {
      setError(err.message);
      toast?.error('Failed to load employees', err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const create = useCallback(async (payload) => {
    setSaving(true);
    setError('');
    try {
      await createEmployee(payload);
      toast?.success('Employee Added!', `${payload.full_name} has been added successfully.`);
      return true;
    } catch (err) {
      setError(err.message);
      toast?.error('Failed to add employee', err.message);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [toast]);

  const remove = useCallback(async (employee) => {
    setError('');
    try {
      await removeEmployee(employee.id);
      toast?.success('Employee Deleted', `${employee.full_name} has been removed.`);
      return true;
    } catch (err) {
      setError(err.message);
      toast?.error('Failed to delete', err.message);
      throw err;
    }
  }, [toast]);

  return {
    employees,
    loading,
    error,
    saving,
    load,
    create,
    remove,
  };
}
