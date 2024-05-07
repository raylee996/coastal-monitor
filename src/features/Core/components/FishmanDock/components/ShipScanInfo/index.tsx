import { Carousel, Descriptions } from "antd";
import ImageSimple from "hooks/basis/ImageSimple";
import TableInterface from "hooks/integrity/TableInterface";
import styles from "./index.module.sass";

const columns = [
  ['IMSI', 'imsi'],
  ['运营商', 'shop'],
  ['时间', 'time']
]

const ShipScanInfo: React.FC = () => {
  console.debug('ShipScanInfo')

  return (
    <article className={styles.wrapper}>
      <section className={styles.left}>
        <section className={styles.top}>
          <div className={styles.imgBox}>
            <ImageSimple className={styles.img} />
            <div className={styles.error}>
              <span>异常船舶</span>
            </div>
          </div>
          <div className={styles.desc}>
            <Descriptions column={1}>
              <Descriptions.Item label="船名">Zhou Maomao</Descriptions.Item>
              <Descriptions.Item label="MMSI">1810000000</Descriptions.Item>
              <Descriptions.Item label="申报人数">Hangzhou, Zhejiang</Descriptions.Item>
              <Descriptions.Item label="目的地">empty</Descriptions.Item>
              <Descriptions.Item label="人员比对">xxxx</Descriptions.Item>
              <Descriptions.Item label="红外扫描">xxxx</Descriptions.Item>
            </Descriptions>
          </div>
        </section>
        <section className={styles.bottom}>
          <div className={styles.banner}>
            <div className={styles.title}>
              <span>红外扫描</span>
            </div>
            <Carousel className={styles.carousel} autoplay>
              <ImageSimple className={styles.img} />
              <ImageSimple className={styles.img} />
            </Carousel>
          </div>
          <div className={styles.tableBox}>
            <div className={styles.title}>
              <span>手机码检测</span>
            </div>
            <div className={styles.table}>
              <TableInterface
                columns={columns}
                tableProps={{
                  size: 'small'
                }}
                paginationProps={{
                  size: 'small',
                  showQuickJumper: false,
                  showSizeChanger: false
                }}
              />
            </div>
          </div>
        </section>
      </section>
      <section className={styles.right}>
        <section className={styles.contrastBox}>
          <div className={styles.contrastInfo}>
            <div className={styles.title}>
              <span>对比人员</span>
            </div>
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

export default ShipScanInfo