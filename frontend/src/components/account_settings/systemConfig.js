import React, { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import UserAction from '../../redux/action/userAction'
import StoreHandler from '../../redux/StoreHandler'

import Images from '../../assets/Images'
import Icons from '../../assets/Icons'
import Loading from '../Loading'
import AlertPopup from '../AlertPopup'
import hospital_Handler from '../../Handlers/hospital/hospital'
import { CostInput, TextInput, SelectInput, RadioInput } from '../../components/Inputs'

const SystemConfig = () => {

    const [isLoading, setIsLoading] = useState(false)
    const [warningAlert, setWarningAlert] = useState(false)
    const [apiFailedMessage, setApiFailedMessage] = useState('Invalid Inputs, Please try again with vaild Inputs!')

    const [discardChanges, setDiscardChanges] = useState(false)
    const hospital_Handler = new hospital_Handler()

    const store = useSelector((store) => store)
    const dispatch = useDispatch()
    const { updateState } = new UserAction

    const storeHandler = new StoreHandler({
        dataStack: ['hospital'],
        dispatch: dispatch,
        updateState: updateState,
    })

    const LoadStoreData = async () => {
        setIsLoading(true)
        let resolved = await storeHandler.init()
        setIsLoading(false)
    }


    const ishospitalSettings = Object.keys(store.user.hospital).length > 0 && Object.keys(store.user.hospital.settings).length
    const [hospitalSettings, sethospitalSettings] = useState(ishospitalSettings ? store.user.hospital.settings : {})

    const EditView = () => {

        const [theme, setTheme] = useState(ishospitalSettings ? hospitalSettings.ui_theme : '')
        const [temperature, setTemperature] = useState(ishospitalSettings ? hospitalSettings.temperature_format : '')
        const [dateFormat, setDateFormat] = useState(ishospitalSettings ? hospitalSettings.date_format : '')
        const [languages, setLanguages] = useState(ishospitalSettings ? hospitalSettings.language : '')
        const [currency, setCurreny] = useState(ishospitalSettings ? hospitalSettings.currency : '')
        const [currentTypes, setCurrentTypes] = useState([])


        const currency_options = [
            {
                "value": "₹",
                "label": "INR (₹)"
            },
            {
                "value": "$",
                "label": "USD ($)"
            },
            {
                "value": "€",
                "label": "EUR (€)"
            },
        ]
        const languages_options = [
            {
                value: "en_in",
                label: "English (India)"
            }
        ]
        const dateFormat_options = [
            {
                value: "MM/DD/YYYY",
                label: "MM/DD/YYYY"
            },
            {
                value: "DD/MM/YYYY",
                label: "DD/MM/YYYY"
            },
        ]
        const temperature_options = [
            {
                value: "fahrenheit",
                label: "Fahrenheit"
            },
            {
                value: "celsius",
                label: "Celsius"
            },
        ]
        const theme_options = [
            {
                value: "light",
                label: "Light"
            },
            {
                value: "dark",
                label: "Dark"
            },
        ]
        const [inputChanged, setInputChanged] = useState(false)

        const saveEvent = async (e) => {
            e.preventDefault()

            if (!inputChanged) {
                console.log('No Chnages made');
                return
            }

            let userdetials = JSON.parse(localStorage.getItem("userdetials"))

            let updated_data = {
                ui_theme: '1',
                temperature_format: temperature,
                date_format: dateFormat,
                language: languages,
                currency: currency,
                user_id: userdetials.id,
                hospital_id: userdetials.hospital_id
            }

            setIsLoading(true)

            let response = await hospital_Handler.updatehospitalSystemHandler(updated_data)

            if (response.success) {
                LoadStoreData()
                setIsLoading(false)
            }
            else {
                setIsLoading(false)
                setWarningAlert(true)
                setApiFailedMessage(`${response.message}, Please try again!`)
            }
        }

        useEffect(() => {

            let isChanged = false

            // if (theme != ishospitalSettings ? hospitalSettings.ui_theme : undefined) isChanged = true
            if (temperature != ishospitalSettings ? hospitalSettings.temperature_format : undefined) isChanged = true
            if (dateFormat != ishospitalSettings ? hospitalSettings.date_format : undefined) isChanged = true
            if (languages != ishospitalSettings ? hospitalSettings.language : undefined) isChanged = true
            if (currency != ishospitalSettings ? hospitalSettings.currency : undefined) isChanged = true

            setInputChanged(isChanged)

        }, [temperature, dateFormat, languages, currency])

        const handleDiscardChanges = () => {

            // setTheme(ishospitalSettings ? hospitalSettings.ui_theme : '')
            setTemperature(ishospitalSettings ? hospitalSettings.temperature_format : '')
            setDateFormat(ishospitalSettings ? hospitalSettings.date_format : '')
            setLanguages(ishospitalSettings ? hospitalSettings.language : '')
            setCurreny(ishospitalSettings ? hospitalSettings.currency : '')

        }

        return (
            <form className="settingsContent-editview-main" onSubmit={saveEvent}>

                <div className="settingsContent-content-title">System configuration</div>

                <div className="settingsContent-editview-content">

                    <div className="editview-input-items" style={{ display: 'none' }}>
                        <div className="editview-input-item">
                            <SelectInput
                                props={{
                                    id: "profile-theme",
                                    value: theme,
                                    placeholder: '',
                                    readOnly: false,
                                    options: theme_options || [],
                                    setValue: (value, label) => {
                                        // setTheme(value)
                                    },
                                    isStatus: false,
                                    isIcon: false,
                                    isLabel: true,
                                    isRequired: true,
                                    label: "Theme",
                                }}
                            />
                        </div>
                    </div>
                    <div className="editview-input-items">
                        <div className="editview-input-item">
                            <SelectInput
                                props={{
                                    id: "profile-temperatureformat",
                                    value: temperature,
                                    placeholder: '',
                                    readOnly: false,
                                    options: temperature_options || [],
                                    setValue: (value, label) => {
                                        setTemperature(value)
                                    },
                                    isStatus: false,
                                    isIcon: false,
                                    isLabel: true,
                                    isRequired: true,
                                    label: "Temperature Format",
                                }}
                            />
                        </div>
                    </div>
                    <div className="editview-input-items">
                        <div className="editview-input-item">
                            <SelectInput
                                props={{
                                    id: "profile-dateformat",
                                    value: dateFormat,
                                    placeholder: '',
                                    readOnly: false,
                                    options: dateFormat_options || [],
                                    setValue: (value, label) => {
                                        setDateFormat(value)
                                    },
                                    isStatus: false,
                                    isIcon: false,
                                    isLabel: true,
                                    isRequired: true,
                                    label: "Date Format",
                                }}
                            />
                        </div>
                    </div>
                    <div className="editview-input-items">
                        <div className="editview-input-item">
                            <SelectInput
                                props={{
                                    id: "profile-language",
                                    value: languages,
                                    placeholder: '',
                                    readOnly: false,
                                    options: languages_options || [],
                                    setValue: (value, label) => {
                                        setLanguages(value)
                                    },
                                    isStatus: false,
                                    isIcon: false,
                                    isLabel: true,
                                    isRequired: true,
                                    label: "Language",
                                }}
                            />
                        </div>
                    </div>
                    <div className="editview-input-items">
                        <div className="editview-input-item">
                            <SelectInput
                                props={{
                                    id: "profile-currency",
                                    value: currency,
                                    placeholder: '',
                                    readOnly: false,
                                    options: currency_options || [],
                                    setValue: (value, label) => {
                                        setCurreny(value)
                                    },
                                    isStatus: false,
                                    isIcon: false,
                                    isLabel: true,
                                    isRequired: true,
                                    label: "Currency",
                                }}
                            />
                        </div>
                    </div>

                </div>
                <div className={`editview-button-items ${inputChanged ? '' : 'editview-button-items-disabled'}`}>
                    <div className="editview-button-item" onClick={(e) => handleDiscardChanges()}>
                        <span className='label'>Discard Changes</span>
                    </div>
                    <button type='submit' className="editview-button-item button-save">
                        <span
                            className='icon'
                            dangerouslySetInnerHTML={{ __html: Icons.general.save }}
                        ></span>
                        <span className='label' >Save Changes</span>
                    </button>
                </div>
            </form>
        )
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

            <div className='project-settingsContent-main'>
                <EditView />
            </div>
        </>
    )
}

export default SystemConfig;
