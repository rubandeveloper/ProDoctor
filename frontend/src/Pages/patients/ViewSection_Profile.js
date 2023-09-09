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
import Loading from '../../components/Loading'
import AlertPopup from '../../components/AlertPopup'

import Patients_Handler from '../../Handlers/Patients/Patients'


const ViewSection_Profile = ({ props }) => {

    const patientData = props

    const [isLoading, setIsLoading] = useState(false)
    const [warningAlert, setWarningAlert] = useState(false)
    const [apiFailedMessage, setApiFailedMessage] = useState('Invalid Inputs, Please try again with vaild Inputs!')


    const patients_Handler = new Patients_Handler()

    const navigate = useNavigate();
    const { hospitalID, patientId } = useParams();

    const [id, setId] = useState('')
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [bloodGroup, setBloodGroup] = useState('')
    const [weight, setWeight] = useState('')
    const [height, setHeight] = useState('')
    const [patientID, setPatientID] = useState('')
    const [gender, setGender] = useState('')
    const [status, setStatus] = useState('')
    const [address, setAddress] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [pincode, setPincode] = useState('')
    const [birthdate, setBirthdate] = useState('')
    const [age, setAge] = useState('')
    const [description, setDescription] = useState('')
    const [profileImg_url, setProfileImg_url] = useState('')

    const [deleteItemId, setDeleteItem] = useState(null)
    const [deleteItemAlert, setDeleteItemAlert] = useState(false)

    let SetPatientDatas = (patient) => {

        if (!patient || !Object.keys(patient).length || !patient._id) return

        setId(patient._id || '')
        setName(patient.name || '')
        setPatientID(patient.patientID || '')
        setStatus(patient.status || '')
        setBloodGroup(patient.bloodgroup || '')
        setAddress(patient.address || '')
        setProfileImg_url(patient.profile_img ? `data:image/png;base64,${patient.profile_img}` : '')
        setCity(patient.city || '')
        setState(patient.state || '')
        setPincode(patient.pincode || '')
        setDescription(patient.description || '')
        setAge(patient.age || '')
        setGender(patient.gender || '')
        setPhone(patient.phone || '')
        setEmail(patient.email || '')
        setWeight(patient.weight || '')
        setHeight(patient.height || '')
        setBirthdate(patient.birthdate || '')
    }

    useEffect(() => {

        SetPatientDatas(patientData)

    }, [])

    const HandleDeleteItem = async (item) => {

        setDeleteItem(id)
        setDeleteItemAlert(true)
    }

    const HandleWarningConfirm = (confirmation) => {

        setWarningAlert(false)
    }

    const HandleDeleteConfirmItem = async (id, confirmation) => {

        if (!confirmation) {

            setDeleteItem(null)
            setDeleteItemAlert(false)

            return
        }


        if (!id) {
            setDeleteItem(null)
            setDeleteItemAlert(false)

            return
        }

        let userdetials = JSON.parse(localStorage.getItem("userdetials"))

        let updated_data = {

            id: id,
            hospital_id: userdetials.hospital_id,
            user_id: userdetials.id,
        }

        setIsLoading(true)

        let response = await patients_Handler.deletePatientHandler(updated_data)

        if (response.success) {
            setIsLoading(false)
            navigate(`/app/hospital/${hospitalID}/patients`)
        }
        else {

            setIsLoading(false)
            setWarningAlert(true)
            setApiFailedMessage(`${response.message}, Please try again!`)

        }

        setDeleteItem(null)
        setDeleteItemAlert(false)

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

            {deleteItemAlert ?

                <AlertPopup
                    props={{
                        type: "delete",
                        actionBtnOption: { icon: Icons.general.btn_delete, label: "Yes, Delete" },
                        heading: "Delete patient",
                        message: "Are you sure you want to do change?",
                        callback: (confirmation) => HandleDeleteConfirmItem(deleteItemId, confirmation)
                    }} />

                : null}



            <div className="patientbrief-section-content" >
                <div className="section-profile-top">
                    <div className="profile-top-left">
                        <img src={profileImg_url || Images.User} alt="" />
                    </div>
                    <div className="profile-top-right">
                        <div className="right-detials">
                            <div className="right-detials-title">{name}</div>
                            <div className="right-detials-id">{patientID}</div>
                        </div>
                        <div className="right-buttons">
                            <div
                                className="right-btn btn-edit"
                                onClick={(e) => {
                                    navigate(`/app/hospital/${hospitalID}/patients/${patientID}/edit`)
                                }}
                            >
                                <div
                                    className="icon"
                                    dangerouslySetInnerHTML={{ __html: Icons.general.edit }}
                                ></div>
                                <div className="label">Edit</div>
                            </div>
                            <div
                                className="right-btn btn-delete"
                                onClick={async (e) => await HandleDeleteItem()}
                            >
                                <div
                                    className="icon"
                                    dangerouslySetInnerHTML={{ __html: Icons.general.delete }}
                                ></div>
                                <div className="label">Delete</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="section-profile-detials">
                    <div className="profile-detials-tab">

                        <div
                            className="profile-detials-tab-item"
                            data-label="Patient ID:"
                        >
                            {patientID}
                        </div>
                        <div
                            className="profile-detials-tab-item"
                            data-label="Name:"
                        >
                            {name}
                        </div>
                        <div
                            className="profile-detials-tab-item"
                            data-label="Mobile Number:"
                        >
                            {phone}
                        </div>
                        <div
                            className="profile-detials-tab-item"
                            data-label="Email:"
                        >
                            {email}
                        </div>
                        <div
                            className="profile-detials-tab-item"
                            data-label="Blood Group:"
                        >
                            {bloodGroup}
                        </div>
                        <div
                            className="profile-detials-tab-item"
                            data-label="Address:"
                        >
                            {address}
                        </div>
                        <div
                            className="profile-detials-tab-item"
                            data-label="City:"
                        >
                            {city}
                        </div>
                        <div
                            className="profile-detials-tab-item"
                            data-label="State:"
                        >
                            {state}
                        </div>
                        <div
                            className="profile-detials-tab-item"
                            data-label="Pincode:"
                        >
                            {pincode}
                        </div>

                    </div>
                    <div className="profile-detials-tab">
                        <div
                            className="profile-detials-tab-item"
                            data-label="D.O.B:"
                        >
                            {birthdate}
                        </div>
                        <div
                            className="profile-detials-tab-item"
                            data-label="Age:"
                        >
                            {age}
                        </div>
                        <div
                            className="profile-detials-tab-item"
                            data-label="Gender:"
                            style={{ textTransform: "capitalize" }}
                        >
                            {gender}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ViewSection_Profile;