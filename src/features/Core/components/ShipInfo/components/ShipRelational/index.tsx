import { Button } from "antd";
import CaseArchiveInfo from "features/DataCenter/CaseArchiveInfo";
import ImageSimple from "hooks/basis/ImageSimple";
import popup from "hooks/basis/Popup";
import TableInterface from "hooks/integrity/TableInterface";
import { getShipCaseList, getShipSailorList } from "server/ship";
import styles from "./index.module.sass";
import PersonnelArchiveInfo from "../../../../../DataCenter/PersonnelArchiveInfo";
import shipDefSrc from 'images/default/ship.png'
import { defaultImgPeople } from "helper/common";



interface SeamenProps {
  data: any
}

const Seamen: React.FC<SeamenProps> = ({ data }) => {
  function viewArchive() {
    popup(<PersonnelArchiveInfo id={data.personId} />, { title: '个人档案详情', size: "fullscreen" })
  }
  return (
    <article className={styles.seamen}>
      <ImageSimple src={data.imgPath} width={72} height={72} defaultSrc={defaultImgPeople} />
      <footer>
        <div className={styles.seamenName}>{data.name}</div>
        <Button type="link" onClick={viewArchive}>查看档案</Button>
      </footer>
    </article>
  )
}

const columns = [
  ['案件编码', 'caseNo'],
  ['案件名称', 'caseName'],
  [['查看档案', (record: any) => {
    popup(<CaseArchiveInfo caseItem={record} />, { title: '案件详情', size: "fullscreen" })
  }]]
]

interface Props {
  /** 船舶档案信息 */
  info?: any
  /** websocket信息 */
  data?: any
}

const ShipRelational: React.FC<Props> = ({ info, data }) => {
  console.debug('ShipRelational')

  const extraParams = info ? { shipId: info.id } : undefined

  return (
    <article className={styles.wrapper}>

      <article className={styles.box}>
        <header>关联目标</header>
        <section>
          <div className={styles.base}>
            <div className={styles.imgBox}>
              <ImageSimple className={styles.imgBox} src={info?.shipImgPath} defaultSrc={shipDefSrc} />
            </div>
            <div>
              <div className={styles.target} title={info?.targetId}>目标ID: {data?.tagCode || info?.targetId}</div>
              <div className={styles.radar} title={info?.radarNumber}>雷达批号: {data?.batchNum || info?.radarNumber}</div>
            </div>
          </div>
        </section>
      </article>

      <article className={styles.box}>
        <header>船员信息</header>
        <section>
          <TableInterface
            extraParams={extraParams}
            isMustExtraParams={true}
            card={Seamen}
            paginationProps={{
              showQuickJumper: false,
              showSizeChanger: false,
              size: 'small',
              pageSize: 5
            }}
            request={getShipSailorList}
          />
        </section>
      </article>

      <article className={styles.box}>
        <header>关联案件</header>
        <section>
          <TableInterface
            extraParams={extraParams}
            columns={columns}
            tableProps={{
              size: 'small'
            }}
            paginationProps={{
              showQuickJumper: false,
              showSizeChanger: false,
              size: 'small',
              pageSize: 5
            }}
            request={getShipCaseList}
          />
        </section>
      </article>

    </article>
  )
}

export default ShipRelational;
