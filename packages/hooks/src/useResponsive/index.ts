import { useEffect, useState } from 'react';
import isBrowser from '../utils/isBrowser';

type Subscriber = () => void;

const subscribers = new Set<Subscriber>();

type ResponsiveConfig = Record<string, number>;
type ResponsiveInfo = Record<string, boolean>;

let info: ResponsiveInfo;

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
  for (const subscriber of subscribers) {//#触发发布订阅模式的每个订阅者的subscriber()即setState(info)来
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
    window.addEventListener('resize', handleResize);//#1.尺寸改变时触发
    listening = true;
  }
  const [state, setState] = useState<ResponsiveInfo>(info);

  useEffect(() => {
    if (!isBrowser) return;

    // In React 18's StrictMode, useEffect perform twice, resize listener is remove, so handleResize is never perform.
    // https://github.com/alibaba/hooks/issues/1910
    if (!listening) {
      window.addEventListener('resize', handleResize);
    }

    const subscriber = () => {
      setState(info);
    };

    subscribers.add(subscriber);//发布订阅模式添加订阅者
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0) {
        window.removeEventListener('resize', handleResize);
        listening = false;
      }
    };
  }, []);

  return state;
}
