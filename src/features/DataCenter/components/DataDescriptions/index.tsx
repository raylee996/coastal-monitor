import styles from "./index.module.sass";
import { Descriptions } from "antd";
import React from "react";
import '../../dataCenter.sass'
import common from "helper/common";

interface IDataDescriptions {
    /** 数据项 */
    data: any
    /**自定义class */
    customClass?: any
    customLabelStyle?: any
    /**自定义data中的key,value */
    valise?: any
    layout?: any
    column?: any
    title?: any
    bordered?: any
    onFinish?: any
}

const DataDescriptions: React.FC<IDataDescriptions> = (props) => {
    // label数据
    console.debug("DataDescriptions")

    const { valise, title, bordered, column, layout, data, customClass, customLabelStyle } = props

    return (
        <div className={styles.wrapper}>
            <Descriptions
                className={`${customClass}`}
                title={title}
                bordered={bordered}
                layout={layout}
                column={column}
                labelStyle={customLabelStyle}
            >
                {
                    data && data.map((item: any, index: number) => {
                        return (
                            <React.Fragment key={"xc_desc_" + index}>
                                <Descriptions.Item label={item[valise['name']]}>{common.isNull(item[valise['value']]) ? '--' : item[valise['value']]}</Descriptions.Item>
                            </React.Fragment>
                        )
                    })
                }
            </Descriptions>
        </div>
    )
}


// 组件属性默认值
DataDescriptions.defaultProps = {
    title: '',
    customClass: '',// 自定义class名称
    customLabelStyle: {},
    data: [],
    layout: 'horizontal',
    column: { xxl: 4, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 },
    valise: { name: 'label', value: 'value' }
}

export default DataDescriptions