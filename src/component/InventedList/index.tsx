import {  useRef } from "react";

import styles from "./index.module.sass";

export interface ChildProps {
    /** 单条数据 */
    data: any
    /** 其他属性 */
    index: number
    /** 其他属性 */
    attrObj?: any
}

interface Props {
    /** 首次渲染的条数  */
    startCount?: number
    /** 所有数据 */
    list: any[]
    /** 一次加载的数据量 */
    viewCount: number
    /** 子组件 */
    Children: React.FC<ChildProps>
    /** 其他属性 */
    attrObj?: any
}

const InventedList: React.FC<Props> = ({  list, Children, attrObj }) => {
    console.debug('InventedList')
    
    const clientRef = useRef<any>(null)
    const scrollRef = useRef<any>(null)
  

    return <div className={styles.wrapper} ref={clientRef}>
        <div className={styles.content} ref={scrollRef}>
            {
                list?.map((item, index) => {
                    return <Children key={item.id} data={item} attrObj={attrObj} index={index} />
                })
            }
            {
                <li className={styles.finish} >{ '已经到底了'}</li>
            }
        </div>
    </div>
}

export default InventedList