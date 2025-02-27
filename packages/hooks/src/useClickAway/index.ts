import useLatest from '../useLatest';
import type { BasicTarget } from '../utils/domTarget';
import { getTargetElement } from '../utils/domTarget';
import getDocumentOrShadow from '../utils/getDocumentOrShadow';
import useEffectWithTarget from '../utils/useEffectWithTarget';

type DocumentEventKey = keyof DocumentEventMap;

export default function useClickAway<T extends Event = Event>(
  onClickAway: (event: T) => void,//一个回调函数，点击目标外部时会调用这个函数。
  target: BasicTarget | BasicTarget[],//指定目标元素，可以是一个或多个元素。当用户点击这些元素时，不会触发 onClickAway 回调。
  eventName: DocumentEventKey | DocumentEventKey[] = 'click',// 指定监听的事件类型，默认是 'click'。可以传入多个事件名数组，例如 ['click', 'mousedown']，当这些事件发生时会判断是否点击到了目标元素外部。
) {
  const onClickAwayRef = useLatest(onClickAway);

  useEffectWithTarget(
    () => {
      const handler = (event: any) => {
        const targets = Array.isArray(target) ? target : [target];//将目标元素转换为数组
        if (
          targets.some((item) => {//数组的 some 方法，测试数组中的元素是否至少有一个满足指定的条件。
            const targetElement = getTargetElement(item);// 获取目标元素转换为实际DOM（设定的点击不触发的元素）
            // @ts-ignore
            return !targetElement || targetElement.contains(event.target);//#如果没设置目标元素或者点击事件发生在目标元素内部，则不应该触发 onClickAway 回调，返回 true
          })
        ) {
          return;
        }
        onClickAwayRef.current(event);//#否则点击事件发生在目标元素外部，则执行回调函数
      };

      const documentOrShadow = getDocumentOrShadow(target);

      const eventNames = Array.isArray(eventName) ? eventName : [eventName];

      eventNames.forEach((event) => documentOrShadow.addEventListener(event, handler));

      return () => {
        eventNames.forEach((event) => documentOrShadow.removeEventListener(event, handler));
      };
    },
    Array.isArray(eventName) ? eventName : [eventName],
    target,
  );
}
