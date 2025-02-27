import { useRef } from 'react';
import type { useEffect, useLayoutEffect } from 'react';

type EffectHookType = typeof useEffect | typeof useLayoutEffect;

export const createUpdateEffect: (hook: EffectHookType) => EffectHookType =
  (hook) => (effect, deps) => {
    const isMounted = useRef(false);//存储是否挂载过

    // for react-refresh
    hook(() => { //#对刷新页面时做一层过滤
      return () => {
        isMounted.current = false;
      };
    }, []);//!无依赖说明return只会在卸载时执行一次

    hook(() => {
      if (!isMounted.current) {//#若没有挂载过，挂载时将isMounted设置为true，别的啥也不执行
        isMounted.current = true;
      } else {
        return effect();//#若isMounted为true说明挂载过，本次是更新，执行
      }
    }, deps);//!这个hook定义了挂载时什么也不执行，只有更新时执行effect且更新时不执行return
  };
//!两个hook加起来，定义了组件挂载时什么也不执行，更新时只执行内容不执行return，卸载时执行return，
//!否则只要想有更新，那么挂载与更新是粘粘的，只要有return，那么更新与销毁也是粘粘的
export default createUpdateEffect;
