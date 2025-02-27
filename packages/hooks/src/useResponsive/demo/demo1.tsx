/**
 * title: 在组件中获取响应式信息
 * desc: 在组件中调用 useResponsive 可以获取并订阅浏览器窗口的响应式信息。
 */

import React from 'react';
import { configResponsive, useResponsive } from 'ht_hooks';

configResponsive({//修改响应式配置
  small: 0,
  middle: 800,
  large: 1200,
});

export default function () {
  const responsive = useResponsive();
  //为响应式状态对象,形为：
  // {
  //   small: true,
  //   middle: true,
  //   large: false,
  // }
  return (
    <>
      <p>Please change the width of the browser window to see the effect: </p>
      {Object.keys(responsive).map((key) => (
        <p key={key}>
          {key} {responsive[key] ? '✔' : '✘'}
        </p>
      ))}
    </>
  );
}
