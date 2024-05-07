import { DownloadOutlined } from "@ant-design/icons";
import { Form, message } from "antd";
import AreaPointDrawFrom from "component/AreaPointDrawFrom";
import popupUI from "component/PopupUI";
import XcEmpty from "component/XcEmpty";
import dayjs from "dayjs";
import { ageRangeDict, faceRaceDict, faceSearchDict, sexDict } from "helper/dictionary";
import popup from "hooks/basis/Popup";
import { CardOptions } from "hooks/flexibility/CardPanel";
import { InputType, ShowType, UseType } from "hooks/flexibility/FormPanel"
import TableInterface, { TableInterfaceRefProps } from "hooks/integrity/TableInterface"
import _ from "lodash";
import { useCallback, useMemo, useRef, useState } from "react";
import { doUploadFile } from "server/common";
import { exportSearchTrack, getAllSisdomSearchList } from "server/core/wisdomSearch"
import { WisdomProps } from ".."
import PersonDetail from "../../Control/PersonDetail";
import WisdomJudgment from "../../WisdomJudgment";
import WisdomModel from "../../WisdomModel";
import DepositNotes from "../components/DepositNotes";
import RelationFaces from "../components/RelationFaces";
import SearchDetail from "../components/SearchDetails";
import TrajectoryAnalysis from "../components/TrajectoryAnalysis";
import FaceTableCardItem from "./components/FaceTableCardItem";
import styles from "./index.module.sass";


export const FaceInputs: any[] = [
  ['时间范围', 'datetime', InputType.dateTimeRange, {
    allowClear: false
  }],
  ['点位', 'pointJsonList', InputType.component, {
    component: AreaPointDrawFrom,
    inputProps: {
      size: 'middle',
      style: { width: '180px' }
    },
    pointProps: {
      isPoint: true,
      params: {
        businessFunctions: ['3'],
        deviceTypes: ['1']
      }
    },
  }],
  ['搜索类型', 'searchType', InputType.radio, {
    dict: [
      { name: '以脸搜脸', value: 0 },
      { name: '属性搜脸', value: 1 },
    ]
  }],
  [
    '人脸',
    'faceId',
    InputType.uploadImg,
    ShowType.image,
    {
      useType: UseType.edit,
      uploadImgFn: doUploadFile,
      when: { searchType: 0 }
    }
  ],
  ['最小相似度', 'similarity', InputType.input, {
    placeholder: '请输入相似度',
    suffix: "%",
    maxLength: 3,
    when: { searchType: 0 }
  }],
  ['年龄段', 'ageGroup', InputType.select, {
    dict: ageRangeDict,
    allowClear: true,
    placeholder: '全部',
    when: { searchType: 1 }
  }],
  ['性别', 'sex', InputType.select, {
    dict: sexDict,
    allowClear: true,
    placeholder: '全部',
    when: { searchType: 1 }
  }],
  ['戴眼镜', 'wearGlasses', InputType.select, {
    dict: faceSearchDict,
    allowClear: true,
    placeholder: '全部',
    when: { searchType: 1 }
  }],
  ['戴口罩', 'wearMask', InputType.select, {
    dict: faceSearchDict,
    allowClear: true,
    placeholder: '全部',
    when: { searchType: 1 }
  }],
  ['戴帽子', 'wearHat', InputType.select, {
    dict: faceSearchDict,
    allowClear: true,
    minWidth: 80,
    placeholder: '全部',
    when: { searchType: 1 }
  }],
  ['种族', 'nationCode', InputType.select, {
    dict: faceRaceDict,
    allowClear: true,
    placeholder: '全部',
    when: { searchType: 1 }
  }],
]

const extraParams = { codeType: 0 }
const paginationProps = { pageSize: 9 }

const FaceTable: React.FC<WisdomProps> = ({ params }) => {
  console.debug('FaceTable')


  const tableRef = useRef<TableInterfaceRefProps>(null)


  const [form] = Form.useForm();


  const [active, setActive] = useState<any>()
  const [multipleActive, setMultipleActive] = useState<any[]>()


  const queryInit = useMemo(() => ({
    searchType: 0,
    datetime: [dayjs().subtract(1, 'day'), dayjs()],
    ...params
  }), [params])


  const handleJudgmentModeling = useCallback(
    (isModeling?: boolean) => {
      if (!multipleActive?.length) {
        message.warning(`请选择数据`);
        return;
      }
      const clueInfo = multipleActive.map(item => {
        return {
          codeType: item.codeType,
          codeValue: item.content,
          imageUrl: item.path
        }
      })
      isModeling ? popup(<WisdomModel data={{ clueInfo }} />, { title: '智慧建模', size: 'fullscreen' }) : popup(<WisdomJudgment data={{ clueInfo, objType: 2, dataType: ['01'] }} />, { title: '智能研判', size: 'fullscreen' })
    },
    [multipleActive],
  )

  const handleRefresh = useCallback(
    () => {
      setMultipleActive([])
    },
    [],
  )


  const tools = useMemo(() => [
    ['人像对比', {
      onClick: () => {
        popup(<RelationFaces />, { title: `人像对比`, size: 'mini' })
      },
      type: "primary"
    }],
    ['布控', {
      onClick: () => {
        if (!multipleActive?.length) {
          message.warning(`请选择数据`);
          return;
        }
        const personCtrlJson = {
          personConditionDto: {
            controlScope: 1,
            faceDtoList: multipleActive.map(item => {
              return {
                id: Number(item.content),
                url: item.path
              }
            })
          }
        }
        popupUI(<PersonDetail params={{ personCtrlJson }} />, { title: '新增布控', size: "middle", })
      }
    }],
    ['智能研判', {
      onClick: () => {
        handleJudgmentModeling()
      }
    }],
    ['智慧建模', {
      onClick: () => {
        handleJudgmentModeling(true)
      }
    }],
    ['轨迹分析', {
      onClick: () => {
        if (multipleActive?.length) {
          const targetList = _.uniqBy(multipleActive.map(item => item.content).filter(v => v), item => item.content)
          const { datetime } = form.getFieldsValue()
          const params = datetime ? { datetime } : undefined
          popup(<TrajectoryAnalysis codeType={0} targetList={targetList} params={params} />, { title: '轨迹分析', size: 'fullscreen' })
        } else {
          message.warning(`请选择数据`)
        }
      }
    }],
    ['导出', {
      asyncClick: async () => {
        const total = tableRef.current?.getTotal()
        if (total && total > 100000) {
          message.warning(`限制最大导出10万条数据！`);
          return;
        }
        const queryParams = form.getFieldsValue()
        await exportSearchTrack({ codeType: 0, ...queryParams }, '智搜人脸列表')
      },
      icon: <DownloadOutlined />,
      type: "primary"
    }],
    ['存入我的便签', {
      onClick: () => {
        const queryParams = form.getFieldsValue()
        const total = tableRef.current?.getTotal()
        popup(<DepositNotes content={{ type: 'face', codeType: 0, radioValue: 4, ...queryParams }} total={total} />, { title: '存入我的便签', size: 'small' })
      },
      type: "primary"
    }]
  ], [form, handleJudgmentModeling, multipleActive])


  // const onRequest = useCallback(
  //   (result: any[]) => {
  //     setActive(result?.length ? result[0] : undefined)
  //   },
  //   [],
  // )


  const cardOptions = useMemo<CardOptions>(() => {

    const handleSelected = (list: any[]) => {
      setMultipleActive(list)
    }

    const handleRadio = (data: any) => {
      setActive(data)
    }

    return {
      isFlex: true,
      onSelected: handleSelected,
      onRadio: handleRadio,
      isRadioFirst: true
    }
  }, [])

  const rightComponent = useMemo(() => {
    const queryData = form.getFieldsValue()
    return {
      component: <div className={styles.detail}>
        {active ? <SearchDetail active={{ id: active?.content, ...(active || {}), image1: params?.faceId, }} params={queryData || params} /> : <XcEmpty />}
      </div>
    }
  }, [active, form, params])


  const handleFormReset = useCallback(
    () => {
      if (params?.datetime) {
        const { datetime } = params
        const [sTime, eTime] = datetime
        return {
          datetime: [dayjs(sTime), dayjs(eTime)]
        }
      } else {
        return {
          datetime: [dayjs().subtract(1, 'day'), dayjs()]
        }
      }
    },
    [params],
  )


  return (
    <article className={styles.wrapper}>
      <TableInterface
        ref={tableRef}
        card={FaceTableCardItem}
        cardOptions={cardOptions}
        queryInputs={FaceInputs}
        queryForm={form}
        queryInit={queryInit}
        // onTableData={onRequest}
        request={getAllSisdomSearchList}
        onRefresh={handleRefresh}
        onFormReset={handleFormReset}
        extraParams={extraParams}
        toolsRight={tools}
        rightComponent={rightComponent}
        paginationProps={paginationProps}
      />
    </article>
  )
}

export default FaceTable