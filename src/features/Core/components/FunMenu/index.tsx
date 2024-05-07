import MenuButton from "./components/MenuButton"
import styles from "./index.module.sass";
import tsfx_def from "images/navButton/tsfx_def1.png"
import tsfx_hov from "images/navButton/tsfx_hov1.png"
import tsfx_act from "images/navButton/tsfx_act1.png"
import cblb_def from "images/navButton/cblb_def1.png"
import cblb_hov from "images/navButton/cblb_hov1.png"
import cblb_act from "images/navButton/cblb_act1.png"
import yjbk_def from "images/navButton/yjbk_def1.png"
import yjbk_hov from "images/navButton/yjbk_hov1.png"
import yjbk_act from "images/navButton/yjbk_act1.png"
import sshf_def from "images/navButton/sshf_def1.png"
import sshf_hov from "images/navButton/sshf_hov1.png"
import sshf_act from "images/navButton/sshf_act1.png"
import jcgk_def from "images/navButton/jcgk_def1.png"
import jcgk_hov from "images/navButton/jcgk_hov1.png"
import jcgk_act from "images/navButton/jcgk_act1.png"
import sykk_def from "images/navButton/sykk_def1.png"
import sykk_hov from "images/navButton/sykk_hov1.png"
import sykk_act from "images/navButton/sykk_act1.png"
import hwqj_def from "images/navButton/hwqj_def1.png"
import hwqj_hov from "images/navButton/hwqj_hov1.png"
import hwqj_act from "images/navButton/hwqj_act1.png"
import ssjk_def from "images/navButton/ssjk_def1.png"
import ssjk_hov from "images/navButton/ssjk_hov1.png"
import ssjk_act from "images/navButton/ssjk_act1.png"
import hhq_def from "images/navButton/hhq_def1.png"
import hhq_hov from "images/navButton/hhq_hov1.png"
import hhq_act from "images/navButton/hhq_act1.png"
import { useEffect, useState } from "react";
import _ from "lodash";
import { useAppDispatch } from "app/hooks";
import { resetParams, setIndex } from "slice/funMenuSlice";


interface Props {
  className?: string
  /** 状态提升，由父组件控制选中按钮 */
  index: number
  onClick: (idx: number, tit: string) => void
}

const FunMenu: React.FC<Props> = ({ className, index, onClick }) => {
  console.debug('FunMenu')

  const dispatch = useAppDispatch()

  const [butList, setButList] = useState([{
    isSel: false,
    title: '态势感知',
    defSrc: tsfx_def,
    hovSrc: tsfx_hov,
    actSrc: tsfx_act
  }, {
    isSel: false,
    title: '船舶列表',
    defSrc: cblb_def,
    hovSrc: cblb_hov,
    actSrc: cblb_act
  }, {
    isSel: false,
    title: '预警信息',
    defSrc: yjbk_def,
    hovSrc: yjbk_hov,
    actSrc: yjbk_act
  }, {
    isSel: false,
    title: '数据回放',
    defSrc: sshf_def,
    hovSrc: sshf_hov,
    actSrc: sshf_act
  }, {
    isSel: false,
    title: '进出港口',
    defSrc: jcgk_def,
    hovSrc: jcgk_hov,
    actSrc: jcgk_act
  }, {
    isSel: false,
    title: '水域卡口',
    defSrc: sykk_def,
    hovSrc: sykk_hov,
    actSrc: sykk_act
  }, {
    isSel: false,
    title: '红外周扫',
    defSrc: hwqj_def,
    hovSrc: hwqj_hov,
    actSrc: hwqj_act
  }, {
    isSel: false,
    title: '实时监控',
    defSrc: ssjk_def,
    hovSrc: ssjk_hov,
    actSrc: ssjk_act
  }, {
    isSel: false,
    title: 'IP音柱',
    defSrc: hhq_def,
    hovSrc: hhq_hov,
    actSrc: hhq_act
  }])

  useEffect(() => {
    setButList(val => {
      const result = [...val]
      result.forEach(item => item.isSel = false)
      if (!_.isUndefined(index) && index !== -1) {
        result[index].isSel = true
      }
      return result
    })
  }, [index])

  // 监听选中的index
  useEffect(() => {
    if (index !== -1) {
      const target = butList[index]
      target && onClick && onClick(index, target.title)
    }
  }, [index, onClick, butList])


  function handleClick(index: number) {
    dispatch(resetParams())
    dispatch(setIndex(index))
  }

  const articleClass = className ? `${styles.wrapper} ${className}` : styles.wrapper

  return (
    <article className={articleClass}>
      {butList.map((item, index) =>
        <MenuButton key={item.title} {...item} onClick={() => { handleClick(index) }} />
      )}
    </article>
  )
}

export default FunMenu