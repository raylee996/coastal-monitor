import React, { useState } from "react";
import { Tabs } from "antd";
import CaseMan from "./CaseMan";
import CaseRelationShip from "./CaseRelationShip";

interface Props {
  /**选中的案件 */
  caseItem?: any
}

//涉案人员
const CaseRelationMan: React.FC<Props> = ({ caseItem }) => {
  const [activeKeys, setActiveKeys] = useState('item-1')
  const items = [
    { label: '涉案人员', key: 'item-1', children: <CaseMan caseItem={caseItem} /> }, // 务必填写 key
    { label: '关系图谱', key: 'item-2', children: <CaseRelationShip caseItem={caseItem} active={activeKeys} /> },
  ];
  function handleChange(activeKey: string) {
    setActiveKeys(activeKey)
  }

  return <Tabs onChange={handleChange} items={items} type="card" className={'dc-tabs-card'} />;
}

export default CaseRelationMan
