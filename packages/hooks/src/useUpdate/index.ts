import { useCallback, useState } from 'react';

const useUpdate = () => {
  const [, setState] = useState({});

  return useCallback(() => setState({}), []);//或使用useMemorized钩子替代useCallback
};

export default useUpdate;
