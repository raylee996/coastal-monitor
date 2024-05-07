import { Image } from 'antd';
import _ from 'lodash';
import React, { useImperativeHandle } from 'react';
import { useMemo, useState } from 'react';
import styles from './index.module.sass'


interface Data {
  id?: number | string
  src?: string
}

interface Props {
  /** 数据体 */
  data?: Data[]
  /** 更改src字段名称，默认是src */
  srcKeyName?: string
  /** 更改key字段名称，默认是id */
  forKeyName?: string
}

export interface ImagePreviewGroupRefProps {
  open: (index?: number) => void
  close: () => void
}

const ImagePreviewGroup = React.forwardRef<ImagePreviewGroupRefProps, Props>(({ data, srcKeyName, forKeyName }, ref) => {
  console.debug('ImagePreviewGroup')


  const [isVisible, setIsVisible] = useState(false)
  const [current, setCurrent] = useState(0)


  /** 导出刷新函数 */
  useImperativeHandle(
    ref,
    () => ({
      open: (index?: number) => {
        setCurrent(index || 0)
        setIsVisible(true)
      },
      close: () => setIsVisible(false)
    }),
    []
  )


  const preview = useMemo(() => (
    {
      visible: isVisible,
      current,
      onVisibleChange: (is: boolean) => setIsVisible(is)
    }), [isVisible, current])

  const imageList = useMemo(() => {
    if ((srcKeyName || forKeyName) && data) {
      let _imageList = data
      if (srcKeyName) {
        _imageList = _imageList.map(item => ({ ...item, src: _.get(item, srcKeyName) }))
      }
      if (forKeyName) {
        _imageList = _imageList.map(item => ({ ...item, id: _.get(item, forKeyName) }))
      }
      return _imageList
    } else {
      return data
    }
  }, [data, srcKeyName, forKeyName])


  return (
    <article className={styles.wrapper}>
      {isVisible && <Image.PreviewGroup preview={preview} >
        {imageList?.map(item =>
          <Image key={item.id} preview={{ src: item.src }} />
        )}
      </Image.PreviewGroup>}
    </article>
  )
})


export default ImagePreviewGroup