import React, { useEffect, useState } from "react";
import TableInterface from "hooks/integrity/TableInterface";
import RadarCardItem from "../components/RadarCardItem";
import { Button, Col, Form, Input, Row } from "antd";
import { getRealShipListAsync } from "../../../../../server/ship";
import styles from './index.module.sass'
import _ from "lodash";
import ViewHistoryTrack from "../components/ViewHistoryTrack";
import windowUI from "../../../../../component/WindowUI";

//雷达目标
const RadarTarget: React.FC = () => {
  const [form] = Form.useForm();
  const [tableSource, setTableSource] = useState([]);
  const [disableSearchBtn, setdisableSearchBtn] = useState(false)

  //传递给历史轨迹组件的船舶信息
  const [shipList, setShipList] = useState<any>([]);

  const [isLoading, setIsLoading] = useState(true)

  //打开船舶历史轨迹
  useEffect(() => {
    if (shipList.length > 0) {
      windowUI(<ViewHistoryTrack list={shipList} setList={setShipList} targetType='radar' />, {
        title: '雷达目标历史轨迹',
        key: '历史轨迹',
        width: '800px',
        height: '300px',
        offset: [600, 580],
      })
    }
  }, [shipList]);

  //获取所有数据列表
  useEffect(() => {
    async function main() {
      let data: any = await getRealShipListAsync({ pageNumber: 1, pageSize: 10 }, { dataType: 2 })
      setTableSource(data.data)
      setIsLoading(false)
    }
    main()
  }, []);

  //搜索
  function handleSearch() {
    async function main() {
      let data: any = await getRealShipListAsync(
        { pageNumber: 1, pageSize: 10 },
        { dataType: 2, ...form.getFieldsValue() })
      setTableSource(data.data)
      setdisableSearchBtn(false)
    }
    setdisableSearchBtn(true)
    main()
  }
  //重置
  function handleReset(){
    form.resetFields()
    async function main() {
      let data: any = await getRealShipListAsync(
        { pageNumber: 1, pageSize: 10 },
        { dataType: 2, ...form.getFieldsValue() })
        
      setTableSource(data.data)
    }
    main()
  }
  function handleSelected() {

  }
  function handleCardActions(type: string, data: any) {
    setShipList((val: any) => {
      return _.uniqBy([...val, data], 'batchNum')
    })
  }
  return (
    <article className={styles.wrapper}>
      <header>
        <Form
          form={form}
          style={{ overflow: "hidden" }}
        >
          <Row gutter={2} style={{ height: '42px' }}>
            <Col span={24}>
              <Form.Item name='searchValue' style={{ marginBottom: '8px' }}>
                <Input placeholder='请输入雷达批号' />
              </Form.Item>
            </Col>
          </Row>
          <Row style={{height:'40px'}}>
            <Col span={15}>
              <Form.Item style={{ marginBottom: '8px', width: '260px' }}>
                <span className={styles.itemSpan}>航速</span>
                <Form.Item name='speedMin' className={styles.minInput}>
                  <Input placeholder='最小航速' size={"small"}/>
                </Form.Item>
                <span className={styles.split}>-</span>
                <Form.Item name='speedMax' className={styles.minInput}>
                  <Input placeholder='最大航速' size={"small"} />
                </Form.Item>
                <span className={styles.itemSpan}>节</span>
              </Form.Item>
            </Col>
            <Col span={9}>
              <Button onClick={handleSearch} className={styles.button} type={"primary"} disabled={disableSearchBtn}>搜索</Button>
              <Button onClick={handleReset} type={"default"}>重置</Button>
            </Col>
          </Row>
        </Form>
      </header>
      <section>
        <TableInterface
          card={RadarCardItem}
          tableDataSource={tableSource}
          cardOptions={{ onSelected: handleSelected, isRadio: true, isSelectedFirst: true, onCardActions: handleCardActions }}
          cardProps={{ isLoading }}
          queryOptions={{
            isShowReset: true
          }}
          paginationProps={{
            showQuickJumper: false,
            size: 'small'
          }}
        />
      </section>
    </article>
  )
}
export default RadarTarget
