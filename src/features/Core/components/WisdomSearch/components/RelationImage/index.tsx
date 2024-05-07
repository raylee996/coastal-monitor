import { Button, Image } from "antd"
import XcEmpty from "component/XcEmpty";
import ImageSimple from "hooks/basis/ImageSimple";
import { useState } from "react";
import styles from "./index.module.sass";
import './index.sass';
import { defaultImgPeople } from "helper/common";

interface BtnOptions {
  btnText?: string
  /** 按钮点击事件 */
  func?: Function
}

interface ImageProps {
  /** 视频url集合 */
  imageList: any[]
  /** 是否有按钮 */
  isButton?: boolean
  /** 按钮属性， 当有按钮时使用 */
  btnOptions?: BtnOptions
  /** 按钮原生属性， 当有按钮时使用 */
  btnProps?: any
  /** 需要显示的属性 */
  keyArray?: string[]
}

const RelationImage: React.FC<ImageProps> = ({ imageList, isButton, btnOptions, btnProps, keyArray }) => {
  console.debug('RelationImage')

  const [visible, setVisible] = useState(false);
  const [currentVisibleIndex, setCurrentVisibleIndex] = useState<number>(0)

  function handleClick(data: any) {
    btnOptions?.func && btnOptions.func(data)
  }

  function handlePlateClick(data: any) {
    console.log(data, 'data')
  }

  return (
    <article className={`${styles.wrapper} RelationImage__wrapper`}>
      {
        imageList?.length ? imageList.map((item, index) => {
          return <li key={item.id} className={`${styles.wrapperItem} RelationVideo__wrapper`}>
            <ImageSimple preview={false} className={styles.image} width={'100%'} height={'100%'} src={item.picUrl || item.path || defaultImgPeople} alt='' onClick={() => { setVisible(true); setCurrentVisibleIndex(index) }} />
            {isButton && <p className={styles.nameTit}>{item.sailorName}</p>}
            {isButton &&
              <Button {...btnProps} onClick={() => handleClick(item)} style={{ marginLeft: '30px' }}>{btnOptions?.btnText || '确认'}</Button>
            }
            {keyArray &&
              keyArray.map((n, j: number) => {
                return (
                  <div className={styles.keyBox}>
                    <Button type="link" key={`${j}`} onClick={() => handlePlateClick(item)}>{item[n]}</Button>
                  </div>
                )
              })
            }
          </li>
        }) : <XcEmpty />
      }
      <div style={{ display: 'none' }}>
        <Image.PreviewGroup preview={{ visible, onVisibleChange: (vis) => setVisible(vis), current: currentVisibleIndex }}>
          {imageList?.length && imageList.map((shipImgItem: any) => <Image key={shipImgItem.picUrl} src={shipImgItem.picUrl}></Image>)}
        </Image.PreviewGroup>
      </div>
    </article>
  )
}

export default RelationImage