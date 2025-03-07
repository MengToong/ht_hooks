//!请求开始时不立刻 loading = true。（外部设置的loading = true是显示loading...字样）
//!先等待 loadingDelay 毫秒，如果请求还没结束，再设置 loading = true。
//!防止请求很快但还要显示loading大破之看起来一闪而过的情况

import { useRef } from 'react';
import type { Plugin, Timeout } from '../types';

const useLoadingDelayPlugin: Plugin<any, any[]> = (fetchInstance, { loadingDelay, ready }) => { //从配置参数 options 解构出 loadingDelay（延迟时间）和 ready（是否准备好执行）
  const timerRef = useRef<Timeout>(); // 用 useRef 定义一个定时器引用，防止重新渲染时丢失定时器

  if (!loadingDelay) { // #如果没设置 loadingDelay，说明不需要延迟 loading，直接退出插件（返回空对象，啥生命周期钩子都不注入）
    return {};
  }

  const cancelTimeout = () => { //定义取消定时器的函数，避免多次请求叠加定时器，或者在请求结束后清理
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  return {
    onBefore: () => {
      cancelTimeout(); //先取消上一个定时器，避免上次未清除的残留定时器影响

      // Two cases:
      // 1. ready === undefined
      // 2. ready === true
      if (ready !== false) {
        timerRef.current = setTimeout(() => { //!设置一个定时器，定时时间到了才将loading改为true. 如果请求很快完成，可能这个定时器都不会触发（这正是优化点）
          fetchInstance.setState({
            loading: true,
          });
        }, loadingDelay);
      }

      return {
        loading: false,//在请求刚开始时，先确保 loading: false，等延迟后再设置 true（如果请求还没结束的话）
      };
    },
    onFinally: () => {
      cancelTimeout();
    },
    onCancel: () => {
      cancelTimeout();
    },
  };
};

export default useLoadingDelayPlugin;
