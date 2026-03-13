import { useCallback, useState } from 'react';

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, title, message }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((title, message) => addToast('success', title, message), [addToast]);
  const error = useCallback((title, message) => addToast('error', title, message), [addToast]);
  const info = useCallback((title, message) => addToast('info', title, message), [addToast]);

  return { toasts, addToast, removeToast, success, error, info };
}
