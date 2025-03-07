//!控制请求的“自动触发”行为，比如是否在初始化或依赖变化后自动请求


import { useRef } from 'react';
import useUpdateEffect from '../../../useUpdateEffect';
import type { Plugin } from '../types';

// support refreshDeps & ready
const useAutoRunPlugin: Plugin<any, any[]> = (
  fetchInstance,
  { manual, ready = true, defaultParams = [], refreshDeps = [], refreshDepsAction },
// manual：是否手动触发，true 表示不自动请求。
// ready：是否准备好请求，false 则不请求。
// refreshDeps：依赖数组，变化时触发刷新请求。
// refreshDepsAction：依赖变化时调用的自定义函数，默认就是 refresh()。
) => {
  const hasAutoRun = useRef(false);
  hasAutoRun.current = false;

  useUpdateEffect(() => { //!使用useEffect,ready变化时若变为true则进行run请求
    if (!manual && ready) {
      hasAutoRun.current = true;
      fetchInstance.run(...defaultParams);
    }
  }, [ready]);

  useUpdateEffect(() => { //!使用useEffect,依赖变化时refresh重新请求
    if (hasAutoRun.current) {
      return;
    }
    if (!manual) {
      hasAutoRun.current = true;
      if (refreshDepsAction) {
        refreshDepsAction();
      } else {
        fetchInstance.refresh();
      }
    }
  }, [...refreshDeps]);

  return {
    onBefore: () => { //在请求开始前判断：如果 ready === false，就直接阻止请求（通过 stopNow: true）
      if (!ready) {
        return {
          stopNow: true,
        };
      }
    },
  };
};

useAutoRunPlugin.onInit = ({ ready = true, manual }) => {
  return {
    loading: !manual && ready,
  };
};

export default useAutoRunPlugin;
