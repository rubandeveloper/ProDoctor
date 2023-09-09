import React, { useEffect } from 'react'
import jwt_decode from 'jwt-decode';

/* Redux Setup*/
import { Route, Routes, BrowserRouter, Switch } from 'react-router-dom'
import { useSelector } from 'react-redux'
import store from './redux/store'

import './assets/css/index.css'

import Login from './Pages/login/login'
import Signup from './Pages/login/signup'
import Forgetpassword from './Pages/login/forgetpassword'
import VerifyResetPassword from './Pages/login/verifyresetpassword'
import ResetPassword from './Pages/login/resetpassword'

import Header from './Pages/header/header'
import Sidebar from './Pages/sidebar/sidebar'
import ProjectMain from './Pages/main'
import Profile from './Pages/profile/Profile'

import AuthTokenValidation from './Handlers/Authendication/AuthTokenValidation'

import ReverseProxy from './config/reverseProxy'

const App = () => {

  const store = useSelector((store) => store)

  const authToken = localStorage.getItem('authToken')
  const hospitalID = ""


  const HandleHospitalRedirection = () => {

    const userdetials = JSON.parse(localStorage.getItem("userdetials"))
    console.log(userdetials, 'userdetials');
  }

  useEffect(() => {

    let sidebar_contanier = document.querySelector('#project-sidebar-main')
    let header_mobile_menu_btn = document.querySelector('#header-mobile-menu-btn')
    let disable_class = "header-mobile-menu-disabled"

    if (sidebar_contanier && header_mobile_menu_btn) {
      header_mobile_menu_btn.classList.remove(disable_class)
    }

    return () => {
      if (header_mobile_menu_btn) {
        header_mobile_menu_btn.classList.remove(disable_class)

        if (!header_mobile_menu_btn.classList.contains(disable_class))
          header_mobile_menu_btn.classList.add(disable_class)
      }
    }
    HandleHospitalRedirection()
  }, [])


  return (

    <>
      <Routes >
        <Route exact path='/signin' element={<Login />}></Route>
        <Route exact path='/signup' element={<Signup />}></Route>
        <Route exact path='/forget-password' element={<Forgetpassword />}></Route>
        <Route exact path='/verify-reset-password' element={<VerifyResetPassword />}></Route>
        <Route exact path='/reset-password' element={<ResetPassword />}></Route>
      </Routes>

      {authToken ?
        <div className='project-main-container'>
          <AuthTokenValidation />

          <Header />
          <div className='project-section-container'>
            <div className='project-content-main'>
              <Routes >
                <Route exact path={`/hospital/:hospitalID/*`} element={<ProjectMain />}></Route>
                <Route exact path={`/my_profile/*`} element={<Profile />}></Route>
              </Routes>

            </div>
          </div>
        </div>
        : <AuthTokenValidation />}
    </>
  )
}

export default App;
