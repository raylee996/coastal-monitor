import { screenTypeListData } from "helper";
import _ from "lodash";
import { useEffect, useState } from "react";
import styles from "./index.module.sass";

interface Props {
  /** 值 */
  value?: any
  /** 变更回调 */
  onChange?: (value: number) => void
}

const ScreenType: React.FC<Props> = ({ value, onChange }) => {
  console.debug('ScreenType')

  const [screenTypeList, setScreenTypeList] = useState(() => {
    const _screenTypeListData = _.cloneDeep(screenTypeListData)
    return _screenTypeListData
  })

  useEffect(() => {
    if (value) {
      // 样式更新
      setScreenTypeList(val => {
        const _val = _.clone(val)
        _val.forEach(item => { item.curSrc = item.defSrc })
        const target = _val.find(item => item.alt === value)!
        target.curSrc = target.actSrc
        return _val
      })
    }
  }, [value])

  function handleSelect(param: any) {
    // 样式更新
    setScreenTypeList(val => {
      const _val = _.clone(val)
      _val.forEach(item => { item.curSrc = item.defSrc })
      const target = _val.find(item => item.alt === param.alt)!
      target.curSrc = target.actSrc
      return _val
    })
    //播放类型（数量）
    onChange && onChange(param.alt)
  }

  return (
    <article>
      {screenTypeList.map(item => <img
        key={item.alt}
        className={styles.selectImg}
        src={item.curSrc}
        alt={item.alt}
        onClick={() => handleSelect(item)}
      />)}
    </article>
  )
}

export default ScreenType