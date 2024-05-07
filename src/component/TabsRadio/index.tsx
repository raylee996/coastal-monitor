import { Tabs } from "antd";
import _ from "lodash";
import { useEffect, useState } from "react";
import styles from "./index.module.sass";
import './index.sass';
import SvgPic from 'component/SvgaPic'


interface Props {
  /** tabs显示内容 */
  options: {
    value: any,
    name: string,
    /** 图标相关属性 */
    icon: string,
    size?: number,
    height?: number
  }[]
  /** 默认选中值 无默认值则取options[0].value */
  defaultActive?: string
  /** 受控属性 */
  value?: string
  /** 回调方法 传递值 */
  onChange?: Function
  /** tab内容之间间距 默认64 */
  tabBarGutter?: number
}

const TabsRadio: React.FC<Props> = ({ options, defaultActive, value, onChange, tabBarGutter }) => {
  console.debug('TabsRadio')

  const [active, setActive] = useState<string>(defaultActive || (options?.length ? options[0].value : ''))
  const picSvg = require('images/wisdomSearch/actives.svga')

  useEffect(() => {
    if (value) {
      setActive(value)
    }
  }, [value])

  function handleChange(activeKey: string) {
    onChange && onChange(activeKey)
    _.isUndefined(value) && setActive(activeKey);
  }

  return (
    <article className="Common__RadioGroupTabs">
      <Tabs
        activeKey={active}
        defaultActiveKey={defaultActive}
        onChange={handleChange}
        tabBarGutter={tabBarGutter || 64}
        items={options.map((item, i) => {
          const id = item.value;
          return {
            label: (
              <div className={styles.wrapper}>
                <div className={`${active === id ? '' : ''} ${styles.tabsBox}`}>
                  {active === id&&<div className={styles.topsSvg}>
                    <SvgPic pic={picSvg} svagid='serchselect' option={{height: '90px',width: '90px'}}/>
                  </div>}
                  <span className={`${styles.icon} iconfont icon-${item.icon}`} style={item.size ? { fontSize: item.size + "px", lineHeight: item.height + "px" } : {}}></span>
                </div>
                &nbsp;&nbsp;&nbsp;
                <div className={styles.label}>{item.name}</div>
              </div>
            ),
            key: id,
          };
        })}
      />
    </article>
  )
}

export default TabsRadio