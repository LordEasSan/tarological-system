/**
 * TokenSync — syncs TokenContext state to the module-level LLM API bridge.
 * Must be rendered inside TokenProvider.
 */

import { useEffect } from 'react';
import { useToken } from '../../context/TokenContext';
import { setClientToken } from '../../api/llm';

export function TokenSync() {
  const { token } = useToken();

  useEffect(() => {
    setClientToken(token);
  }, [token]);

  return null;
}
