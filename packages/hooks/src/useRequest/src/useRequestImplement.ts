import useCreation from '../../useCreation';
import useLatest from '../../useLatest';
import useMemoizedFn from '../../useMemoizedFn';
import useMount from '../../useMount';
import useUnmount from '../../useUnmount';
import useUpdate from '../../useUpdate';
import isDev from '../../utils/isDev';

import Fetch from './Fetch';
import type { Options, Plugin, Result, Service } from './types';

function useRequestImplement<TData, TParams extends any[]>(
  service: Service<TData, TParams>, //请求函数，传进来的
  options: Options<TData, TParams> = {}, //配置项，比如 manual、defaultParams、onSuccess 等
  plugins: Plugin<TData, TParams>[] = [], //插件数组，像缓存、轮询、节流、防抖等
) {
  const { manual = false, ...rest } = options; // 拆解 options。manual = false 表示默认“自动请求” 。其他选项继续存在 rest 里

  if (isDev) { //开发环境校验 defaultParams 必须是数组
    if (options.defaultParams && !Array.isArray(options.defaultParams)) {
      console.warn(`expected defaultParams is array, got ${typeof options.defaultParams}`);
    }
  }

  const fetchOptions = { //合并最终的 fetch 配置
    manual,
    ...rest,
  };

  const serviceRef = useLatest(service); //解决闭包陷阱问题，确保拿到最新的 service 函数引用

  const update = useUpdate();//创建一个更新的动作。这是一个触发 React 组件强制刷新的函数，Fetch.setState() 就靠它

  //创建 fetchInstance 实例
  const fetchInstance = useCreation(() => { //用 useCreation 保证 fetchInstance 只初始化一次//#得到Fetch类的实例fetchInstance
    const initState = plugins.map((p) => p?.onInit?.(fetchOptions)).filter(Boolean);
    //#对于参数三的插件数组，如果插件有OnInit的话，执行插件的OnInit(fetchOptions)。map会将所有插件OnInit的返回值收集为一个数组，用filter过滤掉 undefined 的，剩下存入initState。（initState是所有有OnInit的插件执行OnInit返回结果的数组）
    return new Fetch<TData, TParams>( //!实例化Fetch ，Fetch 是核心类，负责具体的请求控制、状态管理等
      serviceRef,
      fetchOptions, //请求配置参数
      update, //通知 React 更新组件的函数
      Object.assign({}, ...initState), //用插件初始化状态合并成的对象
    );
  }, []);//无依赖项表示只在第一次渲染初始化，后续不会重复构建 fetchInstance
  fetchInstance.options = fetchOptions; //再赋值一次，保证 Fetch 内部的 options 最新
  // run all plugins hooks
  fetchInstance.pluginImpls = plugins.map((p) => p(fetchInstance, fetchOptions));//!将所有插件的钩子都收集到fetch实例pluginImpls属性里
  //#遍历所有插件。
  //#执行插件的主函数，传入：
  //#fetchInstance（让插件能操作 Fetch，比如 fetchInstance.setState()）
  //#fetchOptions（让插件能读取配置信息）。
  //#每个插件会返回它的生命周期钩子合集（比如 onBefore、onSuccess）。
  //#收集这些钩子合集，存到 pluginImpls 里。

  useMount(() => {//!若设置了manual=false，才在挂载时就自动请求（之后也可手动请求）
    if (!manual) { 
      // useCachePlugin can set fetchInstance.state.params from cache when init
      const params = fetchInstance.state.params || options.defaultParams || [];
      // @ts-ignore
      fetchInstance.run(...params);
    }
  });

  useUnmount(() => { //#卸载时取消请求
    fetchInstance.cancel();
  });

  return { //!调用useRequest实际返回的结果，其实都是fetch实例的状态和方法
    loading: fetchInstance.state.loading, //请求状态
    data: fetchInstance.state.data, //请求返回数据，//!虽然还没run没有实际请求结果，但是先返回，别人先拿着，run时底层调用setState更新data，别人手里拿的data自然就变的有值了
    error: fetchInstance.state.error, //请求错误信息
    params: fetchInstance.state.params || [], //请求参数
    cancel: useMemoizedFn(fetchInstance.cancel.bind(fetchInstance)), //取消请求的方法
    refresh: useMemoizedFn(fetchInstance.refresh.bind(fetchInstance)), // 重新请求的方法
    refreshAsync: useMemoizedFn(fetchInstance.refreshAsync.bind(fetchInstance)), //异步刷新
    run: useMemoizedFn(fetchInstance.run.bind(fetchInstance)), //手动运行请求的方法
    runAsync: useMemoizedFn(fetchInstance.runAsync.bind(fetchInstance)), //异步运行请求的方法
    mutate: useMemoizedFn(fetchInstance.mutate.bind(fetchInstance)), //手动修改数据
  } as Result<TData, TParams>;
}

export default useRequestImplement;
