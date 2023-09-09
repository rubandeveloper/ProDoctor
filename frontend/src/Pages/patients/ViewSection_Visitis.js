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


const ViewSection_Visitis = ({ props }) => {

    const patientData = props

    const [isLoading, setIsLoading] = useState(false)
    const [warningAlert, setWarningAlert] = useState(false)
    const [apiFailedMessage, setApiFailedMessage] = useState('Invalid Inputs, Please try again with vaild Inputs!')


    const patients_Handler = new Patients_Handler()

    const navigate = useNavigate();
    const { hospitalID, patientId } = useParams();

    const [headers, setHeaders] = useState([

        {
            label: "Appoint. ID",
            id: "appointment_id",
            isID: true,
            dropdown: true,
            isLeft: true,
            active: true,
        },
        {
            label: "Date",
            id: "date",
            dropdown: true,
            isLeft: true,
            active: true,
        },
        {
            label: "Diagnosis",
            id: "diagnosis",
            active: true,
        },
        {
            label: "Status",
            id: "status",
            isBox: true,
            active: true,
        },
        {
            label: "Temperature",
            id: "temperature",
            isBox: true,
            active: true,
        },
        {
            label: "Blood Pressure",
            id: "bloodPressure",
            isBox: true,
            active: true,
        },
        {
            label: "Blood Sugar",
            id: "bloodSugar",
            isBox: true,
            active: true,
        },

        {
            label: "Action",
            active: true,
            id: "action",
            options: [
                {
                    id: 'edit-item',
                    label: 'Eit',
                    icon: Icons.general.edit,
                    callback: (e) => { }
                },
                {
                    id: 'delete-item',
                    label: 'Delete',
                    icon: Icons.general.delete,
                    callback: (e) => { }
                },
            ]
        },
    ])

    const [Filters, setFilters] = useState({
        left: [
            {
                id: "projectList-worksheetfilter-search",
                isSearchBar: true,
                type: "input",
                isDropDownContainer: false,
                placeholder: "Search by ID or diagnosis",
                dropDownOptions: [],
                callback: (val) => { },
                isIcon: true,
                icon: Icons.general.search,
                isLabel: false,
                label: "",
                isIconLeft: false
            },
            {
                id: "worksheetfilter-status",
                isSearchBar: false,
                type: "button",
                isDropDownContainer: true,
                placeholder: "",
                dropDownOptions: [
                    {
                        type: "option",
                        label: "Select all",
                        id: 'opt-select-all',
                        value: false,
                    },
                    {
                        type: "label",
                        label: "By status",
                        callback: (val) => { }
                    },
                    {
                        type: "option",
                        label: "Waiting",
                        id: "waiting",
                        value: false,
                    },
                    {
                        type: "option",
                        label: "Completed",
                        id: "completed",
                        value: false,
                    },
                ],
                callback: (val) => { },
                isIcon: true,
                icon: Icons.general.dropdown_arrow,
                isLabel: true,
                label: "Filter by Status",
                isIconLeft: false
            },
        ],
        right: []
    })


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

    const [deleteItemId, setDeleteItem] = useState(null)
    const [deleteItemAlert, setDeleteItemAlert] = useState(false)

    const [existItemData, setExistItemData] = useState({})
    const [appointments, setAppointments] = useState([])

    let SetPatientDatas = (patient) => {

        if (!patient || !Object.keys(patient).length || !patient._id) return

        setId(patient._id || '')
        setName(patient.name || '')
        setPatientID(patient.patientID || '')
        setStatus(patient.status || '')
        setBloodGroup(patient.bloodgroup || '')
        setAddress(patient.address || '')
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

    const LoadAppointments = async () => {

        let userdetials = JSON.parse(localStorage.getItem("userdetials"))

        let update_data = {
            patient_id: patientData.patientID,
            hospital_id: userdetials.hospital_id,
            user_id: userdetials.id,
        }
        setIsLoading(true)

        let response = await patients_Handler.getAppointmentsHandler(update_data)

        if (response.success && response.data) {

            setIsLoading(false)

            if (!response.data) return

            if (Array.isArray(response.data)) {

                let appointments = response.data.map((data, i) => {

                    return {
                        id: data._id,
                        appointment_id: data.appointmentID,
                        parentId: null,
                        hasAction: true,
                        order: 1,
                        path: [],
                        itemChildren: [],
                        patient_id: data.patient_id,
                        date: data.date,
                        temperature: data.temperature,
                        bloodPressure: data.bloodPressure,
                        bloodSugar: data.bloodSugar,
                        diagnosis: data.diagnosis,
                        description: data.description,
                        isSelected: false,
                        isSelectOption: true,
                        status: data.status,
                        created_at: data.created_at ? Utils.getLocalFullDateBYFormat(data.created_at, '/', 1) : 'N/A',
                        updated_at: data.created_at ? Utils.getLocalFullDateBYFormat(data.updated_at, '/', 1) : 'N/A',
                        type: "ITEM",
                        rawdata: data
                    }
                });
                SetPatientDatas(patientData)
                setAppointments(appointments)

            }

        }
        else {
            setIsLoading(false)
            setWarningAlert(true)
            setApiFailedMessage(`${response.message}, Please try again!`)
        }

    }

    useEffect(() => {

        LoadAppointments()

    }, [])


    const HandleWarningConfirm = (confirmation) => {

        setWarningAlert(false)
    }

    const HandleAddAppointment = () => {

        navigate(`/app/hospital/${hospitalID}/patients/${patientID}/visits/create`)
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
            patient_id: patientData._id,
            hospital_id: userdetials.hospital_id,
            user_id: userdetials.id,
        }

        setIsLoading(true)

        let response = await patients_Handler.deleteAppointmentHandler(updated_data)

        if (response.success) {
            await LoadAppointments()
            setIsLoading(false)
        }
        else {

            setIsLoading(false)
            setWarningAlert(true)
            setApiFailedMessage(`${response.message}, Please try again!`)

        }

        setDeleteItem(null)
        setDeleteItemAlert(false)

    }

    const HandleDeleteItem = async (item) => {

        setDeleteItem(item.id)
        setDeleteItemAlert(true)
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


                <div className="patientbrief-section-visits-header">
                    <div className="header-left"></div>
                    <div className="header-right">
                        <div className="header-buttons">
                            <div
                                className="header-btn"
                                onClick={(e) => HandleAddAppointment()}
                            >
                                <div
                                    className="icon"
                                    dangerouslySetInnerHTML={{ __html: Icons.general.add_active }}
                                ></div>
                                <div className="label">Add Appointment</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="patientbrief-section-visits-items">
                    <WorkSheet props={{
                        Header: headers,
                        Items: appointments,
                        isStepper: false,
                        isPaggination: true,
                        isFilters: true,
                        Filters: Filters,
                        openSidebar: (item, type) => {

                            setExistItemData(item)

                            let appointmentID = item.appointment_id


                            navigate(`/app/hospital/${hospitalID}/patients/${patientID}/visits/${appointmentID}/view`)
                        },
                        openEditView: (item, type) => {

                            setExistItemData(item)
                            let appointmentID = item.appointment_id

                            navigate(`/app/hospital/${hospitalID}/patients/${patientID}/visits/${appointmentID}/edit`)
                        },
                        deleteOption: async (item) => await HandleDeleteItem(item)
                    }} />
                </div>
            </div>
        </>
    )
}

export default ViewSection_Visitis;