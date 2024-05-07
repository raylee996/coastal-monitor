import { Col, Empty, Row } from "antd"

export type MoreBasicInfoData = {
  label: string;
  key: string
  value: string | number
}[]


interface MoreBasicInfoProps {
  data?: MoreBasicInfoData
}

const MoreBasicInfo: React.FC<MoreBasicInfoProps> = ({ data }) => {
  console.debug('MoreBasicInfo')

  return (
    <article style={{ color: '#a6cdff' }}>
      {
        data?.length ? <Row>{data.map(item => {
          return <Col span={12} key={item.key}>{`${item.label}：${item.value}`}</Col>
        })}</Row> : <Empty style={{ textAlign: 'left' }} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      }
    </article>
  )
}

export default MoreBasicInfo