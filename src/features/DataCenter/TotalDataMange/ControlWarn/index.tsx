import { Tabs } from 'antd';
import React from 'react';
import WarnTotal from './WarnTotal';
import WarnList from './WarnList';
import styles from "./index.module.sass";
import WarnDatas from './WarnDatas'


const ControlWarn: React.FC = () => {
  console.debug('ControlWarn')

  const items = [
    {
      label: '布控预警统计',
      key: 'item-0',
      children: <div className={styles.tabContent}>
        <WarnTotal />
      </div>
    },
    {
      label: '预警信息记录',
      key: 'item-1',
      children: <div className={styles.tabContent}>
        <WarnDatas />
      </div>
    },
    {
      label: '行为分析',
      key: 'item-2',
      children: <div className={styles.tabContent}>
        <WarnList />
      </div>
    }
  ];

  return (
    <article className={`${styles.wapper} ` }>
      <Tabs  items={items} type="card" className={'dc-tabs-card'}>
      </Tabs>
    </article>
  )
}

export default ControlWarn