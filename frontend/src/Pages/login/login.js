import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

/*Redux*/
import { useSelector, useDispatch } from 'react-redux'
import UserAction from '../../redux/action/userAction'

import Auth_Handler from '../../Handlers/Authendication/Authendication'


import Loading from '../../components/Loading'
import AlertPopup from '../../components/AlertPopup'

import Image from '../../assets/Images'
import Icons from '../../assets/Icons'

import SystemNotification from '../ToastMsg'

const Login = () => {

    const [isLoading, setIsLoading] = useState(false)
    const [warningAlert, setWarningAlert] = useState(false)
    const [apiFailedMessage, setApiFailedMessage] = useState('Invalid Inputs, Please try again with vaild Inputs!')


    const auth_Handler = new Auth_Handler()
    const sysNotification = new SystemNotification()

    const store = useSelector((store) => store)
    const dispatch = useDispatch()
    const { updateState } = new UserAction

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isEyeOpen, setIsEyeOpen] = useState(true)
    const navigate = useNavigate();

    const verifyEmail = (value) => (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value))
    const verifyPassword = (value) => value.length ? true : false

    const LoginHandler = async (e) => {
        e.preventDefault()

        if (!verifyEmail(email) || !verifyPassword(password)) {

            // setWarningAlert(true)
            // setApiFailedMessage("Email or password is incorrect. Please enter valid credentials.")

            sysNotification.show("Email or password is incorrect. Please enter valid credentials.", 2000)

            return
        }

        setIsLoading(true)


        let response = await auth_Handler.signin({
            email, password
        })

        setIsLoading(false)

        if (!response.success || !response.data) {

            // setWarningAlert(true)
            // setApiFailedMessage(`Email or password is incorrect, Please enter valid input and try again!`)

            sysNotification.show("Email or password is incorrect. Please enter valid credentials.", 2000)
            return
        }

        let { redirect_to, authToken, user } = response.data

        localStorage.setItem('authToken', authToken)
        localStorage.setItem('userdetials', JSON.stringify(user))

        dispatch(updateState({
            type: "SET_USER",
            payload: { user }
        }))

        navigate(redirect_to)
    }

    const EyeButtonHandler = (e) => {

        let btn_active_class = "input-password-eye-active"
        let btn_element = document.querySelector('#login-input-eyebtn')
        let password_element = document.querySelector('#login-input-password')

        btn_element.classList.toggle(btn_active_class)

        setIsEyeOpen(!isEyeOpen)

        if (isEyeOpen) password_element.type = "text"
        else password_element.type = "password"

        updateEyeBtnIcon(isEyeOpen)
    }

    const updateEyeBtnIcon = (isOpen) => {
        let eye_element = document.querySelector('#login-input-eyebtn')

        if (isOpen) eye_element.innerHTML = Icons.general.eye_open
        else eye_element.innerHTML = Icons.general.eye_close
    }

    const InputErrorHandler = () => {

        let login_button = document.querySelector('#login-button')
        let email_input = document.querySelector('#login-input-email')
        let email_error_msgs = document.querySelector('#email-error-msg')
        let password_input = document.querySelector('#login-input-password')
        let passwordl_error_msgs = document.querySelector('#password-error-msg')

        email_input.addEventListener('change', (e) => {

            if (!verifyEmail(email_input.value)) {


                email_error_msgs.innerHTML = `Please enter a valid email.`
                email_error_msgs.style.display = 'flex'
                email_input.classList.add('input-error-active')

                if (!login_button.classList.contains('content-submit-btn-disable')) login_button.classList.add('content-submit-btn-disable')

            }
            else {
                email_error_msgs.innerHTML = ``
                email_error_msgs.style.display = 'none'
                email_input.classList.remove('input-error-active')

                if (login_button.classList.contains('content-submit-btn-disable')) login_button.classList.remove('content-submit-btn-disable')
            }

        })
        password_input.addEventListener('change', (e) => {

            if (!verifyPassword(password_input.value)) {

                passwordl_error_msgs.innerHTML = `Please fill in the password.`
                passwordl_error_msgs.style.display = 'flex'
                password_input.classList.add('input-error-active')

                if (!login_button.classList.contains('content-submit-btn-disable')) login_button.classList.add('content-submit-btn-disable')

            }
            else {

                passwordl_error_msgs.innerHTML = ``
                passwordl_error_msgs.style.display = 'none'
                password_input.classList.remove('input-error-active')

                if (login_button.classList.contains('content-submit-btn-disable')) login_button.classList.remove('content-submit-btn-disable')
            }

        })
    }

    useEffect(() => {
        updateEyeBtnIcon(false)
        InputErrorHandler()
    }, [])

    const HandleWarningConfirm = (confirmation) => {

        setWarningAlert(false)
    }

    return (
        <>
            {isLoading ?

                <Loading
                    props={{
                        isMainLogo: false,
                        isLabel: true
                    }} />

                : null}

            {warningAlert ?

                <AlertPopup
                    props={{
                        type: "delete",
                        actionBtnOption: { icon: Icons.general.warning, label: "Yea, Ok" },
                        heading: "Something went Wrong!",
                        message: apiFailedMessage || "Invalid Inputs, Please try again with vaild Inputs!",
                        callback: (confirmation) => HandleWarningConfirm(confirmation)
                    }} />

                : null}


            <div className='project-login-main' id='project-login-main'>
                <div className='project-login-bg'></div>
                <div className="project-login-content">
                    <div className="login-right-section">
                        <img src={Image.login_banner} alt="" />
                    </div>
                    <form className="login-left-section" onSubmit={LoginHandler}>
                        <Link to={'/'} className="login-left-header">
                            <img src={Image.logo} className='login-header-logo' alt="" />
                        </Link>
                        <div className="login-left-content">
                            <div className="login-content-title">Sign in to ProDoctor</div>
                            <div className="login-content-desc">Enter your Login detials below</div>
                            <div className="login-content-inputs">
                                <div className="content-input-item">
                                    <label htmlFor="login-input-name">Email</label>
                                    <input
                                        id="login-input-email"
                                        type='text'
                                        value={email}
                                        required={true}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder='Provide your email'
                                    />
                                    <span className='project-login-email-error-msgs' id='email-error-msg'></span>
                                </div>
                                <div className="content-input-item">
                                    <label htmlFor="login-input-name">Password</label>
                                    <input
                                        id="login-input-password"
                                        type='password'
                                        required={true}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder='Provide your password'
                                    />
                                    <span onClick={(e) => EyeButtonHandler(e)} id='login-input-eyebtn' className='input-password-eye'></span>
                                    <span className='project-login-email-error-msgs' id='password-error-msg'></span>
                                </div>
                            </div>
                            <div className="login-content-forgetpass">
                                <Link to={'/app/forget-password'} className='login-navigate-span'>Forget Password?</Link>
                            </div>
                            <div className="login-content-button">
                                <button type='submit' className="login-button content-submit-btn-disable" id='login-button'>Login</button>
                            </div>
                            <div className="login-content-signup">
                                Don't have an account? <Link to={'/app/signup'} className='login-navigate-span' >Sign Up</Link>
                            </div>
                        </div>
                    </form>

                </div>
            </div>
        </>
    )
}

export default Login;
