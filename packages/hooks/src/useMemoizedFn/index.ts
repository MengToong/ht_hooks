import { useMemo, useRef } from 'react';
import { isFunction } from '../utils';
import isDev from '../utils/isDev';

type noop = (this: any, ...args: any[]) => any;

type PickFunction<T extends noop> = (
  this: ThisParameterType<T>,
  ...args: Parameters<T>
) => ReturnType<T>;

function useMemoizedFn<T extends noop>(fn: T) {
  if (isDev) {
    if (!isFunction(fn)) {
      console.error(`useMemoizedFn expected parameter is a function, got ${typeof fn}`);
    }
  }

  const fnRef = useRef<T>(fn);//!使用useRef在fnRef.current中保存参数函数，保持在组件的生命周期中，而不因渲染而重置且一直是最新的

  // why not write `fnRef.current = fn`?
  // https://github.com/alibaba/hooks/issues/728
  fnRef.current = useMemo(() => fn, [fn]);//!只有参数函数变化时才更新fnRef.current，但只是更新内容，fnRef.current地址始终不变

  const memoizedFn = useRef<PickFunction<T>>();
  if (!memoizedFn.current) {//若ref不存在才创建
    memoizedFn.current = function (this, ...args) {
      return fnRef.current.apply(this, args);//创建的始终是最新的，不需要useCallback中dependence关联
    };
  }

  return memoizedFn.current as T;
}

export default useMemoizedFn;
