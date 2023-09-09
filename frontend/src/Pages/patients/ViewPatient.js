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

import ViewSection_Profile from './ViewSection_Profile'
import ViewSection_Analysis from './ViewSection_Analysis'
import ViewSection_Visitis from './ViewSection_Visitis'
import ViewSection_Records from './ViewSection_Records'

import CreateNewAppointment from './CreateNewAppointment'
import ViewEditAppointment from './ViewEditAppointment'

const ViewPatient = ({ props }) => {

    const [isLoading, setIsLoading] = useState(false)
    const [warningAlert, setWarningAlert] = useState(false)
    const [apiFailedMessage, setApiFailedMessage] = useState('Invalid Inputs, Please try again with vaild Inputs!')

    const patients_Handler = new Patients_Handler()

    const { hospitalID, patientId } = useParams();

    const navigate = useNavigate();

    const store = useSelector((store) => store)

    const dispatch = useDispatch()
    const { updateState } = new UserAction


    const [patientData, setPatientData] = useState({})

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

    let LoadPatientDate = async () => {

        setIsLoading(true)
        let userdetials = JSON.parse(localStorage.getItem("userdetials"))

        let update_data = {
            patientid: patientId,
            hospital_id: userdetials.hospital_id,
            user_id: userdetials.id,
        }

        let response = await patients_Handler.getPatientsHandler(update_data)


        if (response.success && response.data) {

            setIsLoading(false)

            if (!response.data || !Array.isArray(response.data) || !response.data.length) return

            let patient = response.data[0] || undefined

            setPatientData(patient)
        }
        else {
            setIsLoading(false)
            setWarningAlert(true)
            setApiFailedMessage(`${response.message}, Please try again!`)
        }
    }

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

    useEffect(() => {

        if (!patientId) {

            navigate(`/app/hospital${hospitalID}/patients`)
            return
        }
        LoadPatientDate()

    }, [])
    useEffect(() => {

        SetPatientDatas(patientData)

    }, [patientData])

    const HandleBackBtn = (e) => {

        navigate(`/app/hospital/${hospitalID}/patients`)
    }

    const HandleWarningConfirm = (confirmation) => {

        setWarningAlert(false)
    }

    const selectSection = "profile"
    const [selectedMenu, setSelectedMenu] = useState('')
    const selectedMenuRef = useRef(null);

    const sections_data = [
        {
            id: 'profile',
            label: 'Profile',
            component: ViewSection_Profile
        },
        {
            id: 'analysis',
            label: 'Analytics',
            component: ViewSection_Analysis
        },
        {
            id: 'visits',
            label: 'Visits',
            component: ViewSection_Visitis
        },]

    useEffect(() => {

        setTimeout(() => {

            if (selectSection) setSelectedMenu(selectSection)
            else {
                let id = sections_data[0].id
                setSelectedMenu(id)
                navigate(`/app/hospital/${hospitalID}/patients/${patientId}/${id}`)
            }
        }, 0)
    }, [])



    useEffect(() => {

        if (selectedMenuRef.current) {
            let menu = selectedMenuRef.current
            if (!menu) return
            menu = menu.id;
            setSelectedMenu(menu);
        }
    }, [selectedMenu]);



    const PanelContentHandler = ({ prop }) => {

        const value = sections_data.find(itm => itm.id == prop)

        if (value && value.label) return <value.component props={patientData} />;

        return null
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

            <div className="project-addpatient-main">
                <div className="addpatient-content">
                    <div className="addpatient-header">
                        <div className="header-left">
                            <div className="header-item" >
                                <div
                                    onClick={(e) => HandleBackBtn(e)}
                                    className="header-back-btn"
                                    dangerouslySetInnerHTML={{ __html: Icons.general.back_arrow }}
                                ></div>
                            </div>
                            <div className="header-item header-title">Patients / {name || ""}</div>
                        </div>
                        <div className="header-right">
                        </div>
                    </div>
                    <div className="addpatient-sections" >
                        <div className="patientbrief-sections-toggle-main">
                            {sections_data.map((section, i) => (
                                <div
                                    className={`toggle-item ${selectedMenu == section.id ? 'toggle-item-active' : ''}`}
                                    key={section.id}
                                    id={section.id}
                                    onClick={() => {
                                        setSelectedMenu(section.id)
                                        navigate(`/app/hospital/${hospitalID}/patients/${patientId}/${section.id}`)
                                    }}
                                    ref={selectedMenu == section.id ? selectedMenuRef : null}
                                >
                                    {section.label}
                                </div>
                            ))}
                        </div>
                        <div className="patientbrief-sections-main" ref={selectedMenuRef}>
                            <Routes>
                                <Route exact path={`/${selectedMenu}/*`} element={<PanelContentHandler prop={selectedMenu} />}></Route>
                                <Route exact path={`/visits/create`} element={<CreateNewAppointment />}></Route>
                                <Route exact path='/visits/:appointmentID/view' element={<ViewEditAppointment props={{ isEditView: false }} />}></Route>
                                <Route exact path='/visits/:appointmentID/edit' element={<ViewEditAppointment props={{ isEditView: true }} />}></Route>
                            </Routes>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}

export default ViewPatient;