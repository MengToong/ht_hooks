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
type fn=(...args:any[])=>void //定义了一个可以接受任意数量类型参数的，并且没有返回值的回调函数类型

// const useThrottle2=(callback:Callback,delay:number=500)=>{
//   const throttleCallback=()=>{
    
//   }
// }

function useThrottle3(fn:fn, t:number) {
  let timer:NodeJS.Timeout|null = null;
  useEffect(()=>{ //#使useThrottle3所在组件被卸载时若正在计时则清除定时器，防止执行定时器回调导致问题
    return()=>{
      if(timer)clearTimeout(timer)
    }
  })

  return function () {
    if (!timer) { //#若timer有值说明正在计时中则什么都不做，若timer没值（计时结束定时器自动清除，timer手动清空）说明此时无计时，则开启定时，结束后执行然后关闭定时器
      timer = setTimeout(() => {
        fn();
        timer = null;
      }, t);
    }
  };
}
