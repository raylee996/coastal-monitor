import { Button, message } from "antd";
import CaseArchiveInfo from "features/DataCenter/CaseArchiveInfo";
import ShipArchiveInfo from "features/DataCenter/ShipArchiveInfo";
import ImageSimple from "hooks/basis/ImageSimple";
import popup from "hooks/basis/Popup";
import TableInterface from "hooks/integrity/TableInterface";
import { getShipCaseList, getShipSailorList } from "server/ship";
import styles from "./index.module.sass";
import shipDefSrc from 'images/default/ship.png'
import { defaultImgPeople } from "helper/common";


interface SeamenProps {
  data: any
}

const Seamen: React.FC<SeamenProps> = ({ data }) => {
  return (
    <article className={styles.seamen}>
      <ImageSimple src={data.imgPath} width={72} height={72} defaultSrc={defaultImgPeople}/>
      <footer>
      <div className={styles.seamenName}>{data.name}</div>
        <Button type="link">查看档案</Button>
      </footer>
    </article>
  )
}

const columns = [
  ['案件编码', 'caseCode'],
  ['案件名称', 'caseName'],
  [['查看档案', (record: any) => {
    popup(<CaseArchiveInfo caseItem={record} />, { title: '案件详情', size: "fullscreen" })
  }]]
]

interface Props {
  /** 船舶档案信息 */
  shipInfo?: any
}

const RadarRelational: React.FC<Props> = ({ shipInfo }) => {
  console.debug('RadarRelational')

  function handleArchive() {
    if (shipInfo) {
      popup(<ShipArchiveInfo id={shipInfo.id} dataType={shipInfo.dataType} />, { title: '查看船舶档案', size: "fullscreen" })
    } else {
      message.warning('无档案信息')
    }
  }


  const extraParams = shipInfo ? { shipId: shipInfo.id } : undefined


  return (
    <article className={styles.wrapper}>

      {shipInfo &&
        <article className={styles.box}>
          <header>关联AIS</header>
          <section>
            <div className={styles.base}>
              <div className={styles.imgBox}>
                <ImageSimple src={shipInfo?.shipImgPath} defaultSrc={shipDefSrc}/>
              </div>
              <div className={styles.infoBox}>
                <div>{shipInfo?.mmis}</div>
                <div>船型：{shipInfo?.shipTypeName}</div>
                <div>
                  <Button type="link" onClick={handleArchive}>查看档案</Button>
                </div>
              </div>
            </div>
          </section>
        </article>
      }

      {/* <Card
        size="small"
        title="关联AIS"
        bordered={false}
      >
        {shipInfo &&
          <div className={styles.base}>
            <div className={styles.imgBox}>
              <ImageSimple src={shipInfo?.shipImgPath} />
            </div>
            <div className={styles.infoBox}>
              <div>{shipInfo?.mmis}</div>
              <div>船型：{shipInfo?.shipTypeName}</div>
              <div>
                <Button type="link" onClick={handleArchive}>查看档案</Button>
              </div>
            </div>
          </div>
        }
      </Card> */}

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

      {/* <Card
        size="small"
        title="船员信息"
        bordered={false}
      >
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
      </Card> */}

      <article className={styles.box}>
        <header>关联案件</header>
        <section>
          <TableInterface
            extraParams={extraParams}
            isMustExtraParams={true}
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

      {/* <Card
        size="small"
        title="关联案件"
        bordered={false}
      >
        <TableInterface
          extraParams={extraParams}
          isMustExtraParams={true}
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
      </Card> */}

    </article>
  )
}

export default RadarRelational;