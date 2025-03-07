import type { DependencyList } from 'react';
import type Fetch from './Fetch';
import type { CachedData } from './utils/cache';

export type Service<TData, TParams extends any[]> = (...args: TParams) => Promise<TData>;//!请求本体，如axios.get(`/api/user/${id}`).then(res => res.data)
export type Subscribe = () => void;

// for Fetch

export interface FetchState<TData, TParams extends any[]> { // #存储请求的四大状态
  loading: boolean; //是否加载中
  params?: TParams; //请求参数
  data?: TData; //请求结果
  error?: Error; //请求错误
}

export interface PluginReturn<TData, TParams extends any[]> { //#插件函数返回值类型，是各种钩子
  onBefore?: (params: TParams) => //*请求刚准备开始时钩子 （可以阻止请求）
    | ({
        stopNow?: boolean;
        returnNow?: boolean;
      } & Partial<FetchState<TData, TParams>>)
    | void;

  onRequest?: ( //*发起请求前钩子
    service: Service<TData, TParams>,
    params: TParams,
  ) => {
    servicePromise?: Promise<TData>;
  };

  onSuccess?: (data: TData, params: TParams) => void;   //*请求成功后钩子
  onError?: (e: Error, params: TParams) => void;   //*请求失败后钩子
  onFinally?: (params: TParams, data?: TData, e?: Error) => void; //*成功或失败后必执行的钩子
  onCancel?: () => void;  //*取消请求时钩子
  onMutate?: (data: TData) => void; //*mutate() 调用时钩子
}

// for useRequestImplement

export interface Options<TData, TParams extends any[]> { //#外部传入的配置选项，比如是否手动触发、回调、缓存、节流等
  manual?: boolean; //是否手动触发请求，默认自动请求

  onBefore?: (params: TParams) => void; //请求前触发的回调（无阻断能力）//!配置里的钩子，不同于插件的钩子
  onSuccess?: (data: TData, params: TParams) => void; //请求成功的回调
  onError?: (e: Error, params: TParams) => void; //请求失败的回调
  // formatResult?: (res: any) => TData;
  onFinally?: (params: TParams, data?: TData, e?: Error) => void; //无论成功失败，最后都会执行

  defaultParams?: TParams; //自动请求时用的默认参数

  // refreshDeps
  refreshDeps?: DependencyList; //依赖变化时重新请求
  refreshDepsAction?: () => void;

  // loading delay
  loadingDelay?: number;

  // polling
  pollingInterval?: number; //轮询时间间隔（毫秒）
  pollingWhenHidden?: boolean;
  pollingErrorRetryCount?: number;

  // refresh on window focus
  refreshOnWindowFocus?: boolean;
  focusTimespan?: number;

  // debounce
  debounceWait?: number; //防抖等待时间
  debounceLeading?: boolean;
  debounceTrailing?: boolean;
  debounceMaxWait?: number;

  // throttle
  throttleWait?: number; //节流等待时间
  throttleLeading?: boolean;
  throttleTrailing?: boolean;

  // cache
  cacheKey?: string; //缓存 key，开启缓存用
  cacheTime?: number; //缓存有效期
  staleTime?: number; //过期但可用的数据保留时长
  setCache?: (data: CachedData<TData, TParams>) => void;
  getCache?: (params: TParams) => CachedData<TData, TParams> | undefined;

  // retry
  retryCount?: number; //重试次数
  retryInterval?: number;

  // ready
  ready?: boolean; //全局控制请求是否执行的布尔值开关

  // [key: string]: any;
}

export type Plugin<TData, TParams extends any[]> = { //#插件类型
  (fetchInstance: Fetch<TData, TParams>, options: Options<TData, TParams>): PluginReturn< //函数类型，参数是fetchInstance(fetch类实例)和options(调用useRequest时传的配置)，返回值类型是PluginReturn（见上文，就是各个钩子）
    TData,
    TParams
  >;
  onInit?: (options: Options<TData, TParams>) => Partial<FetchState<TData, TParams>>;//也可作为对象，有OnInit属性，值是个函数，函数返回值类型是FetchState<TData, TParams>经过Partial转换为所有键都可选之后合并进Fetch的初始状态
};

// for index
// export type OptionsWithoutFormat<TData, TParams extends any[]> = Omit<Options<TData, TParams>, 'formatResult'>;

// export interface OptionsWithFormat<TData, TParams extends any[], TFormated, TTFormated extends TFormated = any> extends Omit<Options<TTFormated, TParams>, 'formatResult'> {
//   formatResult: (res: TData) => TFormated;
// };

export interface Result<TData, TParams extends any[]> {
  loading: boolean;
  data?: TData;
  error?: Error;
  params: TParams | [];
  cancel: Fetch<TData, TParams>['cancel'];
  refresh: Fetch<TData, TParams>['refresh'];
  refreshAsync: Fetch<TData, TParams>['refreshAsync'];
  run: Fetch<TData, TParams>['run'];
  runAsync: Fetch<TData, TParams>['runAsync'];
  mutate: Fetch<TData, TParams>['mutate'];
}

export type Timeout = ReturnType<typeof setTimeout>;
