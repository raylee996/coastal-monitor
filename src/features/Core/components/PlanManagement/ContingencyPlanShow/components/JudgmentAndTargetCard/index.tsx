import { Button, message } from 'antd'
import windowUI from 'component/WindowUI'
import XcEmpty from 'component/XcEmpty'
import dayjs from 'dayjs'
import WarningDetail from 'features/Core/components/WarningModel/components/WarningDetail'
import ArchiveInfo from 'features/DataCenter/components/ArchiveInfo'
import { YMDHms } from 'helper'
import popup from 'hooks/basis/Popup'
import { useState } from 'react'
import CarContent from './components/CarContent'
import PersonnelContent from './components/PersonnelContent'
import ShipContent from './components/ShipContent'
import styles from './index.module.sass'

interface Props {
    /** 数据 */
    data: any
}

const JudgmentAndTargetCard: React.FC<Props> = ({ data }) => {
    console.debug('JudgmentAndTargetCard')

    const [isOpen, setIsOpen] = useState<boolean>(true)

    function handleChangeOpen() {
        setIsOpen(olaVal => {
            return !olaVal
        })
    }

    // 查看档案 含视图与船员
    function handleOpenArchive(data: any, pageKey?: any) {
        if (!data.archiveId) {
            message.error('暂无档案')
            return;
        }
        let archiveType: number = 0
        switch (true) {
            case [6, 7, 8].includes(data.codeType):
                archiveType = 1;
                break
            case data.codeType === 0:
                archiveType = 2;
                break
            case data.codeType === 1:
                archiveType = 3;
                break
        }
        archiveType && popup(<ArchiveInfo type={archiveType} id={data.archiveId} extraParams={{ pageKey }} />, { title: '查看档案', size: "fullscreen" })
    }

    // 打开预警详情 近3天
    function handleOpenWarningDetail(data: any) {
        data?.codeValue && windowUI(<WarningDetail
            id={data.codeValue}
            contentType={data.codeType}
            startTime={dayjs().subtract(1, 'day').format(YMDHms)}
            endTime={dayjs().format(YMDHms)}
        />,
            { title: `预警详情`, key: '预警详情', width: '480px', height: '800px', offset: [1400, 40] })
    }

    // 打开历史轨迹
    function handleHistoryTrack(data: any) {
        data?.codeValue && windowUI(<WarningDetail
            id={data.codeValue}
            contentType={data.codeType}
            startTime={dayjs().subtract(1, 'day').format(YMDHms)}
            endTime={dayjs().format(YMDHms)}
            parentDate={{
                isActiveFirst: true,
                warnContent: data.codeValue,
                ...data
            }}
        />,
            { title: `预警详情`, key: '预警详情', width: '480px', height: '800px', offset: [1400, 40] })
    }

    // 查看报告
    function handleViewReport(data: any) {

    }

    return <article className={styles.wrapper}>
        <div className={styles.topBg}></div>
        <div className={styles.content}>
            {/* 头部基础信息 */}
            <div>
                {/* 船舶、雷达、目标id */}
                {
                    [6, 7, 8].includes(data.codeType) && <ShipContent data={data} />
                }
                {/* 人员 */}
                {
                    [0].includes(data.codeType) && <PersonnelContent data={data} />
                }
                {/* 车辆 */}
                {
                    [1].includes(data.codeType) && <CarContent data={data} />
                }
                {/* 其他类型咱设置为空 */}
                {
                    ![0, 1, 6, 7, 8].includes(data.codeType) && <XcEmpty />
                }
            </div>

            {/* 操作按钮集合 */}
            <div className={styles.btnBox}>
                <Button type={'link'} onClick={() => handleOpenArchive(data)}>查看档案</Button>
                <Button type={'link'} onClick={() => handleOpenWarningDetail(data)}>预警记录</Button>
                {
                    [0].includes(data.codeType) && <Button type={'link'} onClick={() => handleOpenArchive(data)}>关联船舶</Button>
                }
                {
                    [6, 7, 8].includes(data.codeType) && <>
                        <Button type={'link'} onClick={() => handleViewReport(data)}>查看报告</Button>
                        <Button type={'link'} onClick={() => handleOpenArchive(data, { secondPageKey: 'item-3' })}>视图信息</Button>
                        <Button type={'link'} onClick={() => handleOpenArchive(data, { secondPageKey: 'item-1' })}>船员信息</Button>
                        <Button type={'link'} onClick={() => handleHistoryTrack(data)}>历史轨迹</Button>
                    </>
                }
            </div>
            {/* 分割线 */}
            <div className={styles.splitLine}></div>

            {/* 风险要素内容 */}
            <div className={styles.main}>
                <div className={styles.main_lable}>
                    <div className={styles.lable}>风险要素</div>
                    <div className={styles.btn} onClick={handleChangeOpen}>{isOpen ? '收起' : '展开'}</div>
                </div>
                {
                    isOpen ? <div className={styles.main_content}>
                        {
                            data?.judgeJsons?.length ? data.judgeJsons.map((item: any, index: number) => {
                                return <div className={styles.main_text}>{`${index + 1}、${item.itemDesc || '--'}`}</div>
                            }) : <XcEmpty />
                        }
                    </div> : <></>
                }
            </div>

            {/* 底部线 */}
            <div className={styles.bottomLine}></div>
        </div>
        <div className={styles.bottomBg}></div>
    </article>

}

export default JudgmentAndTargetCard