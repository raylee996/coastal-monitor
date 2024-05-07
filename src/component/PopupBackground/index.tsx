import styles from "./index.module.sass";
import top_left from "images/popup/top_left.png"
import top_center from "images/popup/top_center.png"
import top_right from "images/popup/top_right.png"
import bottom_center from "images/popup/bottom_center.png"
import bottom_other from "images/popup/bottom_left.png"
import border from "images/popup/left_right.png"

const PopupBackground: React.FC = () => {
  console.debug('PopupBackground')

  return (
    <article className={styles.wrapper}>
      <header>
        <img src={top_left} alt="" />
        <img src={top_center} alt="" />
        <img src={top_right} alt="" />
      </header>
      <section>
        <img src={top_center} alt="" />
      </section>
      <footer>
        <img src={bottom_other} alt="" />
        <img src={bottom_center} alt="" />
        <img src={bottom_other} alt="" />
      </footer>
      <aside>
        <img src={border} alt="" />
        <img src={border} alt="" />
      </aside>
    </article>
  )
}

export default PopupBackground