import { Button, Checkbox, Col, Row, Space } from "antd"
import { FilterDropdownProps } from "antd/es/table/interface"
import { useCallback } from "react"
import styles from "./index.module.sass";


const TableFilterDropdown: React.FC<FilterDropdownProps> = ({ selectedKeys, filters, setSelectedKeys, confirm, clearFilters }) => {
  console.debug('TableFilterDropdown')


  const handleChange = useCallback(
    (values: any[]) => {
      setSelectedKeys(values)
    },
    [setSelectedKeys]
  )

  const handleReset = useCallback(
    () => {
      clearFilters && clearFilters()
    },
    [clearFilters]
  )

  const handleSubmit = useCallback(
    () => {
      confirm({ closeDropdown: true })
    },
    [confirm]
  )


  return (
    <article className={styles.wrapper}>
      <section>
        {filters &&
          <Checkbox.Group className={styles.group} value={selectedKeys} onChange={handleChange} >
            <Row>
              {filters.map((item, index) =>
                <Col span={24} key={index}>
                  <Checkbox value={item.value}>
                    {item.text}
                  </Checkbox>
                </Col>
              )}
            </Row>
          </Checkbox.Group>
        }
      </section>
      <footer>
        <Space>
          <Button size="small" onClick={handleReset}>重置</Button>
          <Button size="small" type="primary" onClick={handleSubmit}>提交</Button>
        </Space>
      </footer>
    </article>
  )
}

export default TableFilterDropdown