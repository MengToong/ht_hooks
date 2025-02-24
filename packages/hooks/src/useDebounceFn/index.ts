import { debounce } from '../utils/lodash-polyfill';
import { useMemo,useState,useEffect } from 'react';
import type { DebounceOptions } from '../useDebounce/debounceOptions';
import useLatest from '../useLatest';
import useUnmount from '../useUnmount';
import { isFunction } from '../utils';
import isDev from '../utils/isDev';

type noop = (...args: any[]) => any;

function useDebounceFn<T extends noop>(fn: T, options?: DebounceOptions) {
  if (isDev) {
    if (!isFunction(fn)) {
      console.error(`useDebounceFn expected parameter is a function, got ${typeof fn}`);
    }
  }

  const fnRef = useLatest(fn);

  const wait = options?.wait ?? 1000;

  const debounced = useMemo(
    () =>
      debounce(
        (...args: Parameters<T>): ReturnType<T> => {
          return fnRef.current(...args);
        },
        wait,
        options,
      ),
    [],
  );

  useUnmount(() => {
    debounced.cancel();
  });

  return {
    run: debounced,
    cancel: debounced.cancel,
    flush: debounced.flush,
  };
}

export default useDebounceFn;


//课上写法
const useDebounce2=(value:any,delay:number=500)=>{ //#输入的value会一直变化，但经过hook处理后的输出的debouncedValue只会取value一段时间不变后的最新值
  const [debouncedValue,setDebouncedValue]=useState(value)

  useEffect(()=>{
    const timer = setTimeout(()=>{
      setDebouncedValue(value)//一段时间value不变，取debouncedValue未最新的value
    },delay)  
    return ()=>{
    clearTimeout(timer)
  }
  },[value,delay]);//#value更新时执行上一次的return（清楚上次定时器）和本次内容（新建定时器）
  return debouncedValue
}
//setDebouncedValue(value) 触发了 setState，React 组件会重新渲染，useDebounce2 也会重新执行，return debouncedValue 会返回新的值