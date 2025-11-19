import React, { useEffect, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import store, { RootState } from "./redux/store";
import { BrowserRouter } from 'react-router-dom';
import './locales/i18n';
import Router from "./Routes/Routes";
import { startUp, startUpDone } from "./redux/actions";
import { ConfigProvider } from 'antd';
import enUS from 'antd/lib/locale/en_US';
import deDE from 'antd/lib/locale/de_DE';
import 'dayjs/locale/de';
import 'dayjs/locale/en';
import dayjs from 'dayjs';

dayjs.locale('de');


function App() {
  const dispatch = useDispatch();
  const [locale, setLocale] = useState(deDE);
  const language = useSelector((state: RootState) => state.settings.language);


  useEffect(() => {
    dispatch(startUp());
    let profile = null;
    const res = localStorage.getItem('profile');
    if (res) {
      profile = JSON.parse(res);
    }
    dispatch(startUpDone(profile));
  }, [dispatch]);

  useEffect(() => {
    changeLocale(language);
  }, [language]);

  const changeLocale = (lang: string) => {
    const newLocale = lang === 'en' ? enUS : deDE;
    setLocale(newLocale);
    dayjs.locale(lang);
  };

  return (
    <ConfigProvider locale={locale}>
      <Router />
    </ConfigProvider>
  );
}

function Container() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="App">
          <App />
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default Container;
