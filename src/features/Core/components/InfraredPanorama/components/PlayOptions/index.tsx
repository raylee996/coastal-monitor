import { Button, Col, Radio, RadioChangeEvent, Row } from "antd";
import DateTimeRangeSimple from "hooks/basis/DateTimeRangeSimple";
import { DayjsRange } from "hooks/hooks";
import { useState } from "react";
import styles from "./index.module.sass";


interface Props {
  data: any
  onChange: (data: any) => void
  onClosePopup?: () => void
}

const PlayOptions: React.FC<Props> = ({ data, onChange, onClosePopup }) => {
  console.debug('PlayOptions')

  const [type, setType] = useState(data.type)
  const [range, setRange] = useState<[string, string]>()

  function handleChange({ target: { value } }: RadioChangeEvent) {
    setType(value)
  }

  function handleRange(value: DayjsRange, rangeString: [string, string]) {
    setRange(rangeString)
  }

  function handleSubmit() {
    onChange({
      type,
      range
    })
    onClosePopup && onClosePopup()
  }

  return (
    <article className={styles.wrapper}>
      <section>
        <Row>
          <Col span={4}>
            <span className={styles.label}>播放内容:</span>
          </Col>
          <Col span={20}>
            <Radio.Group onChange={handleChange} defaultValue={type}>
              <Radio value={1}>实时播放</Radio>
              <Radio value={2}>回放</Radio>
            </Radio.Group>
          </Col>
        </Row>
      </section>
      {type === 2 &&
        <section>
          <Row>
            <Col span={4}>
              <span className={styles.label}>回放时间:</span>
            </Col>
            <Col span={20}>
              <DateTimeRangeSimple onChange={handleRange} />
            </Col>
          </Row>
        </section>
      }
      <footer>
        <Button onClick={handleSubmit}>确认</Button>
      </footer>
    </article>
  )
}

export default PlayOptions