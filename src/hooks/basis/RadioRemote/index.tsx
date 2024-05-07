import React, { useEffect, useState } from "react";
import styles from "./index.module.sass";
import { Radio, RadioProps } from "antd";
import { Type } from "hooks/hooks";

interface Props extends RadioProps {
  /** 远程请求 */
  remote: (params?: any) => Promise<Type<any>[]>
}

const RadioRemote: React.FC<Props> = ({ remote, ...otherProps }) => {
  console.debug('RadioRemote')

  const [options, setOptions] = useState<any[]>([]);

  useEffect(() => {
    async function main() {
      const result: any[] = []
      const vo: { [key: string]: any } = await remote()
      vo.forEach((ele: { name: any; }) => result.push({ ...ele, label: ele.name }))
      setOptions(result)
    }
    main();
    return () => {
      setOptions([])
    };
  }, [remote]);

  return (
    <article className={styles.wrapper}>
      <Radio.Group options={options} {...otherProps} />
    </article>
  )
}

export default RadioRemote
