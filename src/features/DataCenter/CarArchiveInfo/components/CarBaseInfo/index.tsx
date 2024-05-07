
import DataDescriptions from "features/DataCenter/components/DataDescriptions";
import { IBaseInfo } from "features/DataCenter/PersonnelArchiveInfo/component/PersonBaseData/component/BaseData";
import TableInterface from "hooks/integrity/TableInterface";
import { useCallback, useEffect, useMemo, useState } from "react";
import { doGetCarCaseList, getCarArchiveData } from "server/car";
import styles from "./index.module.sass";
import "../../../dataCenter.sass"
import CaseArchiveInfo from "features/DataCenter/CaseArchiveInfo";
import popup from "hooks/basis/Popup";
import { Button } from "antd";
import CarArchiveDetail from "features/DataCenter/CarArchiveDetail";
import { UseType } from "hooks/flexibility/FormPanel";


// 涉案信息
const caseColumns = [
  ['案件编号', 'caseNo'],
  ['案件名称', 'caseName'],
  ['发案时间', 'happenTimeStart'],
  ['涉案地详址', 'happenAddress'],
  ['接警单位', 'registerUnit'],
  ['案件描述', 'caseDescr'],
  [
    ['查看档案', (record: any) => {
      // 跳转查看档案详情页
      popup(<CaseArchiveInfo caseItem={{ id: record.id }} />, { title: '案件详情', size: "fullscreen" })
      //navigate(`/shipInfo/ShipBaseInformation?id=${record.id}`, { state: { id: record.id } })
    }]
  ]
]

interface Props {
  carId: any
  carItem?: any
  // 编辑完后，用于更新左侧菜单上面车辆的信息
  setArchiveData?: (data: any) => void
}

const CarBaseInfo: React.FC<Props> = ({ carId, setArchiveData }) => {
  console.debug('CarBaseInfo')


  const [baseInfo, setBaseInfo] = useState<IBaseInfo[]>([{ label: '', value: "" }])
  const [carInfo, setCarInfo] = useState<any>({})


  useEffect(() => {
    async function handleGetCarInfo() {
      const vo = await getCarArchiveData(carId)
      setCarInfo(vo)
      setBaseInfo([
        {
          label: '车牌号',
          value: vo.licensePlate
        },
        {
          label: '车型',
          value: vo.carTypeName
        },
        {
          label: '车身颜色',
          value: vo.carColorName
        },
        {
          label: '车牌颜色',
          value: vo.plateColorName
        },
        {
          label: '车品牌',
          value: vo.carMakeName
        },
        {
          label: '子品牌',
          value: vo.subCarMake
        },
        {
          label: '年款',
          value: vo.carYear
        },
        {
          label: '标签',
          value: vo.labelNames
        },
        {
          label: '车辆分类',
          value: vo.typeName
        }
      ])
    }
    handleGetCarInfo()
  }, [carId])


  const handleFinish = useCallback(
    async () => {
      const vo = await getCarArchiveData(carId)
      setCarInfo(vo)
      setArchiveData && setArchiveData(vo)
      setBaseInfo([
        {
          label: '车牌号',
          value: vo.licensePlate
        },
        {
          label: '车型',
          value: vo.carTypeName
        },
        {
          label: '车身颜色',
          value: vo.carColorName
        },
        {
          label: '车牌颜色',
          value: vo.plateColorName
        },
        {
          label: '车品牌',
          value: vo.carMakeName
        },
        {
          label: '子品牌',
          value: vo.subCarMake
        },
        {
          label: '年款',
          value: vo.carYear
        },
        {
          label: '标签',
          value: vo.labelNames
        },
        {
          label: '车辆分类',
          value: vo.typeName
        }
      ])
    },
    [carId, setArchiveData],
  )

  const handleEdit = useCallback(
    (e: any) => {
      e.stopPropagation();
      popup(<CarArchiveDetail id={carInfo.id} type={UseType.edit} onFinish={handleFinish} />, { title: '编辑车辆档案', size: "middle" })
    },
    [carInfo.id, handleFinish],
  )


  const extraParams = useMemo(() => ({ licensePlate: carInfo.licensePlate }), [carInfo])


  return (
    <article className={styles.wrapper}>
      <Button onClick={handleEdit}>编辑</Button>

      <div className={styles.panel}>
        <DataDescriptions bordered data={baseInfo} customClass='dc-data-desc' />
      </div>

      <div className={styles.panel}>
        <div className={styles.title}>涉案信息</div>
        <TableInterface
          columns={caseColumns}
          extraParams={extraParams}
          request={doGetCarCaseList}
        />
      </div>
    </article>
  )
}

export default CarBaseInfo