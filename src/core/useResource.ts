import { useCallback, useEffect, useState } from 'react';
import { errorMessage, request } from './api';
export function useResource<T>(path: string) {
  const [state, setState] = useState<{ path: string; revision: number; data: T | null; error: string | null; status: number | null; loading: boolean }>({ path, revision: 0, data: null, error: null, status: null, loading: true });
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    request<T>(path, { signal: controller.signal }).then((data) => {
      if (!controller.signal.aborted) setState({ path, revision, data, error: null, status: null, loading: false });
    }).catch((error) => {
      if (!controller.signal.aborted) setState({ path, revision, data: null, error: errorMessage(error), status: error?.status ?? null, loading: false });
    });
    return () => controller.abort();
  }, [path, revision]);
  return { ...(state.path === path && state.revision === revision ? state : { data: null, error: null, status: null, loading: true }), reload };
}
