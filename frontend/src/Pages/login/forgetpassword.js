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

const Forgetpassword = () => {

    const [isLoading, setIsLoading] = useState(false)
    const [warningAlert, setWarningAlert] = useState(false)
    const [apiFailedMessage, setApiFailedMessage] = useState('Invalid Inputs, Please try again with vaild Inputs!')


    const auth_Handler = new Auth_Handler()
    const sysNotification = new SystemNotification()

    const store = useSelector((store) => store)
    const dispatch = useDispatch()
    const { updateState } = new UserAction

    const [email, setEmail] = useState('')

    const navigate = useNavigate();

    const verifyEmail = (value) => (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value))

    const ForgetpasswordHandler = async (e) => {
        e.preventDefault()


        if (!verifyEmail(email)) {

            // setWarningAlert(true)
            // setApiFailedMessage("Email is incorrect. Please enter valid credentials.")
            sysNotification.show("Email is incorrect. Please enter valid credentials.", 2000)
            return
        }
        setIsLoading(true)


        let response = await auth_Handler.forgetPassword({
            email
        })

        setIsLoading(false)

        if (!response.success || !response.data) {

            // setWarningAlert(true)
            // setApiFailedMessage(`${response.message}, Please enter valid input and try again!`)
            sysNotification.show("Email is incorrect. Please enter valid credentials.", 2000)
            return
        }

        let { redirect_to } = response.data

        dispatch(updateState({
            type: "SET_RESETPASS",
            payload: {
                isResetCodeVerified: false,
                user: { email }
            }
        }))

        sessionStorage.setItem('reset-email', email)

        navigate(redirect_to)
    }

    const InputErrorHandler = () => {

        let login_button = document.querySelector('#login-button')
        let email_input = document.querySelector('#login-input-email')
        let email_error_msgs = document.querySelector('#email-error-msg')
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

    }

    useEffect(() => {
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
                    <form className="login-left-section" onSubmit={ForgetpasswordHandler}>
                        <Link to={'/'} className="login-left-header">
                            <img src={Image.logo} className='login-header-logo' alt="" />
                        </Link>
                        <div className="login-left-content">
                            <div className="login-content-title">Forgot your password?</div>
                            <div className="login-content-desc">Enter the email address associated with your account and we’ll send you a link to reset your password</div>
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
                            </div>

                            <div className="login-content-button">
                                <button type='submit' className="login-button content-submit-btn-disable" id='login-button'>Send</button>
                            </div>

                        </div>
                    </form>

                </div>
            </div>
        </>
    )
}

export default Forgetpassword;
