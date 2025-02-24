/**
 * title: 基础用法
 * desc: 记录上次的 count 值
 */

import { usePrevious } from 'encode-hooks';
import React, { useState } from 'react';

export default () => {
  const [count, setCount] = useState(0);
  const previous = usePrevious(count);//点击按钮state更新重新渲染，重新执行函数组件执行usePrevious
  return (
    <>
      <div>counter current value: {count}</div>
      <div style={{ marginBottom: 8 }}>counter previous value: {previous}</div>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        increase
      </button>
      <button type="button" style={{ marginLeft: 8 }} onClick={() => setCount((c) => c - 1)}>
        decrease
      </button>
    </>
  );
};
