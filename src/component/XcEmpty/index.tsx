import { Empty, EmptyProps } from 'antd';
import styles from "./index.module.sass";

import image from '../../images/noData.png'

interface IEXcEmpty extends EmptyProps {
  option?: Object,
}
const XcEmpty: React.FC<IEXcEmpty> = (props) => {

  return (
    <div className={styles.wrapper}>
      <Empty
        image={image}
        imageStyle={props.option}
        {...props}>
      </Empty>
    </div>
  )
}

// 组件属性默认值
XcEmpty.defaultProps = {
  option: {}
}

export default XcEmpty
