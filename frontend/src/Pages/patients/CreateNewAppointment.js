import React, { useEffect, useState, useRef } from 'react'
import { Route, Routes, BrowserRouter, Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import UserAction from '../../redux/action/userAction'
import StoreHandler from '../../redux/StoreHandler'
import ReactQuill from 'react-quill';

import Images from '../../assets/Images'
import Icons from '../../assets/Icons'
import Utils from '../../utils'
import { CostInput, DateTimeInput, TextInput, SelectInput, RadioInput } from '../../components/Inputs'
import WorkSheet from '../../components/worksheets/worksheets'
import Loading from '../../components/Loading'
import AlertPopup from '../../components/AlertPopup'

import Patients_Handler from '../../Handlers/Patients/Patients'


const CreateNewAppointment = () => {

    const [isLoading, setIsLoading] = useState(false)
    const [warningAlert, setWarningAlert] = useState(false)
    const [apiFailedMessage, setApiFailedMessage] = useState('Invalid Inputs, Please try again with vaild Inputs!')
    const navigate = useNavigate();
    const { hospitalID, patientId } = useParams();

    const patients_Handler = new Patients_Handler()


    const [appointmentID, setAppointmentID] = useState('')
    const [diagnosis, setDiagnosis] = useState('')
    const [date, setDate] = useState('')
    const [description, setDescription] = useState('')
    const [additionalNotes, setAdditionalNotes] = useState(false);



    const HandlePopupSubmit = async (e) => {
        e.preventDefault()

        let userdetials = JSON.parse(localStorage.getItem("userdetials"))

        let updated_data = {
            date,
            diagnosis,
            description,
            patient_id: patientId,
            user_id: userdetials.id,
            hospital_id: userdetials.hospital_id
        }

        setIsLoading(true)

        let response = await patients_Handler.createAppointmentHandler(updated_data)

        if (response.success) {
            setIsLoading(false)
        }
        else {
            setIsLoading(false)
            setWarningAlert(true)
            setApiFailedMessage(`${response.message}, Please try again!`)
        }
        navigate(`/app/hospital/${hospitalID}/patients/${patientId}/visits`)
    }

    const Popup_Header = () => {

        return (
            <div className="side-popup-header">
                <div className="header-item-select">
                    <div className="header-item-select-content">
                        <span className="icon" dangerouslySetInnerHTML={{ __html: Icons.general.fee }}></span>
                        <div className="label">Add Appointment</div>

                    </div>
                </div>
                <div
                    className="header-item-close"
                    onClick={(e) => {
                        navigate(`/app/hospital/${hospitalID}/patients/${patientId}/visits`)
                    }}
                    dangerouslySetInnerHTML={{ __html: Icons.general.close }}
                ></div>
            </div>
        );
    };
    const Popup_Footer = () => {


        return (
            <div className="sidebar-popup-footer">
                <div className="footer-item action-items">
                    <div className="action-preview">
                    </div>
                    <button
                        className="action-btn"
                        type='submit'
                    >
                        <div className="icon" dangerouslySetInnerHTML={{ __html: Icons.general.add_btn }}></div>
                        <div className="label">Add Appointment</div>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="popup-container-main popup-container-center">
            <div className="popup-block-ui"></div>
            <form className="side-popup-container" onSubmit={(e) => {
                HandlePopupSubmit(e)
            }}>
                <Popup_Header />

                <div className="sidebar-popup-content">
                    <div className="content-section">

                        <div className="content-item">
                            <DateTimeInput
                                props={{
                                    id: "patient-visit-date",
                                    value: date,
                                    placeholder: '',
                                    setValue: (value) => setDate(value),
                                    isIcon: false,
                                    isLabel: true,
                                    isRequired: true,
                                    label: "Date",
                                }}
                            />
                        </div>

                        <div className="content-item">
                            <TextInput
                                props={{
                                    id: "patient-visit-diagnosis",
                                    value: diagnosis,
                                    placeholder: '',
                                    setValue: (value) => setDiagnosis(value),
                                    isIcon: false,
                                    isLabel: true,
                                    isRequired: true,
                                    label: "Diagnosis",
                                }}
                            />
                        </div>

                        <div className="content-section">
                            <div className="content-item">
                                <div id="addcategory-description" className={`additional-item ${additionalNotes ? 'additional-item-active' : ''}`}>
                                    <div className="head" onClick={(e) => setAdditionalNotes(!additionalNotes)}>
                                        <div className="icon" dangerouslySetInnerHTML={{ __html: Icons.general.description }}></div>
                                        <div className="label">Description</div>
                                    </div>
                                    <div className="item-expanded">
                                        <textarea
                                            id=""
                                            cols="30"
                                            rows="10"
                                            value={description}
                                            onChange={(value) => setDescription(value.target.value)}
                                        ></textarea>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <Popup_Footer />
            </form>
        </div>
    )

}
export default CreateNewAppointment;