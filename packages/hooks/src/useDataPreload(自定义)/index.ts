import { useEffect, useState } from 'react';


//使用示例：
const { states } = useDataPreload([ //!参数为请求配置数组，定义要并发哪些请求，以及请求依赖
  { key: 'user', url: '/api/user' },
  { 
    key: 'orders', 
    url: '/api/orders',
    dependencies: ['user']  // 先等user请求完成
  }
]);


const useDataPreload = (requests) => {
  const [states, setStates] = useState({});

  useEffect(() => {
    // 存储所有请求的Promise
    const requestPromises = {};

    const fetchData = async (req) => {
      // 如果有依赖，先等依赖请求完成
      if (req.dependencies) { //#若有依赖则先等待依赖
        await Promise.all(req.dependencies.map(depKey => requestPromises[depKey]));
      }

      // 发送请求并存储Promise
      requestPromises[req.key] = fetch(req.url) //#包装请求配置数组，发送请求并记录结果promise用于promise.all
        .then(res => res.json())
        .then(data => {
          setStates(prev => ({ ...prev, [req.key]: { data } }));
          return data;
        })
        .catch(error => {
          setStates(prev => ({ ...prev, [req.key]: { error } }));
        });
    };

    // 并行发起所有请求（会自动处理依赖顺序）
    requests.forEach(req => fetchData(req));//!遍历请求配置数组进行处理
  }, [requests]);

  return { states };
};


