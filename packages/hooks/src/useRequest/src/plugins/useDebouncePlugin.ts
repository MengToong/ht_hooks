//!如果短时间内频繁触发请求，我不立刻发，而是等一段时间用户不再触发时再发请求。

import type { DebouncedFunc, DebounceSettings } from 'lodash-es';
import { debounce } from 'lodash-es';
import { useEffect, useMemo, useRef } from 'react';
import type { Plugin } from '../types';

const useDebouncePlugin: Plugin<any, any[]> = (
  fetchInstance,
  { debounceWait, debounceLeading, debounceTrailing, debounceMaxWait },
  // debounceWait：防抖延迟时间（毫秒）。
  // debounceLeading：是否在延迟开始前触发一次。
  // debounceTrailing：是否在延迟结束后触发一次。
  // debounceMaxWait：最长等待时间。
) => {
  const debouncedRef = useRef<DebouncedFunc<any>>();

  const options = useMemo(() => {
    const ret: DebounceSettings = {};
    if (debounceLeading !== undefined) {
      ret.leading = debounceLeading;
    }
    if (debounceTrailing !== undefined) {
      ret.trailing = debounceTrailing;
    }
    if (debounceMaxWait !== undefined) {
      ret.maxWait = debounceMaxWait;
    }
    return ret;
  }, [debounceLeading, debounceTrailing, debounceMaxWait]);

  useEffect(() => {
    if (debounceWait) {
      const _originRunAsync = fetchInstance.runAsync.bind(fetchInstance);//#保存原始的 runAsync 方法，防止后面被覆盖后丢失。相当于“备份原版”

      debouncedRef.current = debounce( //#lodash中的防抖api,debounce() 返回的是一个被“防抖包裹”的新函数。
        (callback) => {
          callback();
        },
        debounceWait,
        options,
      );

      // debounce runAsync should be promise
      // https://github.com/lodash/lodash/issues/4400#issuecomment-834800398
      fetchInstance.runAsync = (...args) => { //!新的runAsync = 使用lodash中现成debounce进行防抖后的 runAsync
        return new Promise((resolve, reject) => {
          debouncedRef.current?.(() => {
            _originRunAsync(...args)
              .then(resolve)
              .catch(reject);
          });
        });
      };

      return () => {
        debouncedRef.current?.cancel();
        fetchInstance.runAsync = _originRunAsync;
      };
    }
  }, [debounceWait, options]);

  if (!debounceWait) {
    return {};
  }

  return {
    onCancel: () => {
      debouncedRef.current?.cancel();
    },
  };
};

export default useDebouncePlugin;
