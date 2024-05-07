import styles from "./index.module.sass";
import buttom_bk from "images/ship/button_bk.png"
import { useMemo } from "react";


interface Props {
  className?: string
  name?: string
  onClick?: () => void
}

const ButtonSmall: React.FC<Props> = ({ className, name, onClick }) => {
  console.debug('ButtonSmall')

  const classText = useMemo(() => className ? `${styles.wrapper} ${className}` : styles.wrapper, [className])

  function handleClick() {
    onClick && onClick()
  }

  return (
    <article className={classText} onClick={handleClick}>
      <span>{name}</span>
      <img src={buttom_bk} alt="" />
    </article>
  )
}

export default ButtonSmall