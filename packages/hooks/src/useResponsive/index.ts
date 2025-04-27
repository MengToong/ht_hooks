//!useResponsive只是resize时重新计算响应式状态对象info，若变了则通知所有使用这个hook的组件info变了更新info，其余的不管

import { useEffect, useState } from 'react';
import isBrowser from '../utils/isBrowser';

type Subscriber = () => void;

const subscribers = new Set<Subscriber>();//!发布订阅模式存放所有订阅者方法的集合

type ResponsiveConfig = Record<string, number>;
type ResponsiveInfo = Record<string, boolean>;

let info: ResponsiveInfo; // 在这个文件里，它是“全局的”。在别的文件里，不能直接访问它（除非你显式导出）

let responsiveConfig: ResponsiveConfig = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

function handleResize() {//尺寸变化时触发
  const oldInfo = info;
  calculate();
  if (oldInfo === info) return;//#如果 calculate() 计算出的 响应式状态对象 info 和以前的 oldInfo 相同，说明无需变化布局，直接返回
  for (const subscriber of subscribers) {//# 从subscribers中取出每个订阅者的方法subscriber()执行
    subscriber();
  }
}

let listening = false;

function calculate() {//#根据当前窗口的宽度 (window.innerWidth)，来重新计算每个断点（如 xs, sm, md 等）是否符合当前的宽度要求。然后它将这些结果存储在 info 对象中。
  const width = window.innerWidth;
  const newInfo = {} as ResponsiveInfo;
  let shouldUpdate = false;
  for (const key of Object.keys(responsiveConfig)) {
    newInfo[key] = width >= responsiveConfig[key];
    if (newInfo[key] !== info[key]) {
      shouldUpdate = true;
    }
  }
  if (shouldUpdate) {
    info = newInfo;
  }
}

export function configResponsive(config: ResponsiveConfig) {//允许外部修改响应式配置。接收一个新的 config，并更新全局的 responsiveConfig
  responsiveConfig = config;
  if (info) calculate();
}

export function useResponsive() {
  if (isBrowser && !listening) {
    info = {};
    calculate();
    window.addEventListener('resize', handleResize);//!第一次调用useResponsive时添加一个事件监听器监听resize，触发时重新计算响应式状态对象info，若变了则执行所有订阅者的subscriber方法更新响应式状态对象info
    listening = true;//#事件监听器只创建一个
  }
  const [state, setState] = useState<ResponsiveInfo>(info);//组件内部创建一个响应式副本，叫 state，来源是当前的 info，以后不再关心 info 本身，而是用这个 state 渲染页面。目的不是为了写入info而是为了setState触发重新渲染

  useEffect(() => {
    if (!isBrowser) return;

    // In React 18's StrictMode, useEffect perform twice, resize listener is remove, so handleResize is never perform.
    // https://github.com/alibaba/hooks/issues/1910
    if (!listening) {//事件监听器只创建一个，上面那个创建完了组件里就不会创建了
      window.addEventListener('resize', handleResize);
    }

    const subscriber = () => { //! 1.组件挂载时定义一个subscriber方法来更新自己的响应式状态对象info
      setState(info);
    };

    subscribers.add(subscriber);//! 2.将此subscriber方法添加到发布者的subscribers容器中等待发布者触发
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) { //#最后一个使用useResponsive的组件被卸载时才移除事件监听器
        window.removeEventListener('resize', handleResize);
        listening = false;
      }
    };
  }, []);

  return state;
}
