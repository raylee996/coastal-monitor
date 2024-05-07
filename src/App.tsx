import { useNavigate } from 'react-router-dom';
import RouterConfig from './RouterConfig';
import './App.sass'
import './theme.sass'
import { selectValue as selectUserInfo } from './slice/userInfoSlice';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { useEffect, useState } from 'react';
import _ from 'lodash';
import { clearNavigate, selectValue as selectRouter } from 'slice/routerSlice';
import { clearStorage, local } from 'helper/storage';

function App() {
  console.debug('App')

  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const userInfo = useAppSelector(selectUserInfo)
  const router = useAppSelector(selectRouter)

  const [version] = useState('0.1.0')

  useEffect(() => {
    const localVersion = local('VERSION')
    if (localVersion !== version) {
      clearStorage()
      local('VERSION', version)
      navigate('login')
    } else if (_.isEmpty(userInfo.token)) {
      navigate('login')
    }
  }, [userInfo, navigate, version])

  useEffect(() => {
    if (router.navigate) {
      navigate(router.navigate.path, {
        replace: true,
        state: router.navigate.state
      })
      dispatch(clearNavigate())
    }
  }, [navigate, dispatch, router.navigate])

  return (
    <article className="App">
      <section className='RouterView'>
        <RouterConfig />
      </section>
    </article>
  )
}

export default App;
