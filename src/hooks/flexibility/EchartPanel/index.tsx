import React, { useEffect, useMemo, useRef, useState } from "react";
import style from "./index.module.sass";


/**
 * 自定义配置
 */
interface Config {

}

interface Props {
  /** 样式类名 */
  className?: string
  /** echart配置 */
  option?: any
  /** 自定义配置 */
  config?: Config;
  /** 点击事件 */
  onClick?: () => void
}

const EchartPanel: React.FC<Props> = ({ option, className, onClick }) => {
  console.debug('EchartPanel')


  const chartRef = useRef<HTMLDivElement>(null);


  const [chart, setChart] = useState<any>(null);


  useEffect(() => {
    let _chart: any = null;
    if (chartRef.current) {
      _chart = echarts.init(chartRef.current);
      window.addEventListener("resize", cResize);
    }
    function cResize() {
      _chart.resize();
    }
    setChart(_chart);
    return () => {
      _chart.dispose();
      setChart(null);
      window.removeEventListener("resize", cResize);
    };
  }, [chartRef]);

  useEffect(() => {
    if (chart && option) {
      chart.setOption(option);
    }
  }, [chart, option]);


  const articleClassName = useMemo(() => className ? `${style.wrapper} ${className}` : style.wrapper, [className])


  return (
    <article className={articleClassName} onClick={onClick}>
      <div className={style.chart} ref={chartRef}></div>
    </article>
  );
};

export default EchartPanel;
