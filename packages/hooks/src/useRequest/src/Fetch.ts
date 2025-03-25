/* eslint-disable @typescript-eslint/no-parameter-properties */
import { isFunction } from '../../utils';
import type { MutableRefObject } from 'react';
import type { FetchState, Options, PluginReturn, Service, Subscribe } from './types';

export default class Fetch<TData, TParams extends any[]> {
  pluginImpls: PluginReturn<TData, TParams>[];

  count: number = 0;

  state: FetchState<TData, TParams> = {
    loading: false, // 请求是否进行中
    params: undefined,// 上一次请求用的参数
    data: undefined, // 请求成功后的数据
    error: undefined,// 请求失败后的错误
  };

  constructor(
    public serviceRef: MutableRefObject<Service<TData, TParams>>,//请求本体
    public options: Options<TData, TParams>,
    public subscribe: Subscribe,//更新的方法
    public initState: Partial<FetchState<TData, TParams>> = {},
  ) {
    this.state = {
      ...this.state,
      loading: !options.manual,//手动请求时loading不加载
      ...initState,
    };
  }

  setState(s: Partial<FetchState<TData, TParams>> = {}) { //最终是在函数式组件中使用，要触发组件更新
    this.state = {
      ...this.state,
      ...s,
    };
    this.subscribe();
  }

  runPluginHandler(event: keyof PluginReturn<TData, TParams>, ...rest: any[]) {//只要是runPluginHandler调用的钩子一定是插件的钩子，而不是option配置里的钩子
    // @ts-ignore
    const r = this.pluginImpls.map((i) => i[event]?.(...rest)).filter(Boolean);
    return Object.assign({}, ...r);
  }

  async runAsync(...params: TParams): Promise<TData> { //!发起一次完整的异步请求，执行插件钩子，并更新状态。
    this.count += 1; //#全局最新请求的编号，每次＋1
    const currentCount = this.count;//#这个请求启动时的编号

    const {
      stopNow = false, //阻止请求直接结束
      returnNow = false, //返回已有数据，不再请求
      ...state //修改状态，比如提前设置 data 或 loading = false
    } = this.runPluginHandler('onBefore', params); //#调用插件的 onBefore 钩子，传入当前请求的参数。只有插件的onBefore钩子返回值可提前停止请求（）

    // stop request
    if (stopNow) { //!如果插件说 stopNow: true，就返回一个永不结束的 Promise，相当于彻底停止本次请求
      return new Promise(() => { });
    }

    this.setState({ //更新 Fetch 的状态
      loading: true,//开始 loading
      params,//记录请求参数
      ...state,//合并插件 onBefore 传来的状态（比如缓存数据）
    });

    // return now
    if (returnNow) {
      return Promise.resolve(state.data); //!如果插件说 returnNow: true，就直接返回缓存数据，不发请求
    }

    this.options.onBefore?.(params); //#执行外部配置的 onBefore 回调（如果有）(这个是配置里的onBefore钩子不是插件的onBefore钩子)

    try {
      // replace service
      let { servicePromise } = this.runPluginHandler('onRequest', this.serviceRef.current, params); //#调用插件的 onRequest 钩子，看看插件要不要用自定义的请求 Promise（比如缓存命中的情况）

      if (!servicePromise) {
        servicePromise = this.serviceRef.current(...params); //!如果插件没有返回 Promise，才调用用户传入的真正请求( service函数 )！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！！
      }

      const res = await servicePromise; //等待请求返回结果

      if (currentCount !== this.count) {  //#判断请求是否还有效，如果在请求过程中用户取消或发起了新的请求（this.count 已变），丢弃本次结果。
        // prevent run.then when request is canceled
        return new Promise(() => { });
      }

      // const formattedResult = this.options.formatResultRef.current ? this.options.formatResultRef.current(res) : res;

      this.setState({ //!请求成功，更新状态
        data: res, //保存数据
        error: undefined, //清空错误，因为已请求成功
        loading: false, //结束 loading因为已请求完毕
      });

      this.options.onSuccess?.(res, params); // #执行option配置的 onSuccess 回调
      this.runPluginHandler('onSuccess', res, params);//#执行插件的 onSuccess 钩子

      this.options.onFinally?.(params, res, undefined);

      if (currentCount === this.count) {
        this.runPluginHandler('onFinally', params, res, undefined); //#执行 onFinally 回调和插件钩子（只有当前请求还有效才执行插件的 onFinally）
      }

      return res; //#最终返回请求结果
    } catch (error) { //!若请求失败
      if (currentCount !== this.count) { //同样检查请求是否还有效，如果是旧请求就丢弃
        // prevent run.then when request is canceled
        return new Promise(() => { });
      }

      this.setState({ // 更新错误状态，关闭 loading
        error, //请求错误
        loading: false, //结束loading因为已请求完毕
      });

      this.options.onError?.(error, params); //# 执行外部的 onError 回调和插件的 onError 钩子
      this.runPluginHandler('onError', error, params);

      this.options.onFinally?.(params, undefined, error);

      if (currentCount === this.count) {
        this.runPluginHandler('onFinally', params, undefined, error); //# 请求失败的情况下，同样执行 onFinally 钩子，传入错误信息
      }

      throw error; //抛出错误，让调用 runAsync() 的地方可以 catch 到
    }
  }

  run(...params: TParams) { //#用来手动发起请求（非 async），不返回 Promise，适合直接触发使用。
    this.runAsync(...params).catch((error) => {
      if (!this.options.onError) {
        console.error(error);
      }
    });
  }

  cancel() { //#取消当前请求，并通知插件。
    this.count += 1; //让正在进行的请求失效（因为 runAsync 每次开始也会检查 count，如果不是最新就丢弃）
    this.setState({
      loading: false,
    });

    this.runPluginHandler('onCancel');//调用插件的 onCancel 钩子（比如用在防抖、节流、轮询里，取消定时器等）
  }

  refresh() { //#用上次请求参数重新请求
    // @ts-ignore  假设你第一次是 run(1, 2)，那 refresh() 等价于 run(1, 2)，不需要你再传参。
    this.run(...(this.state.params || []));
  }

  refreshAsync() { //和 refresh() 相同逻辑，但是 异步 的，返回 Promise。
    // @ts-ignore
    return this.runAsync(...(this.state.params || []));
  }

  mutate(data?: TData | ((oldData?: TData) => TData | undefined)) { //#手动修改 data 数据，不发请求，就像 React 的 setState
    const targetData = isFunction(data) ? data(this.state.data) : data;
    this.runPluginHandler('onMutate', targetData);
    this.setState({
      data: targetData,
    });
  }
}
