import { useEffect, useState } from 'react';
import useThrottleFn from '../useThrottleFn';
import type { ThrottleOptions } from './throttleOptions';

function useThrottle<T>(value: T, options?: ThrottleOptions) {
  const [throttled, setThrottled] = useState(value);

  const { run } = useThrottleFn(() => {
    setThrottled(value);
  }, options);

  useEffect(() => {
    run();
  }, [value]);

  return throttled;
}

export default useThrottle;


//!课上的
type Callback=(...args:any[])=>void //定义了一个可以接受任意数量类型参数的，并且没有返回值的回调函数类型

const useThrottle2=(callback:Callback,delay:number=500)=>{
  const throttleCallback=()=>{
    
  }
}