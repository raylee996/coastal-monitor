import styles from "./index.module.sass";
import header_left from "images/popup/header_left.png"
import header_center from "images/popup/header_center.png"
import header_right from "images/popup/header_right.png"


const PopupHeaderBackground: React.FC = () => {
  console.debug('PopupHeaderBackground')

  return (
    <article className={styles.wrapper}>
      <header>
        <img src={header_left} alt="" />
      </header>
      <section>
        <img src={header_center} alt="" />
      </section>
      <footer>
        <img src={header_right} alt="" />
      </footer>
    </article>
  )
}

export default PopupHeaderBackground