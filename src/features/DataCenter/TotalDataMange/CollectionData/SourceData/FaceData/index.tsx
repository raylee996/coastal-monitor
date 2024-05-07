import { InputType, ShowType, UseType } from "hooks/flexibility/FormPanel"
import AreaPointDrawFrom from "component/AreaPointDrawFrom";
import { doUploadFile } from "server/common";
import { ageRangeDict, faceRaceDict, faceSearchDict, sexDict } from "helper/dictionary";
import TableInterface from "hooks/integrity/TableInterface"
import { getAllSisdomSearchList } from "server/core/wisdomSearch"
import FaceCard from './FaceCard'
import styles from './index.module.sass'
import popup from "hooks/basis/Popup";
import FaceSimlar from './FaceSimlar'
import dayjs from "dayjs";
import { PaginationProps } from "antd";
import { useMemo } from "react";
import { useLocation } from "react-router-dom";


const extraParams = { codeType: 0 }

const paginationProps: PaginationProps = {
  pageSize: 8,
  pageSizeOptions: [8, 16, 32, 50, 100],
  showTotal: (total: number) => {
    return `共 ${total} 条`
  }
}

const FaceData: React.FC = () => {
  console.debug('FaceData')


  const { state } = useLocation() as { state: any }


  const inputs = useMemo(() => [
    ['时间范围', 'datetime', InputType.dateTimeRange, {
      allowClear: true,
      style: { width: '330px' }
    }],
    ['点位', 'pointJsonList', InputType.component, {
      component: AreaPointDrawFrom,
      inputProps: {
        size: 'middle',
        style: { width: '150px' }
      },
      pointProps: {
        isPoint: true,
        params: {
          businessFunctions: ['3'],
          deviceTypes: ['1'],
          cameraTypes: [7]
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
      style: { width: '100px' },
      when: { searchType: 0 }
    }],
    ['年龄段', 'ageGroup', InputType.select, {
      dict: ageRangeDict,
      allowClear: true,
      style: { wdth: '100px' },
      when: { searchType: 1 }
    }],
    ['性别', 'sex', InputType.select, {
      dict: sexDict,
      allowClear: true,
      style: { wdth: '100px' },
      when: { searchType: 1 }
    }],
    ['戴眼镜', 'wearGlasses', InputType.select, {
      dict: faceSearchDict,
      allowClear: true,
      style: { wdth: '100px' },
      when: { searchType: 1 }
    }],
    ['戴口罩', 'wearMask', InputType.select, {
      dict: faceSearchDict,
      allowClear: true,
      style: { wdth: '100px' },
      when: { searchType: 1 }
    }],
    ['戴帽子', 'wearHat', InputType.select, {
      dict: faceSearchDict,
      allowClear: true,
      style: { wdth: '100px' },
      when: { searchType: 1 }
    }],
    ['种族', 'nationCode', InputType.select, {
      dict: faceRaceDict,
      allowClear: true,
      style: { wdth: '100px' },
      when: { searchType: 1 }
    }],
  ], [])

  const tools = useMemo(() => [
    ['人像对比', {
      onClick: () => {
        popup(<FaceSimlar />, { title: `人像对比`, size: 'mini' })
      }
    }]
  ], [])

  const queryInit = useMemo(() => {
    const result: any = {
      searchType: 0,
      datetime: [dayjs().subtract(1, 'day'), dayjs()]
    }
    if (state && state.deviceCode) {
      result.pointJsonList = [state.deviceCode]
    }
    return result
  }, [state])


  return (
    <article className={styles.wrapper}>
      <TableInterface
        card={FaceCard}
        extraParams={extraParams}
        queryInit={queryInit}
        queryInputs={inputs}
        toolsRight={tools}
        request={getAllSisdomSearchList}
        paginationProps={paginationProps}
      />
    </article>
  )
}

export default FaceData