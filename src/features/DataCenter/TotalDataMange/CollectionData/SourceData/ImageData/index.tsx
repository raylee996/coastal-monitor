
import styles from './index.module.sass'
import { InputType } from "hooks/flexibility/FormPanel"
import AreaPointDrawFrom from "component/AreaPointDrawFrom";
import TableInterface from "hooks/integrity/TableInterface"
import { getAllSisdomSearchListImags } from "server/core/wisdomSearch"
import ImageDataCard from './components/ImageDataCard';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { message, Modal, PaginationProps } from 'antd';
import { batchDeleteImg } from 'api/core/wisdomSearch';
import dayjs from 'dayjs';
import { CardPanelProps } from 'hooks/flexibility/CardPanel';
import ImagePreviewGroup, { ImagePreviewGroupRefProps } from 'hooks/basis/ImagePreviewGroup';


const { confirm } = Modal;

const paginationProps: PaginationProps = {
  pageSize: 24,
  pageSizeOptions: [12, 24, 48, 96]
}

// const extraParams = {
//   codeType: 10
// }

const Inputs: any[] = [
  ['时间范围', 'datetime', InputType.dateTimeRange, {
    allowClear: true
  }],
  ['设备', 'pointJsonList', InputType.component, {
    component: AreaPointDrawFrom,
    inputProps: {
      size: 'middle'
    },
    pointProps: {
      isPoint: true,
      params: {
        deviceTypes: ['1'],
      }
    }
  }],
  ['目标', 'codeValue', {
    placeholder: '请输入MMSI/雷达/目标ID',
    allowClear: true
  }],
  /*  [
     '图片',
     'faceId',
     InputType.uploadImg,
     ShowType.image,
     {
       useType: UseType.edit,
       uploadImgFn: doUploadFile
     }
   ] */
]

const ImageData: React.FC = () => {
  console.debug('ImageData')


  const { state } = useLocation() as { state: any }


  const tableRef = useRef<any>();
  const imagePreviewGroupRef = useRef<ImagePreviewGroupRefProps>(null);


  const queryInit = useMemo(() => {
    if (state && state.device) {
      return {
        pointJsonList: [state.device.deviceCode],
        datetime: [dayjs().subtract(1, 'h'), dayjs()]
      }
    } else {
      return {
        datetime: [dayjs().subtract(1, 'h'), dayjs()]
      }
    }
  }, [state])


  const [selectedItem, setselectedItem] = useState<any[]>([])
  const [tableDataSource, setTableDataSource] = useState<any[]>()
  const [queryData, setQueryData] = useState<any>(queryInit)
  const [isLoading, setisLoading] = useState(false)


  // 选中和取消选中图片
  const handleClick = useCallback(
    (type: any, data: any) => {
      if (type === 'checked') {
        setselectedItem((val: any) => {
          return [...val, data]
        })
      } else if (type === 'unchecked') {
        let list = selectedItem?.filter((item: any) => {
          return item.path !== data.path
        })
        setselectedItem(list)
      } else if (type === 'preview') {
        let index = 0
        // 获取当前预览的图片位置。
        if (tableDataSource) {
          for (let i = 0; i < tableDataSource?.length; i++) {
            if (tableDataSource[i].id === data) {
              index = i
            }
          }
        }
        imagePreviewGroupRef.current?.open(index)
      }
    },
    [selectedItem, tableDataSource],
  )


  const cardOptions = useMemo(() => ({
    isFlex: true,
    onCardActions: handleClick
  }), [handleClick])


  const handleDeleteImg = useCallback(
    async () => {
      const idsStr = selectedItem.map(item => item.id).join(',')
      if (idsStr) {
        setisLoading(true)
        await batchDeleteImg(idsStr)
        setselectedItem([])
        // 性能优化：为了不重新拉去整个表格数据刷新，再原有基础的列表，剔除选中删除的照片
        setTableDataSource((list: any) => {
          let arr = JSON.parse(JSON.stringify(list))
          for (let i = 0; i < arr.length; i++) {
            for (let j = 0; j < selectedItem.length; j++) {
              if (arr[i].id === selectedItem[j].id) {
                arr.splice(i, 1)
              }
            }
          }
          return arr
        })
      }
    },
    [selectedItem],
  )

  const handleQuerySubmit = useCallback(
    (data: any) => {
      setQueryData(data)
    },
    [],
  )


  const tools = useMemo(() => [
    ['删除', {
      onClick: () => {
        if (selectedItem.length === 0) {
          message.warning('请选择需要删除的图片')
          return
        }
        confirm({
          content: <div style={{ color: "#00f0fe", fontSize: '16px' }}>是否确定要删除？</div>,
          okText: '确定',
          cancelText: '取消',
          onOk: handleDeleteImg
        });
      },
      type: "default"
    }]
  ], [handleDeleteImg, selectedItem])


  useEffect(() => {
    let ctr: AbortController
    async function main() {
      ctr = new AbortController()
      setisLoading(true)
      const vo = await getAllSisdomSearchListImags({
        pageNumber: 1,
        pageSize: -1,
      }, {
        ...queryData,
        codeType: 10
      })
      setTableDataSource(vo.data)
      setisLoading(false)
    }
    main()
    return () => {
      ctr?.abort()
    }
  }, [queryData])


  const cardProps = useMemo<CardPanelProps>(() => ({ isLoading }), [isLoading])


  return (
    <article className={styles.wrapper}>
      <TableInterface
        ref={tableRef}
        queryInit={queryInit}
        card={ImageDataCard}
        cardOptions={cardOptions}
        paginationProps={paginationProps}
        queryInputs={Inputs}
        tableDataSource={tableDataSource}
        toolsHeader={tools}
        onQuerySubmit={handleQuerySubmit}
        cardProps={cardProps}
      />
      <ImagePreviewGroup ref={imagePreviewGroupRef} data={tableDataSource} srcKeyName='path' />
    </article>
  )
}

export default ImageData