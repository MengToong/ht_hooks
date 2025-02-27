/**
 * title: 基础用法
 * desc: useLatest 返回的永远是最新值
 */

import React, { useState, useEffect } from 'react';
import { useLatest } from 'ht_hooks';

// export default () => {
//   const [count, setCount] = useState(0);

//   const latestCountRef = useLatest(count);
//   //const latestCountRef = useRef(count)

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCount(latestCountRef.current + 1);
//     }, 1000);
//     return () => clearInterval(interval);//#开定时器了就得清除，有依赖项就是依赖项变时清除上一个，没有依赖项就只是组件卸载时清除
//   }, []);
  
//   return (
//     <>
//       <p>count: {count}</p>
//     </>
//   );
// };
export default () => {
  const [count, setCount] = useState(0);

  const latestCountRef = useLatest(count);
  //const latestCountRef = useRef(count)


  const jia=()=>{
    setCount(count + 1);
    setTimeout(()=>{console.log('count:',latestCountRef.current)},0)
  }
      


  
  return (
    <>
      <p>count: {count}</p>
      <button onClick={jia}>点我+1</button>
    </>
  );
};
