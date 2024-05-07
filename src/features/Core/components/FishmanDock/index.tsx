import { CheckOutlined, WarningOutlined } from "@ant-design/icons";
import { Col, Row, Statistic } from "antd";
import windowstill from "hooks/basis/Windowstill";
import { ColType } from "hooks/flexibility/TablePanel";
import TableInterface from "hooks/integrity/TableInterface";
import { getFishmanShipList } from "server/ship";
import ShipScanInfo from "./components/ShipScanInfo";
import styles from "./index.module.sass";

interface ResultProps {
  text: boolean
  record: any
}
const Result: React.FC<ResultProps> = ({ text }) => {
  return (
    <>
      {text
        ? <CheckOutlined style={{ fontSize: 24, color: 'green' }} />
        : <WarningOutlined style={{ fontSize: 24, color: 'red' }} />
      }
    </>
  )
}

const columns = [
  ['船名', 'name'],
  ['MMSI', 'mmsi'],
  ['申报人数', 'number'],
  ['目的地', 'destination'],
  ['申报时间', 'time'],
  ['人员比对', 'contrast', ColType.component, { component: Result }],
  ['红外扫描', 'scanner', ColType.component, { component: Result }],
  [
    ['详情', (record: any) => {
      console.log(record)
      windowstill(<ShipScanInfo />, { title: '船舶详情', width: 800, height: 600 })
    }],
    ['档案', (record: any) => {
      console.log(record)
    }]
  ],
]

const FishmanDock: React.FC = () => {
  console.debug('FishmanDock')


  return (
    <article className={styles.wrapper}>
      <section className={styles.left}>
        <section className={styles.videoBox}></section>
        <section className={styles.tableBox}>
          <TableInterface
            columns={columns}
            request={getFishmanShipList}
            tableProps={{ size: 'small' }}
            paginationProps={{ size: 'small' }} />
        </section>
      </section>
      <section className={styles.right}>
        <section className={styles.statisticBox}>
          <Row>
            <Col span={12}>
              <Statistic title="异常船舶" value={3} />
            </Col>
            <Col span={12}>
              <Statistic title="进港/出港船次" value={'54/45'} />
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Statistic title="异常人员" value={2} />
            </Col>
            <Col span={12}>
              <Statistic title="比对/申报人次" value={'100/101'} />
            </Col>
          </Row>
        </section>
        <section className={styles.errorBox}>
          <div className={styles.title}>异常信息</div>
          <div className={styles.errorList}>
            <article className={styles.errorInfo}>
              <section className={styles.errorInfoBox}>
                <img className={styles.errorInfoImg} src="" alt="图片" />
                <div className={styles.errorInfoMark}>未申报人员</div>
              </section>
              <footer>
                <i className="fa fa-clock-o" aria-hidden="true"></i>
                <span>01-02 10:19:22</span>
              </footer>
            </article>
          </div>
        </section>
        <section className={styles.contrastBox}>
          <div className={styles.contrastInfo}>
            <div className={styles.title}>对比人员</div>
            <div className={styles.contrastList}>
              <div className={styles.card}>
                <div className={styles.cardImg}>
                  <img src="" alt="图片" />
                  <div className={styles.cardMark}>对比人脸</div>
                </div>
                <div className={styles.cardImg}>
                  <img src="" alt="图片" />
                  <div className={styles.cardMark}>申报人员</div>
                </div>
                <div className={styles.cardInfo}>
                  <div>对比成功</div>
                  <div>姓名：xxxx</div>
                  <div>手机：xxxx</div>
                  <div>
                    <i className="fa fa-clock-o" aria-hidden="true"></i>
                    <span>01-02 10:19:22</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </section>
    </article>
  )
}

export default FishmanDock