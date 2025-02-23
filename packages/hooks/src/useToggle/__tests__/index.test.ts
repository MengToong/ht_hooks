import { renderHook, act } from '@testing-library/react';//!renderHook模拟hook执行并获取它的状态和返回值。
import useToggle from '../index';

const callToggle = (hook: any) => {//执行useToggle的toggle方法取反
  act(() => {
    hook.result.current[1].toggle();
  });
};

describe('useToggle', () => {
  it('test on init', async () => {
    const hook = renderHook(() => useToggle());//!renderHook模拟hook执行并获取它的状态和返回值。
    // console.log('结构是:',JSON.stringify(hook.result));
    expect(hook.result.current[0]).toBeFalsy();//测试无参数时状态值是不是默认值false
  });

  it('test on methods', async () => {
    const hook = renderHook(() => useToggle('Hello'));
    expect(hook.result.current[0]).toBe('Hello');
    callToggle(hook);
    expect(hook.result.current[0]).toBeFalsy();
    act(() => {
      hook.result.current[1].setLeft();
    });
    expect(hook.result.current[0]).toBe('Hello');
    act(() => {
      hook.result.current[1].setRight();
    });
    expect(hook.result.current[0]).toBeFalsy();
  });

  it('test on optional', () => {
    const hook = renderHook(() => useToggle('Hello', 'World'));
    callToggle(hook);
    expect(hook.result.current[0]).toBe('World');
    act(() => {
      hook.result.current[1].set('World');
    });
    expect(hook.result.current[0]).toBe('World');
    callToggle(hook);
    expect(hook.result.current[0]).toBe('Hello');
  });
});
