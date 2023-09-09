import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'

/*Redux*/
import { useSelector, useDispatch } from 'react-redux'
import UserAction from '../../redux/action/userAction'

import User_Handler from '../Users/User'

import jwt_decode from 'jwt-decode';

import AlertPopup from '../../components/AlertPopup'
import Icons from '../../assets/Icons'

const AuthTokenValidation = () => {

    const [warningAlert, setWarningAlert] = useState(false)
    const [apiFailedMessage, setApiFailedMessage] = useState('Invalid Inputs, Please try again with vaild Inputs!')


    const user_Handler = new User_Handler()

    const navigate = useNavigate();

    const store = useSelector((store) => store)
    const dispatch = useDispatch()

    const { updateState } = new UserAction

    const setUserDetials = async () => {

        let userdetials = JSON.parse(localStorage.getItem("userdetials"))

        let response = await user_Handler.getProfileHandler({ user_id: userdetials.id })

        if (response && response.success) {

            dispatch(updateState({
                type: "SET_USER",
                payload: { user: response.data }
            }))

            // localStorage.setItem("userdetials", JSON.stringify(response.data))

        } else {
            setWarningAlert(true)
            setApiFailedMessage(`${response.message}, Please try again!`)
        }

    }

    useEffect(() => {

        const authToken = localStorage.getItem('authToken');

        const url = window.location.pathname
        const Auth_Paths = ['/signin', '/signup', '/forget-password', '/verify-reset-password', '/reset-password']


        const checkURLValid = (url) => {
            for (const itm of Auth_Paths) if (url.includes(itm)) return true
            return false
        }

        if (authToken && checkURLValid(url)) {
            navigate('/app/hospital');
            return
        }

        if (!authToken && checkURLValid(url)) {
            return
        }

        if (!authToken) {

            dispatch(updateState({
                type: "SET_USER",
                payload: { user: {} }
            }))

            navigate('/app/signin');
            return;
        }

        setUserDetials()

        try {
            const decoded = jwt_decode(authToken);
            const currentTimestamp = Math.floor(Date.now() / 1000);

            if (decoded.exp < currentTimestamp) {

                localStorage.removeItem('authToken');

                navigate('/app/signin');
            }
        } catch (error) {
            console.error('Error decoding authToken:', error);
        }
    }, []);


    const HandleWarningConfirm = (confirmation) => {

        setWarningAlert(false)
    }


    return (
        <>
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
        </>
    );
};

export default AuthTokenValidation;