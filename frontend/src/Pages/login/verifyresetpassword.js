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
const VerifyResetpassword = () => {

    const [isLoading, setIsLoading] = useState(false)
    const [warningAlert, setWarningAlert] = useState(false)
    const [apiFailedMessage, setApiFailedMessage] = useState('Invalid Inputs, Please try again with vaild Inputs!')



    const auth_Handler = new Auth_Handler()
    const sysNotification = new SystemNotification()

    const store = useSelector((store) => store)
    const dispatch = useDispatch()
    const { updateState } = new UserAction

    const [code, setCode] = useState('')
    const [lastCode, setLastCode] = useState('')

    const navigate = useNavigate();

    const verifyNumber = (value) => (/^[0-9]+$/.test(value))

    console.log();

    const VerifyResetPasswordHandler = async (e) => {
        e.preventDefault()


        if (!verifyNumber(code) || code.length != 6) {

            // setWarningAlert(true)
            // setApiFailedMessage("Invalid inputs. Please enter valid credentials.")

            sysNotification.show("Invalid inputs. Please enter valid credentials.", 2000)
            return
        }
        setIsLoading(true)

        let { email } = store.user

        email = email || sessionStorage.getItem('reset-email')

        let response = await auth_Handler.verifyResetCode({
            email, code
        })

        setIsLoading(false)

        if (!response.success || !response.data) {

            // setWarningAlert(true)
            // setApiFailedMessage(`${response.message}, Please enter valid input and try again!`)

            sysNotification.show("Email is invalid. Please enter valid credentials.", 2000)
            return
        }

        let { redirect_to } = response.data

        dispatch(updateState({
            type: "SET_VERIFYPASS",
            payload: {
                isResetCodeVerified: true,
                isReseted: false,
                user: { pass_reset_code: code }
            }
        }))

        sessionStorage.setItem('reset-code', code)

        navigate(redirect_to)
    }

    useEffect(() => {
        let { email } = store.user

        email = email || sessionStorage.getItem('reset-email')

        if (!email) navigate('/app/forget-password')

    }, [])

    const CodeInoutEvent = (e) => {

        let code_input = document.querySelector('#login-input-code')
        let code_error_msgs = document.querySelector('#code-error-msg')
        let login_button = document.querySelector('#login-button')

        const value = e.target.value;

        if (!value) {

            code_error_msgs.innerHTML = `Please fill in the recovery code`
            code_error_msgs.style.display = 'flex'
            code_input.classList.add('input-error-active')

            if (!login_button.classList.contains('content-submit-btn-disable')) login_button.classList.add('content-submit-btn-disable')

        }
        else {
            code_error_msgs.innerHTML = ``
            code_error_msgs.style.display = 'none'
            code_input.classList.remove('input-error-active')

            if (login_button.classList.contains('content-submit-btn-disable')) login_button.classList.remove('content-submit-btn-disable')
        }

        if (!value) {
            setLastCode('')
            setCode('')
            code_input.value = ''
        }

        else if (verifyNumber(value)) {
            setLastCode(value)
            setCode(value)
        }

        else {
            code_input.value = lastCode
            setCode(lastCode)
        }
    }

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
                            <div className="login-content-title">Check your email</div>
                            <div className="login-content-desc">We have sent a password recovery link to your email</div>
                            <div className="login-content-inputs">
                                <div className="content-input-item">
                                    <label htmlFor="login-input-name">Password recovery code</label>
                                    <input
                                        id="login-input-code"
                                        type='text'
                                        value={code}
                                        required={true}
                                        onInput={(e) => CodeInoutEvent(e)}
                                        placeholder='Enter confirmation code'
                                    />
                                    <span className='project-login-email-error-msgs' id='code-error-msg'></span>
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

export default VerifyResetpassword;
