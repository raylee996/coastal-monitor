import { Button } from "antd";
import XcEmpty from "component/XcEmpty";
import ImageSimple from "hooks/basis/ImageSimple";
import styles from "./index.module.sass";
import shipDefSrc from 'images/default/ship.png'

interface RelationBasicInfoProps {
  /** 渲染数据 */
  content: any[]
  /** 图片路径 */
  path?: string
  /** 是否不显示按钮 */
  isNotShowBtn?: boolean
  /** 按钮名称覆盖 */
  btnLabel?: string
  /** 按钮点击事件 */
  btnFunc?: Function
  /** 是否弹性两栏布局 */
  isFlexTwo?: boolean
}

const RelationBasicInfo: React.FC<RelationBasicInfoProps> = ({ content, path, isNotShowBtn, btnLabel, btnFunc, isFlexTwo }) => {
  console.debug('RelationBasicInfo')

  function handleClick() {
    btnFunc && btnFunc()
  }

  return (
    <section className={styles.wrapper}>
      {
        (!content && !path) ? <XcEmpty /> :
          <>
            {
              <div className={styles.imgBox}>
                 <ImageSimple
                    src={path}
                    width={"90%"}
                    height={'160px'}
                    defaultSrc={shipDefSrc}
                />
                {/* <ImageSimple src={path} /> */}
              </div>
            }
            <div className={`${styles.basisContent} ${isFlexTwo ? styles.flexBox : ''}`}>
              {
                content && content.map((item: any) => {
                  return (
                    <div key={item.key} className={`${styles.basisItem}  ${isFlexTwo ? styles.item : ''}`}>{`${item.label}：${item.value || '--'}`}</div>
                  )
                })
              }
              {
                !isNotShowBtn && <div className={styles.btnBox}>
                  <Button onClick={handleClick} type={"link"}>{btnLabel || '查看档案'}</Button>
                </div>
              }
            </div>
          </>
      }
    </section>
  )
}

export default RelationBasicInfo