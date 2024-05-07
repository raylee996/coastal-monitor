import { ConfigProvider } from "antd";
import { store } from "app/store";
import React from "react";
import { ReactElement } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import zhCN from 'antd/lib/locale/zh_CN';

function createElementByComponent(component: ReactElement) {
  const element = document.createElement('div')

  const root = createRoot(element);

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <ConfigProvider locale={zhCN}>
          {component}
        </ConfigProvider>
      </Provider>
    </React.StrictMode>
  );

  return element;
}

export default createElementByComponent