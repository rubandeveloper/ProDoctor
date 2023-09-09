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
const Resetpassword = () => {

    const [isLoading, setIsLoading] = useState(false)
    const [warningAlert, setWarningAlert] = useState(false)
    const [apiFailedMessage, setApiFailedMessage] = useState('Invalid Inputs, Please try again with vaild Inputs!')


    const auth_Handler = new Auth_Handler()
    const sysNotification = new SystemNotification()

    const store = useSelector((store) => store)
    const dispatch = useDispatch()
    const { updateState } = new UserAction

    const [password, setPassword] = useState('')
    const [isEyeOpen, setIsEyeOpen] = useState(true)

    const navigate = useNavigate();

    const verifyPassword = (value) => value.length ? true : false

    const VerifyResetPasswordHandler = async (e) => {
        e.preventDefault()



        let { email, pass_reset_code } = store.user

        if (!verifyPassword(password)) {

            // setWarningAlert(true)
            // setApiFailedMessage("Email or password is incorrect. Please enter valid credentials.")

            sysNotification.show("Password is incorrect. Please enter valid credentials.", 2000)

            return
        }

        setIsLoading(true)
        email = email || sessionStorage.getItem('reset-email')
        pass_reset_code = pass_reset_code || sessionStorage.getItem('reset-code')

        let response = await auth_Handler.resetPassword({
            email, code: pass_reset_code, password
        })

        setIsLoading(false)

        if (!response.success || !response.data) {

            // setWarningAlert(true)
            // setApiFailedMessage(`${response.message}, Please enter valid input and try again!`)

            sysNotification.show("Reset Code is incorrect. Please enter valid credentials.", 2000)
            return
        }

        let { redirect_to } = response.data

        dispatch(updateState({
            type: "SET_VERIFYPASS",
            payload: {
                isReseted: true,
                user: { pass_reset_code: null }
            }
        }))

        sessionStorage.removeItem('reset-email')
        sessionStorage.removeItem('reset-code')

        navigate(redirect_to)
    }

    useEffect(() => {
        let { email, pass_reset_code } = store.user

        email = email || sessionStorage.getItem('reset-email')
        pass_reset_code = pass_reset_code || sessionStorage.getItem('reset-code')

        if (!email || !pass_reset_code) navigate('/app/forget-password')

    }, [])


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
        let password_input = document.querySelector('#login-input-password')
        let passwordl_error_msgs = document.querySelector('#password-error-msg')

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
                    <form className="login-left-section" onSubmit={VerifyResetPasswordHandler}>
                        <Link to={'/'} className="login-left-header">
                            <img src={Image.logo} className='login-header-logo' alt="" />
                        </Link>
                        <div className="login-left-content">
                            <div className="login-content-title">Set new password</div>
                            <div className="login-content-desc">Your new password must be different to previously used password.</div>
                            <div className="login-content-inputs">
                                <div className="content-input-item">
                                    <label htmlFor="login-input-name">New Password</label>
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

                            <div className="login-content-button">
                                <button type='submit' className="login-button" id='login-button'>Go to reset</button>
                            </div>

                        </div>
                    </form>

                </div>
            </div>
        </>
    )
}

export default Resetpassword;
