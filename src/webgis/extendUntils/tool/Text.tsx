import { CloseOutlined } from "@ant-design/icons";
import { Popconfirm } from "antd";
import _ from "lodash";
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import createElementByComponent from "webgis/untils/elementComponent";
import styles from "./Text.module.sass";


type LatLng = {
  lat: number
  lng: number
}

interface TextData {
  text: string,
  latlng: LatLng
}

interface TextInfoProps {
  latlng: LatLng
  textValue?: string
  mapLeft?: any
  limit?: number
  onOver: (data: TextData) => void
  onValue: (text: string) => void
  onClose: () => void
}

const TextInfo: React.FC<TextInfoProps> = ({ limit, latlng, textValue, mapLeft, onOver, onValue, onClose }) => {
  console.debug('TextInfo')

  const [text, setText] = useState(textValue || '')
  const [isReadOnly, setIsReadOnly] = useState(textValue ? true : false)
  const [isShowClose, setIsShowClose] = useState(false)

  const handleBlur = useCallback(
    () => {
      setIsReadOnly(true)
      onValue(text)
      onOver({ text, latlng })
    },
    [text, latlng, onOver, onValue],
  )

  const handleText = useCallback(
    ({ target: { value } }: ChangeEvent<HTMLTextAreaElement>) => {
      setText(value)
    },
    [],
  )

  const handleEnter = useCallback(
    () => {
      setIsShowClose(true)
    },
    [],
  )

  const handleLeave = useCallback(
    () => {
      setIsShowClose(false)
    },
    [],
  )
  useEffect(() => {
    const handleKeydown = (e: any) => {

      if (e.keyCode === 27) {
        mapLeft && mapLeft.pm.removeControls()
        onClose && onClose()
      }
    }
    document.addEventListener('keydown', handleKeydown)
    return () => {
      document.removeEventListener('keydown', handleKeydown)
    }
  }, [mapLeft, onClose])




  return (
    <article className={styles.textInfo} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      {!isReadOnly && <p className={styles.exist}>按Esc退出</p>}
      {isShowClose && isReadOnly &&
        <Popconfirm
          title='删除标记?'
          okText='确认'
          cancelText='取消'
          onConfirm={onClose}
        >
          <CloseOutlined className={styles.textInfoClose} />
        </Popconfirm>
      }
      {isReadOnly
        ? <div className={`${styles.text} tool-text-only-ui`}>{text}</div>
        : <> <textarea
          className={`${styles.textarea} tool-text-textarea-ui`}
          disabled={isReadOnly}
          readOnly={isReadOnly}
          value={text}
          onChange={handleText}
          autoFocus
          onBlur={handleBlur}
          maxLength={limit}
        /></>
      }
    </article>
  )
}


export interface TextToolOptions {
  /** 文本输入数量限制 */
  limit?: number
  /** 创建成功的回调 */
  onCreate?: (layer: any) => void
  /** 清除的回调 */
  onClear?: (e: any) => void
}

class Text {
  readonly map: any

  private onCreate: any
  private onClear: any
  private limit: number | undefined

  popup: any

  constructor(_map: any) {
    this.map = _map
  }

  open(opt?: TextToolOptions) {
    this.map.on('click', this.create, this)
    this.map.on('keydown', this.clear, this)
    this.map._container.classList.add(styles.cursor)
    if (opt) {
      if (opt.onCreate) {
        this.onCreate = opt.onCreate
      }
      if (opt.onClear) {
        this.onClear = opt.onClear
      }
      if (opt.limit) {
        this.limit = opt.limit
      }
    }
  }

  create(e: { latlng: LatLng, textValue?: string, onClear?: (e: any) => void }) {

    let value = e.textValue || ''

    const setValue = (text: string) => {
      value = text
    }

    const overEvtFn = (data: TextData) => {
      const text = _.trim(data.text)
      if (text) {
        this.onCreate && this.onCreate({
          ...data,
          text
        })
      } else {
        this.popup.remove()
      }
    }


    const _popup = L.popup({
      className: 'leaflet-popup-ui leaflet-popup-text-ui',
      minWidth: 80,
      maxWidth: 100,
      autoPanPadding: [0, 0],
      closeOnClick: false,
      closeButton: false,
      isToolText: true
    })

    const clearEvtFn = () => {
      this.popup.remove()
      if (e.onClear) {
        e.onClear({
          text: value,
          latlng: e.latlng
        })
      } else if (this.onClear) {
        this.onClear({
          text: value,
          latlng: e.latlng
        })
      }
    }

    let content = createElementByComponent(<TextInfo
      limit={this.limit}
      onOver={overEvtFn}
      onValue={setValue}
      onClose={clearEvtFn}
      latlng={e.latlng}
      textValue={e.textValue}
      mapLeft={this.map}
    />)

    _popup.setLatLng(e.latlng).setContent(content).addTo(this.map)

    this.popup = _popup
  }

  private clear() {
    this.map.off('click', this.create, this)
    this.map.off('keydown', this.clear, this)
    this.map._container.classList.remove(styles.cursor)
  }

  remove() {
    this.popup.remove()
  }

}

export default Text