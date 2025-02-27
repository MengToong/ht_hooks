import { useRef } from 'react';

function useLatest<T>(value: T) {
  const ref = useRef(value);//初始化值为value
  ref.current = value;//!替代了useEffect中监听变化手动更新ref.current

  return ref;
}

export default useLatest;
