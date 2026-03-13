import { useCallback, useState } from 'react';
import { getDashboardSummary } from '../api/client';

export function useDashboard() {
  const [summary, setSummary] = useState({});
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await getDashboardSummary();
      setSummary(data || {});
      return data;
    } catch (err) {
      setError(err.message);
      return {};
    }
  }, []);

  return { summary, error, load };
}
