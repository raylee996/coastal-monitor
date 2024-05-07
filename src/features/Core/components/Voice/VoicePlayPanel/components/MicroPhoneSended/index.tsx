
import { Button } from 'antd'
import XcEmpty from 'component/XcEmpty'
import _ from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { getSendedMicroPhoneListAsync, stopMicroPhoneAsync } from 'server/device'
import styles from './index.module.sass'
// 已下发麦克风
const MicroPhoneSended: React.FC = () => {
    const [deviceList, setDeviceList] = useState<any[]>([])

    const getDevicesList = useCallback(
        async () => {
            let list = await getSendedMicroPhoneListAsync()
            let filterList = _.filter(list.TaskInfoArray, (item) => item.TaskTypeName === 'broadcast_type')
            setDeviceList(filterList)
        },
        [],
    )

    useEffect(() => {
        getDevicesList()
    }, [getDevicesList])


    useEffect(() => {
        async function main() {
            let list = await getSendedMicroPhoneListAsync()
            setDeviceList(list.TaskInfoArray)
        }
        main()
    }, [])

    async function handleStop(taskId: string) {
        await stopMicroPhoneAsync(encodeURI(taskId))
        getDevicesList()
    }
    return <div className={styles.wrapper}>
        {
            deviceList.length > 0 && deviceList.map((item: any) => {
                return <div className={styles.listItem} key={item.id}>
                    <span >{item.TaskIniator}</span>
                    <Button type="link" onClick={() => handleStop(item.TaskID)}>停止</Button>
                </div>
            })
        }
        {deviceList.length === 0 && <XcEmpty />}
    </div>
}

export default MicroPhoneSended