import { useRef } from 'react';

export type ShouldUpdateFunc<T> = (prev: T | undefined, next: T) => boolean;

const defaultShouldUpdate = <T>(a?: T, b?: T) => !Object.is(a, b);//判断两值是否一致决定是否更新

function usePrevious<T>(
  state: T,
  shouldUpdate: ShouldUpdateFunc<T> = defaultShouldUpdate,
): T | undefined {
  const prevRef = useRef<T>();//初始prevRef.current=undefined
  const curRef = useRef<T>();//初始curRef.current=undefined

  if (shouldUpdate(curRef.current, state)) {//初始初始curRef.current=undefined肯定不等于state，需要更新
    prevRef.current = curRef.current;
    curRef.current = state;
  }

  return prevRef.current;
}

export default usePrevious;
