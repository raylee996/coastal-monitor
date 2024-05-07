import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.css';
import zhCN from 'antd/lib/locale/zh_CN';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { ConfigProvider, message } from 'antd';
import { BrowserRouter } from 'react-router-dom';
import { windowstillConfig } from 'hooks/basis/Windowstill';
import { tablePanelConfig } from 'hooks/flexibility/TablePanel'
import { cardPanelConfig } from 'hooks/flexibility/CardPanel'
import XcEmpty from "./component/XcEmpty";
import TableFilterDropdown from 'component/TableFilterDropdown';


dayjs.locale('zh-cn');

windowstillConfig({
  initPosition: [60, 60],
  minTop: 60
})

//表格默认空数据图标
tablePanelConfig({
  EmptyDataComponent: <XcEmpty />,
  isShowRowNumber: true,
  filterDropdown: TableFilterDropdown
})

//card表格空数据默认图标
cardPanelConfig({
  EmptyDataComponent: <XcEmpty />
})

message.config({
  top: 100,
  maxCount: 3
})

const container = document.getElementById('root')!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ConfigProvider locale={zhCN}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ConfigProvider>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
