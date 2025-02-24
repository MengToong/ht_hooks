import { useEffect, useState } from 'react';
import useDebounceFn from '../useDebounceFn';
import type { DebounceOptions } from './debounceOptions';

function useDebounce<T>(value: T, options?: DebounceOptions) {
  const [debounced, setDebounced] = useState(value);

  const { run } = useDebounceFn(() => {
    setDebounced(value);
  }, options);

  useEffect(() => {
    run();
  }, [value]);

  return debounced;
}

export default useDebounce;


//!课上
const useDebounce2=(value:any,delay:number=500)=>{ //#参数value经过useDebounce2过滤输出的debounceValue取一段时间value没变的最新value
  const [debounceValue,setDebouncedValue]=useState(value);

  useEffect(()=>{
    const timer=setTimeout(()=>{
      setDebouncedValue(value)
    },delay)
    return ()=>{clearTimeout(timer)}
  },
  [value,delay] //#value变化时，执行上一次return（清除定时器）和这次内容（开启新定时器）
  )
  return debounceValue//#定时器触发 setState，会导致组件重新渲染，useDebounce2 会再次执行，返回最新的 debouncedValue
}