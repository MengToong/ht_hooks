//!请求失败后延迟 retryInterval 毫秒自动重试，重试最多 retryCount 次


import { useRef } from 'react';
import type { Plugin, Timeout } from '../types';

const useRetryPlugin: Plugin<any, any[]> = (fetchInstance, { retryInterval, retryCount }) => {
  // 👉 retryInterval：两次重试之间的间隔时间（毫秒）。
  // 👉 retryCount：最多重试的次数。
  const timerRef = useRef<Timeout>();
  const countRef = useRef(0);

  const triggerByRetry = useRef(false);


  if (!retryCount) { //如果 retryCount = 0，说明不需要重试，直接返回空插件
    return {};
  }

  return {
    onBefore: () => { //请求前重置失败重试次数，保证每次新请求都从 0 次开始
      if (!triggerByRetry.current) {
        countRef.current = 0;
      }
      triggerByRetry.current = false;

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
    onSuccess: () => {
      countRef.current = 0;
    },
    onError: () => {
      countRef.current += 1;
      if (retryCount === -1 || countRef.current <= retryCount) { //#若没达到重试次数上限
        // Exponential backoff
        const timeout = retryInterval ?? Math.min(1000 * 2 ** countRef.current, 30000);
        timerRef.current = setTimeout(() => {
          triggerByRetry.current = true;
          fetchInstance.refresh(); //!等待 retryInterval 毫秒后再次调用 refresh() 重试
        }, timeout);
      } else {
        countRef.current = 0;
      }
    },
    onCancel: () => { //取消请求或请求完成后，无论成功失败，清理掉定时器，防止残留定时器继续跑重试。
      countRef.current = 0;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    },
  };
};

export default useRetryPlugin;
