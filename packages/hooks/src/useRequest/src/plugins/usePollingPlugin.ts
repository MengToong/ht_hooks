//!在请求成功或失败之后，隔一段时间自动重新请求，形成“循环请求”
//!每隔 pollingInterval 毫秒重新请求一次
//!根据 pollingWhenHidden 判断
//!如果连续出错次数超过 pollingErrorRetryCount，停止轮询
//!页面恢复可见后，立刻再发请求



import { useRef } from 'react';
import useUpdateEffect from '../../../useUpdateEffect';
import type { Plugin, Timeout } from '../types';
import isDocumentVisible from '../utils/isDocumentVisible';
import subscribeReVisible from '../utils/subscribeReVisible';

const usePollingPlugin: Plugin<any, any[]> = (
  fetchInstance,
  { pollingInterval, pollingWhenHidden = true, pollingErrorRetryCount = -1 },
// fetchInstance：当前请求实例。
// pollingInterval：轮询间隔时间，单位是毫秒。
// pollingWhenHidden：页面不可见时是否继续轮询，默认 true。
// pollingErrorRetryCount：允许错误重试的次数，-1 表示无限次。
) => {
  const timerRef = useRef<Timeout>();//存储轮询定时器
  const unsubscribeRef = useRef<() => void>();//用于取消可见性恢复订阅
  const countRef = useRef<number>(0);//记录连续错误的次数

  const stopPolling = () => { //#定义停止轮询的函数
    if (timerRef.current) {
      clearTimeout(timerRef.current); //清除当前轮询定时器
    }
    unsubscribeRef.current?.(); //清理“页面可见性恢复”的订阅
  };

  useUpdateEffect(() => { //# 如果 pollingInterval 变化，及时清除轮询
    if (!pollingInterval) {
      stopPolling(); //如果 pollingInterval 为 0 或 undefined，停止轮询
    }
  }, [pollingInterval]);

  if (!pollingInterval) { //#如果没配置 pollingInterval，插件啥也不干
    return {};
  }

  return {
    onBefore: () => {
      stopPolling();//每次请求前先停掉上一轮的轮询，避免多次定时器叠加
    },
    onError: () => {
      countRef.current += 1; //如果请求出错，错误计数加 1
    },
    onSuccess: () => {
      countRef.current = 0; //如果请求成功，错误计数清零
    },
    onFinally: () => {
      if ( //如果 允许错误次数 是无限次，或者有限次但还没超限，就继续重新请求
        pollingErrorRetryCount === -1 ||

        (pollingErrorRetryCount !== -1 && countRef.current <= pollingErrorRetryCount)
      ) {
        timerRef.current = setTimeout(() => { //!设置定时器，计时 pollingInterval 毫秒后重新请求，即轮询

          if (!pollingWhenHidden && !isDocumentVisible()) { //如果页面不可见 (document.hidden) 且不允许隐藏时暂停轮询
            unsubscribeRef.current = subscribeReVisible(() => {
              fetchInstance.refresh();//页面恢复可见时refresh重新请求（又会触发onFinally轮询）
            });
          } else {
            fetchInstance.refresh(); 
          }
        }, pollingInterval);
      } else {
        countRef.current = 0; //!超过最大错误次数时：不设置下一个定时器（没有 setTimeout），相当于彻底停掉了轮询
      }
    },
    onCancel: () => {
      stopPolling();
    },
  };
};

export default usePollingPlugin;
