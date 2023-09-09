import React, { useEffect, useState, useRef } from 'react'
import { Route, Routes, BrowserRouter, Link, useNavigate, useParams } from 'react-router-dom'
import ReactQuill from 'react-quill';
import { useSelector, useDispatch } from 'react-redux'


import Images from '../../assets/Images'
import Icons from '../../assets/Icons'
import Utils from '../../utils'

import { CostInput, TextInput, SelectInput, RadioInput } from '../../components/Inputs'
import WorkSheet from '../../components/worksheets/worksheets'
import AlertPopup from '../../components/AlertPopup'
import Loading from '../../components/Loading'

import Patients_Handler from '../../Handlers/Patients/Patients'

const Patients = () => {

    const [isLoading, setIsLoading] = useState(false)

    const [warningAlert, setWarningAlert] = useState(false)
    const [apiFailedMessage, setApiFailedMessage] = useState('Invalid Inputs, Please try again with vaild Inputs!')

    const patients_Handler = new Patients_Handler()

    const { hospitalID } = useParams();
    const navigate = useNavigate();

    const store = useSelector((store) => store)

    const [deleteItemId, setDeleteItem] = useState(null)
    const [deleteItemType, setDeleteItemType] = useState(null)
    const [deleteItemAlert, setDeleteItemAlert] = useState(false)

    const [headers, setHeaders] = useState([

        {
            label: "Patient ID",
            id: "patient_id",
            isID: true,
            dropdown: true,
            isLeft: true,
            active: true,
        },
        {
            label: "Patient Name",
            id: "name",
            dropdown: true,
            isLeft: true,
            active: true,
        },
        {
            label: "Birth Date",
            id: "birthdate",
            active: true,
        },
        {
            label: "Status",
            id: "status",
            isBox: true,
            active: true,
        },

        {
            label: "Created",
            active: true,
            id: "created_at"
        },

        {
            label: "Last updated",
            active: true,
            id: "updated_at"
        },
        {
            label: "Action",
            active: true,
            id: "action",
            options: [
                {
                    id: 'edit-item',
                    label: 'Edit',
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

    const [items, setItems] = useState([])
    const [response, setResponse] = useState({})
    const [groupOptions, setGroupOptions] = useState([])

    const [patientUpdatedTrigger, setPatientUpdatedTrigger] = useState(false)

    const [Filters, setFilters] = useState({
        left: [
            {
                id: "projectList-worksheetfilter-search",
                isSearchBar: true,
                type: "input",
                isDropDownContainer: false,
                placeholder: "Search by name",
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
                        label: "Pending",
                        id: "pending",
                        value: false,
                    },
                    {
                        type: "option",
                        label: "Approved",
                        id: "approve",
                        value: false,
                    },
                    {
                        type: "option",
                        label: "Rejected",
                        id: "reject",
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

    const HandleUpdateStatus = async (status, proposal) => {

        if (!proposal) return

        let userdetials = JSON.parse(localStorage.getItem("userdetials"))

        let updated_data = {

            id: proposal.id,
            status: status,
            hospitalID: hospitalID,
            hospital_id: userdetials.hospital_id,
            user_id: userdetials.id,
        }

        setIsLoading(true)
        let response = {
            success: true
        }

        if (response.success) {
            await LoadPatients()
            setIsLoading(false)
        }
        else {

            setIsLoading(false)
            setWarningAlert(true)
            setApiFailedMessage(`${response.message}, Please try again!`)
        }
    }

    const HandleDeleteItem = async (item) => {

        setDeleteItem(item.id)
        setDeleteItemType(item.type)
        setDeleteItemAlert(true)
    }

    const HandleDeleteConfirmItem = async (id, type, confirmation) => {

        if (!confirmation) {

            setDeleteItem(null)
            setDeleteItemType(null)
            setDeleteItemAlert(false)

            return
        }


        if (!id) {
            setDeleteItem(null)
            setDeleteItemType(null)
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
            await LoadPatients()
            setIsLoading(false)
        }
        else {

            setIsLoading(false)
            setWarningAlert(true)
            setApiFailedMessage(`${response.message}, Please try again!`)

        }

        setDeleteItem(null)
        setDeleteItemType(null)
        setDeleteItemAlert(false)

    }

    const HandleAddPatient = (e) => {

        navigate(`/app/hospital/${hospitalID}/patients/create`)

    }

    const LoadPatients = async () => {

        let userdetials = JSON.parse(localStorage.getItem("userdetials"))

        let update_data = {
            hospital_id: userdetials.hospital_id,
            user_id: userdetials.id,
        }
        setIsLoading(true)

        let response = await patients_Handler.getPatientsHandler(update_data)

        if (response.success && response.data) {

            setIsLoading(false)

            if (!response.data) return

            if (Array.isArray(response.data)) {

                let patients = response.data.map((data, i) => {

                    return {
                        id: data._id,
                        parentId: null,
                        hasAction: true,
                        order: 1,
                        path: [],
                        itemChildren: [],
                        patient_id: data.patientID,
                        name: data.name,
                        age: data.age,
                        gender: data.gender,
                        weight: data.weight,
                        height: data.height,
                        phone: data.phone,
                        isSelected: false,
                        isSelectOption: true,
                        status: data.status,
                        birthdate: data.birthdate ? Utils.getLocalFullDateBYFormat(data.birthdate, '/', 1) : 'N/A',
                        created_at: data.created_at ? Utils.getLocalFullDateBYFormat(data.created_at, '/', 1) : 'N/A',
                        updated_at: data.created_at ? Utils.getLocalFullDateBYFormat(data.updated_at, '/', 1) : 'N/A',
                        type: "ITEM",
                        rawdata: data
                    }
                });
                console.log(patients, 'patients');
                setItems(patients)

            }

        }
        else {
            setIsLoading(false)
            setWarningAlert(true)
            setApiFailedMessage(`${response.message}, Please try again!`)
        }
    }

    useEffect(() => {

        LoadPatients()
        setPatientUpdatedTrigger(false)

    }, [patientUpdatedTrigger])

    const HandleWarningConfirm = (confirmation) => {

        setWarningAlert(false)
    }

    const HandleOpenPatient = (item) => {

        let patientID = item.patient_id

        navigate(`/app/hospital/${hospitalID}/patients/${patientID}/profile`)
    }
    const HandleEditPatient = (item) => {
        let patientID = item.patient_id

        navigate(`/app/hospital/${hospitalID}/patients/${patientID}/edit`)
    }

    return (

        <div className="project-pd_estimate-main">

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
                        callback: (confirmation) => HandleDeleteConfirmItem(deleteItemId, deleteItemType, confirmation)
                    }} />

                : null}

            <div className="pd_estimate-content-header">
                <div className="pd_estimate-content-section">
                    <div className="pd_estimate-content-title">Patients</div>
                </div>
                <div className="pd_estimate-content-section">
                    <div
                        className="pd_estimate-content-btn"
                        onClick={(e) => HandleAddPatient(e)}
                        id="pd_estimate-addbtn"
                    >
                        <div
                            className="icon"
                            dangerouslySetInnerHTML={{ __html: Icons.general.add_active }}
                        ></div>
                        <div className="label">Add Patient</div>
                    </div>
                </div>
            </div>
            <div className="pd_table-cards">
                <div className="pd_table-cards-items">
                    {items.map((item, i) => (

                        <div
                            className="pd_table-cards-item"
                            key={item.id}
                            id={item.id}

                        >
                            {console.log(item, 'item')}
                            <div
                                className="card-left"
                                onClick={(e) => HandleOpenPatient(item)}
                            >
                                <div className="profile-img">
                                    <img src={item.rawdata.profile_img ? `data:image/png;base64,${item.rawdata.profile_img}` : Images.User} alt="" />
                                </div>
                            </div>
                            <div className="card-right">
                                <div
                                    className="card-detials"
                                    onClick={(e) => HandleOpenPatient(item)}
                                >

                                    <div className="card-detials-title">{item.name || "N/A"}</div>
                                    <div className="card-detials-item" data-label="Age:"> {item.age || "N/A"}</div>
                                    <div className="card-detials-item" data-label="Gender:"> {item.gender || "N/A"}</div>
                                    <div className="card-detials-item" data-label="BOD:">{item.birthdate || "N/A"}</div>
                                </div>
                                <div className="card-actions">

                                    <div className={`card-actions-status status-${item.status || 'general'}`}>{item.status || "GENERAL"}</div>
                                    <div className="card-actions-btns">
                                        <div
                                            className="btn edit"
                                            onClick={(e) => HandleEditPatient(item)}
                                        >
                                            <div
                                                className="icon"
                                                dangerouslySetInnerHTML={{ __html: Icons.general.edit }}
                                            ></div>
                                        </div>
                                        <div
                                            className="btn delete"
                                            onClick={async (e) => await HandleDeleteItem(item)}
                                        >
                                            <div
                                                className="icon"
                                                dangerouslySetInnerHTML={{ __html: Icons.general.delete }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    ))}
                </div>
            </div>
        </div>
    )
}

export default Patients;