import { useEffect, useState } from "react";

// 防抖hooks
export const useDebounce = <V>(value: V, delay?: number) => {
  // 每次在value变化之后，设置一个定时器
  const [debouncedValue, setDebounceValue] = useState(value);
  // 每次在上一次useEffect处理完以后再运行
  useEffect(() => {
    const timeout = setTimeout(() => setDebounceValue(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
};
