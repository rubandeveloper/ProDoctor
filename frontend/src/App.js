import React, { useEffect } from 'react'
import jwt_decode from 'jwt-decode';

/* Redux Setup*/
import { Route, Routes, BrowserRouter, Switch } from 'react-router-dom'
import { useSelector } from 'react-redux'
import store from './redux/store'

import './assets/css/index.css'

import AppIndex from './AppIndex'

import ReverseProxy from './config/reverseProxy'

const App = () => {

  const store = useSelector((store) => store)

  const authToken = localStorage.getItem('authToken')

  return (

    <>
      <BrowserRouter>
        <Routes >
          <Route exact path='/app/*' element={<AppIndex />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App;
