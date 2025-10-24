import { useEffect } from 'react';

/**
 * useScrollRestoration Hook
 * 用于在组件加载时恢复滚动位置，组件卸载时保存滚动位置。
 * 支持传入 ref 来绑定任意可滚动 DOM 元素，使用 sessionStorage 存储滚动状态。
 * @param {string} key - 用于在 sessionStorage 中唯一标识该元素
 * @param {React.RefObject} ref - 要绑定滚动的 DOM 元素（可选，默认绑定 window）
 */
function useScrollRestore(key, ref) {
  // 监听组件挂载与卸载生命周期
  useEffect(() => {
    //! ---------- 挂载时：尝试恢复滚动位置 ----------

    
    const saved = sessionStorage.getItem(`scroll-position-${key}`);//# 从 sessionStorage 中获取滚动数据（格式为 JSON 字符串）

    // 解析为对象
    const position = saved ? JSON.parse(saved) : null;

    // 如果 ref 存在且绑定了 DOM 元素
    if (ref?.current && position) {
      // 设置容器的 scrollLeft 和 scrollTop
      ref.current.scrollLeft = position.left;//#恢复滚动位置
      ref.current.scrollTop = position.top;
    }

    // 如果 ref 不存在（默认监听 window），且有保存数据
    if (!ref?.current && position) {
      // 滚动整个页面到指定位置
      window.scrollTo(position.left, position.top);
    }

    //! ---------- 卸载时：保存当前滚动位置 ----------
    return () => {
      let left = 0;
      let top = 0;
      
      if (ref?.current) {//# 如果绑定了某个 DOM 元素，则获取滚动位置
        left = ref.current.scrollLeft;
        top = ref.current.scrollTop;
      } else {
        // 否则读取 window 的滚动状态
        left = window.scrollX;
        top = window.scrollY;
      }

      sessionStorage.setItem(//# 将滚动位置以 JSON 格式保存到 sessionStorage 中，key为参数传入
        `scroll-position-${key}`,
        JSON.stringify({ left, top })
      );
    };
  }, [key, ref]); // 依赖项：key 和 ref
}

export default useScrollRestore;



//示例1：恢复页面滚动位置
// import React from 'react';
// import useScrollRestoration from './useScrollRestoration';

function Page() {
  // 使用 pathname 作为唯一标识，确保每个页面互不干扰
  useScrollRestore(window.location.pathname,null);

  return (
    <div style={{ height: 2000 }}>
      滚动后切换页面,再返回会自动恢复滚动位置(window)
    </div>
  );
}

//示例2：监听容器（传 ref）
import React, { useRef } from 'react';
function ScrollBox() {
  const boxRef = useRef(null);

  // 传入自定义 key 和 ref
  useScrollRestoration('scroll-box-key', boxRef);

  return (
    <div
      ref={boxRef}
      style={{ height: 300, overflow: 'auto', border: '1px solid black' }}
    >
      <div style={{ height: 1500 }}>
        容器滚动内容区域
      </div>
    </div>
  );
}
