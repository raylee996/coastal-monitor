import { Button, ButtonProps } from "antd";
import _ from "lodash";
import React, { CSSProperties, ReactElement, useState } from "react";
import styles from "./index.module.sass";


interface IToolButton extends ButtonProps {
  asyncClick: () => Promise<void>
}

const ToolButton: React.FC<IToolButton> = ({ asyncClick, children, ...buttonProps }) => {

  const [isLoading, setIsLoading] = useState(false)

  async function handleClick() {
    if (asyncClick) {
      setIsLoading(true)
      await asyncClick()
      setIsLoading(false)
    }
  }

  return (<Button loading={isLoading} onClick={handleClick}  {...buttonProps}>{children}</Button>)
}

export type TableToolsOption = any[] | ReactElement

interface Props {
  options: TableToolsOption[]
  style?: CSSProperties
}

const TableTools: React.FC<Props> = ({
  options,
  style
}) => {



  return (
    <article className={styles.wrapper}>
      {options.map((ele, index) =>
        <section className={styles.item} style={style} key={index}>
          {(_.isArray(ele) && <ToolButton {...ele[1]}>{ele[0]}</ToolButton>) || <>{ele}</>}
        </section>
      )}
    </article>
  )
}

export default TableTools