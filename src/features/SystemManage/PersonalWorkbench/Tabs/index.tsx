import { Row,Col,Tabs } from "antd";

import WorkbenchTable from "../WorkbenchTable";
import styles from "./index.module.sass";
import MyNote from "../MyNote";
import PersonMessage from "../PersonMessage";

const PersonalWorkbench: React.FC = () => {
  console.debug('PersonalWorkbench')
  const items = [
    {
      label: <span><span className={"iconfont icon-daiban"} style={{verticalAlign:'middle'}}></span>&nbsp;待办审批</span>,
      key: 'item-0',
      children: <div className={styles.tabContent}>
        <WorkbenchTable/>
      </div>
    },
    {
      label: <span><span className={"iconfont icon-bianqian1"} style={{verticalAlign:'middle'}}></span>&nbsp;我的便签</span>,
      key: 'item-1',
      children: <div className={styles.tabContent}>
        <MyNote/>
      </div>
    }
  ];

  return (
    <article className={styles.wrapper}>
      <Row gutter={20}>
        <Col span={4} style={{marginTop: '20px'}}>
          <PersonMessage/>
        </Col>
        <Col span={20} className={styles.rights}>
          <Tabs items={items}>
          </Tabs>
        </Col>
      </Row>
    </article>
  )
}

export default PersonalWorkbench