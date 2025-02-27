import { useEffect } from 'react';
import useLatest from '../useLatest';
import { isFunction } from '../utils';
import isDev from '../utils/isDev';

const useUnmount = (fn: () => void) => {
  if (isDev) {
    if (!isFunction(fn)) {
      console.error(`useUnmount expected parameter is a function, got ${typeof fn}`);//这个报错是因为useUnmount的参数必须是一个函数
    }
  }

  const fnRef = useLatest(fn);//!使用useLatest保存fn，实时更新最新的fn，且能获取到最新的fn不落入闭包陷阱

  useEffect(
    () => () => {
      fnRef.current();//!调用useEffect实现卸载时执行
    },
    [],
  );
};

export default useUnmount;
