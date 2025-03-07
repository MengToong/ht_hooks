//!在页面重新聚焦（用户切回页面）时，自动重新请求（refresh），可以设置最小时间间隔，避免切换太频繁导致重复请求。

import { useEffect, useRef } from 'react';
import useUnmount from '../../../useUnmount';
import type { Plugin } from '../types';
import limit from '../utils/limit';
import subscribeFocus from '../utils/subscribeFocus';

const useRefreshOnWindowFocusPlugin: Plugin<any, any[]> = (
  fetchInstance,
  { refreshOnWindowFocus, focusTimespan = 5000 },
) => {
  const unsubscribeRef = useRef<() => void>();

  const stopSubscribe = () => {
    unsubscribeRef.current?.();
  };

  useEffect(() => {
    if (refreshOnWindowFocus) { //当配置了 refreshOnWindowFocus: true 时，才启用页面聚焦自动刷新功能。
      const limitRefresh = limit(fetchInstance.refresh.bind(fetchInstance), focusTimespan); //#用 limit() 包裹 refresh()，控制在 focusTimespan 时间内只允许刷新一次，防止频繁切换窗口疯狂触发。
      unsubscribeRef.current = subscribeFocus(() => {
        limitRefresh(); //!订阅窗口聚焦事件，每次聚焦就调用 limitRefresh()即refresh重新请求
      });
    }
    return () => {
      stopSubscribe();
    };
  }, [refreshOnWindowFocus, focusTimespan]);

  useUnmount(() => {
    stopSubscribe();
  });

  return {};
};

export default useRefreshOnWindowFocusPlugin;
