import { CloseOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { Button, Modal } from "antd";
import DataListChoose from "features/DataCenter/components/DataListChoose";
import common from "helper/common";
import { PersonRelationDict } from "helper/dictionary";
import SelectSimple from "hooks/basis/SelectSimple";
import React, { useState } from "react";
import { doGetPersonList } from "server/personnel";
import styles from "./index.module.sass";
const { confirm } = Modal

// 选择的用户卡片
interface IUserCard {
    /**用户数据 */
    data?: any
    onFinish?: any
}
const UserCard: React.FC<IUserCard> = (props) => {
    const { data, onFinish } = props

    function handleDelUser(val: any) {
        confirm({
            title: `是否要删除【${val.name}】`,
            icon: <ExclamationCircleFilled />,
            okText: '确定',
            cancelText: '取消',
            onOk() {
                onFinish && onFinish(val)
            },
            onCancel() {
            },
        })

    }
    return (
        <div className={styles.cardWrapper}>
            <div className={styles.closeBtn} onClick={() => { handleDelUser(data) }}><CloseOutlined /></div>
            <div className={styles.title}>{common.isNull(data.name) ? '' : data.name} </div>
        </div>
    )
}


// 新增关系页面
interface IRelationAdd {
    /**选择事件 */
    onFinish?: Function
    /**关闭窗口事件 */
    onClosePopup?: any
}
const RelationAdd: React.FC<IRelationAdd> = (props) => {
    console.debug('RelationAdd')

    const { onFinish, onClosePopup } = props

    // 用户卡片数据
    const [userList, setUserList] = useState<any>([])

    // 身份
    const [userStatus, setUserStatus] = useState<any>(null)

    // 选择人员后
    function handleSelectedPerson(data: any) {
        if (data && data[1].length !== 0) {
            setUserList((old: any) => {
                let arr = [...old, ...data[1]]
                let map: any = new Map();
                for (let item of arr) {
                    map.set(item.id, item);
                }
                arr = [...map.values()];
                return arr
            })

        }
    }

    // 删除用户
    function handleDelUser(data: any) {
        setUserList((old: any) => {
            let result = [...old]
            let len = old.length
            if (len !== 0) {
                for (let i = 0; i < len; i++) {
                    let item = result[i]
                    if (item.id === data.id) {
                        result.splice(i, 1)
                        break
                    }
                }
            }
            return result
        })
    }

    // 确定按钮事件，并将值都导出
    function handleSubmit() {
        let userIds: any = []

        if (!userStatus) {
            common.showMessage({ msg: '请选择身份', type: 'error' })
            return false
        }

        if (userList.length !== 0) {
            userIds = userList.map((ele: any) => { return ele.id })
        }

        // 确定后，导出数据
        onFinish && onFinish({
            userStatus, // 身份
            userIds, // 选择的用户ids
            userList // 用户
        })

        // 关闭窗口
        onClosePopup && onClosePopup()
    }

    // 取消按钮
    function handleOnCancel() {
        // 关闭窗口
        onClosePopup && onClosePopup()
    }

    return (
        <div className={styles.wrapper}>
            <div className={styles.row}>
                <div className={`${styles.col}`}>
                    <div className={styles.colLabel}>身份</div>
                    <div className={styles.colContent}>
                        <SelectSimple
                            style={{ width: '280px' }}
                            dict={PersonRelationDict}
                            onChange={(data: any) => {
                                setUserStatus(data)
                            }}
                        />
                    </div>
                </div>

                <div className={`${styles.col}`}>
                    <div className={styles.colLabel}>人员</div>
                    <div className={styles.colContent}>
                        <DataListChoose
                            btnTxt={'选择人员'}
                            popTitle={'人员档案列表'}
                            dataType={'person'}
                            rowSelectionType={"checkbox"}
                            request={doGetPersonList}
                            onFinish={handleSelectedPerson}
                        />


                        {
                            userList.length !== 0 ?
                                <div className={styles.userLists}>
                                    {
                                        userList.map((element: any) => {
                                            // 选择的用户项
                                            return (
                                                <>
                                                    <UserCard data={element} onFinish={handleDelUser} />
                                                </>
                                            )
                                        })
                                    }
                                </div>
                                :
                                <></>
                        }
                    </div>
                </div>


                <div className={`${styles.col} ${styles.btnLine} `}>
                    <Button className={styles.btnCancel} onClick={handleOnCancel}>取消</Button>
                    <Button type="primary" onClick={handleSubmit}>确定</Button>
                </div>

            </div>
        </div >
    )
}
export default RelationAdd