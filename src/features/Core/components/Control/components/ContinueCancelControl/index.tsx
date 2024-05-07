import { Button, Space } from "antd";
import { queryApproveUser, queryUserInfo } from "api/core/wisdomCommand";
import { getDeptList } from "api/user";
import FormInterface from "hooks/integrity/FormInterface";
import { useEffect, useState } from "react";
import { cancelItem } from "server/core/controlManage";
import styles from "./index.module.sass";

interface Popup {
  /** 关闭popup */
  onClosePopup?: Function
}

interface Porps extends Popup {
  /** 选中布控信息id */
  id: string
  /** form表单内容配置项 */
  formInputs: any[]
  /** 调用接口 */
  api: any
  /** 更新table方法 */
  refresh: Function
  /** 是否仅展示，不编辑 */
  isShow?: boolean
}

// 递归，获取所在部门的ID
function getDeptArr(deptId: number, list: any[]) {
  let deptIds: any[] = [] //所在部门id 如： [22,23,24]
  function main(deptId: number, list: any[]) {
    for (let i = 0; i < list.length; i++) {
      if (list[i].deptId === deptId) {
        deptIds.push(deptId)
        if (list[i].parentId !== 0) {
          main(list[i].parentId, list)
        } else {
          break
        }
      }
    }
    return deptIds
  }
  return main(deptId, list)
}

const ContinueCancelControl: React.FC<Porps> = ({ onClosePopup, id, formInputs, api, refresh, isShow }) => {
  console.debug('ContinueCancelControl')
  const [initData, setInitData] = useState<any>()
  // 获取部门列表
  const [deptListArr, setDeptListArr] = useState([])
  //当前用户部门id
  const [currentUserDeptId, setCurrentUserDeptId] = useState<number>(0)
  //当前用户审批人id
  const [currentApproveId, setCurrentApproveId] = useState<any>(0)


  // 获取部门list
  useEffect(() => {
    async function getDeptLists() {
      const dto: any = {
        pageNumber: 1,
        pageSize: -1,
      };
      // 获取部门列表
      const vo = await getDeptList(dto);
      // 获取当前用户的部门ID
      const userDept = await queryUserInfo({})
      // 获取审批人
      const approveUser = await queryApproveUser({
        deptId: userDept.user.deptId || null,
        hasApprovePermission: 1,
        status: '0',
      })
      setCurrentApproveId(approveUser.records[0].userId || null)
      setCurrentUserDeptId(userDept.user.deptId || 0)
      const deptList: any = vo.records || []; //部门列表
      setDeptListArr(deptList)
    }
    getDeptLists()
  }, [])


  useEffect(() => {
    let list = getDeptArr(currentUserDeptId, deptListArr) || []
    let ids = list.reverse()
    setInitData({
      approveDeptId: ids,
      approvePersonId: currentApproveId
    })
  }, [currentUserDeptId, deptListArr, currentApproveId])

  async function handleFinish(data: any) {
    await api({ ...data, id })
    handleClose()
    refresh()
  }

  function handleClose() {
    onClosePopup && onClosePopup()
  }

  // 撤回操作
  async function handleReturn() {
    console.log('撤回操作');
    await cancelItem({ id })
    handleClose()
    refresh()
  }

  return (
    <section className={styles.FormPadding}>
      <FormInterface
        inputs={formInputs}
        formProps={{
          labelCol: {
            span: 3,
          },
          disabled: isShow ? true : false
        }}
        options={{
          isNotShowFooter: isShow
        }}
        onFinish={handleFinish}
        initData={initData}
      />
      {isShow && <Space className={styles.footerBtn}>
        <Button onClick={handleClose}>关闭</Button>
        <Button onClick={handleReturn}>撤回</Button>
      </Space>}
    </section>
  )
}

export default ContinueCancelControl