import { Button, Input, message, Popconfirm } from "antd"
import CoastalMonitorWebgis from "helper/map";
import { getCRSByMapType, MapType } from "helper/map/crsUtil";
import getMapOffLineDate from "helper/map/getMap";
import { TableCardProps } from "hooks/flexibility/CardPanel";
import TableInterface from "hooks/integrity/TableInterface";
import _ from "lodash";
import { useEffect, useRef, useState } from "react";
import { addAreaServe, deleteAreaServe, editAreaServe, getAllAreaList } from "server/core/controlManage";
import styles from "./index.module.sass";
import './index.sass';

interface Props {
  /** 保存绘制的图形数据 */
  setPolygon: Function
  /** 用户选中的区域id */
  activeId?: number
  /** 回传更新的数据data */
  onChangeData: Function
}

const queryInputs: any[] = [
  ['区域名称', 'areaName', {
    placeholder: '请输入区域名称搜索',
    itemProps: {},
    allowClear: true
  }],
]

// 图形类型 1 线 2 圆形 3 矩形 4 多边形
// const DrawType: { [key: string]: string } = {
//   'LineString': '1',
//   'Circle': '2',
//   'Polygon': '3',
//   'Rectangle': '4',
// }

const DrawRectangleCardItem: React.FC<TableCardProps<any>> = (props) => {
  console.debug('DrawRectangleCardItem')

  const { data, onSelect, activeData, onRefresh, onAction } = props
  // graph,
  const { id, name, typeName } = data

  const [showEditArea, setShowEditArea] = useState<boolean>(false);
  console.log(showEditArea, 'showEditArea')

  function onclick() {
    onSelect && onSelect(true, data)
  }

  function edit(record: any) {
    console.log(record, record.graph, 'edit record')
    setShowEditArea(true)
    onAction('edit', data)
  }

  function del(record: any) {
    console.log(record, 'del record')
    deleteAreaServe(record.id).then(res => {
      message.success('删除成功')
      onRefresh()
    })
  }

  return (
    <div className={`wrapperItem ${_.some(activeData, data) ? 'active' : 'unActive'}`} data-value={id} onClick={onclick}>
      <div className={'modelTitle'}>
        <div className='modelTitleLeft'>
          <div>{name}</div>
          <div className='content'>{typeName}</div>
          {/* <div>{graph}</div> */}
        </div>
        <div>
          <span className={styles.editBtn} onClick={() => edit(data)}>编辑</span>
          <Popconfirm title="确定要删除吗?" onConfirm={() => del(data)}>
            <span className={styles.delBtn}>删除</span>
          </Popconfirm>
        </div>
      </div>

    </div>
  )
}

type AreaForm = { id?: number, type?: string, graph?: string }

const DrawRectangle: React.FC<Props> = ({ setPolygon, activeId, onChangeData }) => {
  console.debug('DrawRectangle')

  const mapRef = useRef<HTMLElement>(null)
  const tableRef = useRef<any>(null)

  const [mapLeaflet, setMapLeaflet] = useState<CoastalMonitorWebgis>();

  const [showDraw, setShowDraw] = useState<boolean>(false);

  const [areaName, setAreaName] = useState<string>('');

  const [areaFrom, setAreaFrom] = useState<AreaForm>({});

  const [rectangleLayer, setRectangleLayer] = useState<any>(null);

  const [allLayer, setAllLayer] = useState<any[]>([]);

  const tools: any = [
    ['新增', {
      onClick: () => {
        add()
      },
      type: "primary"
    }],
  ]

  // 创建地图实例
  useEffect(() => {
    if (!mapRef.current) return;
    const crs = getCRSByMapType(MapType.StreetMap);
    const _mapLeaflet: CoastalMonitorWebgis = new CoastalMonitorWebgis(mapRef.current, { crs, zoom: 12 })
    getMapOffLineDate(MapType.StreetMap).addTo(_mapLeaflet.map);
    setMapLeaflet(_mapLeaflet)
    return () => {
      _mapLeaflet?.map?.remove()
    }
  }, [])

  useEffect(() => {
    if (!mapLeaflet) return;

    if (showDraw) {

      mapLeaflet.createGraphicDrawing()

      const coords = [
        [113.791183, 22.598631],
        [114.293987, 22.555499],
        [114.140123, 21.952799],
        [113.560387, 22.092897],
        [113.640067, 22.504739],
        [113.791183, 22.598631]
      ]
      const polygonLayer = L.polygon(coords, { color: 'red' });
      // mapLeaflet.map.pm.Draw._setPane(polygonLayer, 'layerPane');
      // mapLeaflet.map.pm.Draw._finishLayer(polygonLayer);
      polygonLayer.addTo(mapLeaflet.map);

      console.log(mapLeaflet.map, mapLeaflet.map.pm, "mapLeaflet.map.pm")
      // 监听创建图形
      mapLeaflet.map.on("pm:create", (e: { layer: { toGeoJSON: () => any } }) => {
        console.log(mapLeaflet.map, mapLeaflet.map.pm.Draw.getActiveShape(), "mapLeaflet.map")
        // 记录当前绘制的图形
        let rectangleGeoJson = e.layer.toGeoJSON();
        setRectangleLayer(e.layer)
        setAllLayer([...allLayer, ...[e]])
        console.log(rectangleGeoJson);
        if (rectangleGeoJson?.geometry?.type === "Polygon" && rectangleGeoJson.geometry.coordinates?.length === 1) {
          const geometry = rectangleGeoJson.geometry.coordinates[0]
          setPolygon(geometry)
          setAreaFrom({
            ...{ graph: geometry, type: '4' },
            ...areaFrom
          })
        }
      });
    }

    return () => {
      // _rectangleLayer && mapLeaflet.map.removeLayer(rectangleLayer);
      // mapLeaflet && mapLeaflet.map.pm.remove()
    }
  }, [allLayer, areaFrom, mapLeaflet, rectangleLayer, setPolygon, showDraw])

  useEffect(() => {
    console.log(activeId, 'DrawRectangle activeId')
  }, [activeId])

  // 刷新列表
  function refreshTable() {
    tableRef.current.onRefresh()
  }


  function add() {
    console.log('add')
    setShowDraw(true)
  }

  //模型列表点击切换
  function handleClick(e: any) {
    // console.log(e, "e")
    onChangeData && onChangeData(e[0])
  }

  async function handleAreaFinish() {
    console.debug('handle Finish')
    const { graph, ...obj } = areaFrom
    if (!areaFrom.id) {
      console.log(areaFrom, { ...{ name: areaName }, ...{ graph: JSON.stringify(graph) }, ...obj }, '新增 areaFrom')
      //新增
      const vo = await addAreaServe({ ...{ name: areaName }, ...{ graph: JSON.stringify(graph) }, ...obj })
      if (vo.code === 200) {
        // common.showMessage({ msg: '新增成功' })
        refreshTable()
      }
    } else {
      console.log(areaFrom, { ...{ name: areaName }, ...{ graph: JSON.stringify(graph) }, ...areaFrom }, '编辑 areaFrom')
      // 编辑
      const vo = await editAreaServe({ ...{ name: areaName }, ...{ graph: JSON.stringify(graph) }, ...areaFrom })
      if (vo.code === 200) {
        // common.showMessage({ msg: '更新成功' })
        refreshTable()
      }
    }
  }

  function handleAreaCancle() {
    setShowDraw(false)
    mapLeaflet && allLayer.map(item => {
      mapLeaflet.map.removeLayer(item.layer)
      return item
    })
    setAreaName('')
    mapLeaflet && mapLeaflet.map.pm.removeControls()
  }

  function onChange(e: any) {
    setAreaName(e.target.value)
  }

  function onCardActions(type: string, data: any) {
    if (type === 'edit') {
      setShowDraw(true)
      const { id, name, type, graph } = data
      setAreaFrom({ id, type, graph })
      setAreaName(name)
    }
  }

  return (
    <section className={styles.wrapper}>
      <div className={`${styles.areaBox}`}>
        <section className={styles.areaTableBox}>
          <TableInterface
            ref={tableRef}
            card={DrawRectangleCardItem}
            cardOptions={{ onSelected: handleClick, isRadio: true, isSelectedFirst: false, selectedId: activeId, onCardActions }}
            request={getAllAreaList}
            queryInputs={queryInputs}
            tools={tools}
            isNotPagination={true}
          />
        </section>
      </div>
      <section className={styles.drawMapBox}>
        <section className={styles.drawMap} ref={mapRef}></section>
        {
          showDraw && <div className={styles.addBox}>
            <Input placeholder="请输入区域名称" value={areaName} onChange={onChange}></Input>
            <Button className={styles.primaryBtn} type={'primary'} onClick={handleAreaFinish}>确定</Button>
            <Button onClick={handleAreaCancle}>取消</Button>
          </div>
        }
      </section>
    </section>
  )
}

export default DrawRectangle