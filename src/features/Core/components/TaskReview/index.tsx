import React from "react";
import TaskEcharts from "./TaskEcharts";
import TaskReviewTable from "./TaskReviewTable";
import styles from './index.module.sass'
//任务回顾
const TaskReview:React.FC = ()=>{
  return<div className={styles.wrapper}>
    <TaskEcharts/>
    <TaskReviewTable/>
  </div>
}

export default TaskReview
