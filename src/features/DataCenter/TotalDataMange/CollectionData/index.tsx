import { Tabs } from 'antd';
import styles from "./index.module.sass";
import CollectTotal from './CollectTotal';
import SourceData from './SourceData';
import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';


const CollectionData: React.FC = () => {
  console.debug('CollectionData')

  const { state } = useLocation() as { state: any }

  const [activeKey] = useState(() => {
    if (state && state.activeKey) {
      return state.activeKey
    } else {
      return 'item-0'
    }
  })

  const items = useMemo(() => [
    {
      label: '采集数据统计',
      key: 'item-0',
      children: <CollectTotal />
    },
    {
      label: '感知源',
      key: 'item-1',
      children: <SourceData />
    }
  ], [])

  return (
    <article className={styles.wrapper}>
      <Tabs
        // className='core__tabs-content-height'
        type='card'
        className={'dc-tabs-card'}
        items={items}
        defaultActiveKey={activeKey}
      >
      </Tabs>
    </article>
  )
}

export default CollectionData