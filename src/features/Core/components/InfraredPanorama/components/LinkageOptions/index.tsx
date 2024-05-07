import { Button, Col, Empty, InputNumber, message, Popconfirm, Row, Select } from "antd"
import popup from "hooks/basis/Popup";
import { useCallback, useEffect, useState } from "react"
import { addEditDevicePanorama, delDevicePanorama, queryAreaListByPanoramaId, queryDevice } from "server/core/infraredPanorama";
import { useDebounce } from "useHook/useDebounce";
import styles from "./index.module.sass";
import './index.sass';
import LinkageOptionsDetail from "./LinkageOptionsDetail";
interface Props {
  /** 红扫设备id */
  panoramaId: number
}

type UpdateData = { key: string; value: number | null }

const LinkageOptions: React.FC<Props> = ({ panoramaId }) => {
  console.log('LinkageOptions')

  const [tableData, setTableData] = useState<any[]>([])

  const [deviceOptions, setDeviceOptions] = useState<any[]>([])

  const [newPTZ, setNewPTZ] = useState<UpdateData>()

  const [editData, setEditData] = useState<any>()

  const debounceParam = useDebounce(newPTZ, 1000);

  // 编辑更新单条数据
  const handleEditData = useCallback(
    async (targetObj: any, updateData: UpdateData) => {
      const params = { ...targetObj }
      params[updateData.key] = updateData.value
      await addEditDevicePanorama(params)
      handlePanoramaData(panoramaId)
      // 重置编辑对象
      setEditData(undefined)
      setNewPTZ(undefined)
    },
    [panoramaId],
  )

  useEffect(() => {
    panoramaId && handlePanoramaData(panoramaId);
    handleDeviceData()
  }, [panoramaId])

  useEffect(() => {
    // 输入框修改PTZ时调编辑接口更新
    debounceParam && editData && handleEditData(editData, debounceParam)
  }, [debounceParam, editData, handleEditData])

  // 获取所有可联动摄像头
  async function handleDeviceData() {
    const res = await queryDevice({ deviceTypes: ['1'], isLinkage: 1 })
    setDeviceOptions((res || []).map((item: any) => {
      const { name, id } = item
      return {
        value: id,
        label: name
      }
    }))
  }

  // 获取列表数据
  async function handlePanoramaData(id: number) {
    const res = await queryAreaListByPanoramaId({ panoramaId: id })
    setTableData(res || [])
  }

  // 新增弹窗
  function handleAdd() {
    popup(<LinkageOptionsDetail panoramaId={panoramaId} refresh={handlePanoramaData} />, { title: '新增联动配置', size: 'small' })
  }

  // 预览
  function handlePreview(item: any) {

  }

  // 获取PTZ
  function handlePTZ(item: any) {

  }

  // 删除单列
  async function handleDel(item: any) {
    if (!item?.id) {
      message.error('操作失败')
      return;
    }
    await delDevicePanorama(item.id)
    handlePanoramaData(panoramaId)
  }

  // 列表中更新PTZ
  function onChangePTZ(value: number | null, index: number, key: string) {
    setNewPTZ(() => {
      return { key, value }
    })
    setEditData(tableData[index])
  }

  // 隔行变色
  function checkRow(index: number) {
    return index % 2 ? 'table-even' : 'table-odd'
  }

  function onChangeDevice(value: any, index: number) {
    setEditData(tableData[index])
    handleEditData(tableData[index], { key: 'linkageId', value })
  }

  return (
    <article className={styles.wrapper}>
      <div className={styles.btnBox}>
        <Button type="primary" onClick={handleAdd}>新增</Button>
      </div>
      <Row className={`${styles.labelRow} Linkage__Options__Table`}>
        <Col span={4}>区域名称</Col>
        <Col span={6}>联动摄像头</Col>
        <Col span={3}>P</Col>
        <Col span={3}>T</Col>
        <Col span={3}>Z</Col>
        <Col span={5}>操作</Col>
      </Row>
      <div className={styles.contentBox}>
        {
          tableData?.length ? tableData.map((item, index) => {
            return <Row className={`${checkRow(index + 1)} ${styles.content_common}`}>
              <Col className={styles.text} span={4}>{item.areaName}</Col>
              <Col className={styles.text} span={6}>
                <Select style={{ width: '80%' }} placeholder={'请选择联动摄像头'} defaultValue={item.linkageId} options={deviceOptions} onChange={(value) => onChangeDevice(value, index)} />
              </Col>
              <Col className={styles.text} span={3}>
                <InputNumber defaultValue={item.pan} placeholder={'请输入'} onChange={(value) => onChangePTZ(value, index, 'pan')} />
              </Col>
              <Col className={styles.text} span={3}>
                <InputNumber defaultValue={item.tilt} placeholder={'请输入'} onChange={(value) => onChangePTZ(value, index, 'tilt')} />
              </Col>
              <Col className={styles.text} span={3}>
                <InputNumber defaultValue={item.zoom} placeholder={'请输入'} onChange={(value) => onChangePTZ(value, index, 'zoom')} />
              </Col>
              <Col className={styles.text} span={5}>
                <Button type="link" size="small" onClick={() => handlePreview(item)}>预览</Button>
                <Button type="link" size="small" onClick={() => handlePTZ(item)}>获取PTZ</Button>
                <Popconfirm title="确定要删除吗?" onConfirm={() => handleDel(item)}>
                  <Button type="link" size="small">删除</Button>
                </Popconfirm>
              </Col>
            </Row>
          }) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        }
      </div>

    </article>
  )
}

export default LinkageOptions