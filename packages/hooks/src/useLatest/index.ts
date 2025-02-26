import { useRef } from 'react';

function useLatest<T>(value: T) {
  const ref = useRef(value);//初始化值为value
  ref.current = value;//在每次渲染时，ref.current 会手动更新为最新的 value。这就保证了 ref 始终保持最新的值

  return ref;
}

export default useLatest;
