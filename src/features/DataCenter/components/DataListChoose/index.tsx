
import { Button, ButtonProps } from "antd";
import { defaultImgPeople } from "helper/common";
import ImageSimple from "hooks/basis/ImageSimple";
import popup from "hooks/basis/Popup";
import _ from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { personColumns, personQueryInputs, shipColumns, shipQueryInputs } from "./component/DataConfig";
import DataListPanel from "./component/DataListPanel";
import styles from "./index.module.sass";


interface IDataListChoose {
  /**数据类型：ship,person,car,phone */
  dataType?: any
  /**api server */
  request?: any
  /**表格列配置 */
  columns?: any
  /**查询条件配置 */
  queryInputs?: any
  /**选择类型，单选:radio，多选:checkbox */
  rowSelectionType?: 'radio' | 'checkbox'
  /**选中后的返回数据源方法 */
  onFinish?: any
  /*默认选中项*/
  defaultSelectedKey?: any
  /**按钮文字 */
  btnTxt?: any
  /**弹窗-标题 */
  popTitle?: any
  /**弹窗-大小 */
  popSize?: any
  /** 是否使用antd按钮 */
  isUseButton?: boolean
  /** 当使用antd按钮时，按钮的原始参数 */
  buttonProps?: ButtonProps
  /**受控属性 */
  value?: {
    id: string
    facePath: string
    name: string
  }[]
  onChange?: any
}

const queryInit = { dataType: 1 }

const DataListChoose: React.FC<IDataListChoose> = (props) => {
  console.debug('DataListChoose')
  const { btnTxt, popTitle, popSize, request, dataType, isUseButton, buttonProps, onFinish, onChange, value } = props

  // 列配置
  const [columnsData, setColumnsData] = useState<any>([])
  // 表格查询条件配置
  const [queryInputsData, setQueryInputsData] = useState<any>([])


  const defaultSelectedKey = useMemo(() => {
    if (value) {
      if (_.isArray(value)) {
        return value.map(item => item.id)
      } else {
        return [value]
      }

    } else {
      return []
    }
  }, [value])


  useEffect(() => {
    switch (dataType) {
      case 'ship': // 船舶列表
        setColumnsData(shipColumns)
        setQueryInputsData(shipQueryInputs)
        break;
      case 'person': // 人员列表
        setColumnsData(personColumns)
        setQueryInputsData(personQueryInputs)
        break;
      default:
        break;
    }
  }, [dataType])


  const handleSelectedFinish = useCallback((data: any[]) => {
    onFinish && onFinish(data)
    onChange && onChange(data)
  }, [onFinish, onChange])

  const handleOpenDataList = useCallback(() => {
    popup(<DataListPanel
      request={request}
      columns={columnsData}
      queryInputs={queryInputsData}
      queryInit={dataType === 'ship' ? queryInit : null}
      onFinish={handleSelectedFinish}
      defaultSelectedKey={defaultSelectedKey}
      {...props} />, {
      title: popTitle,
      size: popSize
    })
  }, [columnsData, dataType, defaultSelectedKey, handleSelectedFinish, popSize, popTitle, props, queryInputsData, request])


  // const personList = useMemo(() => value?.reverse(), [value])


  return (
    <article className={styles.wrapper}>

      {isUseButton ?
        <Button {...buttonProps} onClick={handleOpenDataList}>{btnTxt}</Button> :
        <div className={styles.btnBox} onClick={handleOpenDataList}>{btnTxt}</div>
      }

      <section className={styles.box}>
        {dataType === 'person' && value?.map((item: any) =>
          <div className={styles.content} key={item.id}>
            <div className={styles.image}>
              <ImageSimple src={item.facePath} width={'100%'} height={'100%'} defaultSrc={defaultImgPeople} />
            </div>
            <div className={styles.info}>
              <div className={styles.name}>&emsp;&emsp;姓名：{item.name}</div>
              <div className={styles.name}>&emsp;手机号：{item.phone}</div>
              <div className={styles.name}>&emsp;&emsp;性别：{item.gender ? item.gender === '0' ? '未知' : item.gender === '1' ? '男' : '女' : item.sex === '0' ? '未知' : item.sex === '1' ? '男' : '女'}</div>
              <div className={styles.name}>身份证号：{item.idcard || item.identityCard}</div>
            </div>
          </div>
        )}
      </section>

    </article>
  )
}

DataListChoose.defaultProps = {
  dataType: 'ship',// 默认船舶列表
  rowSelectionType: 'radio',
  btnTxt: 'choose',
  popTitle: 'title',// 弹窗标题 
  popSize: 'large',// 弹窗size
}
export default DataListChoose
