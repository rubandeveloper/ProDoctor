import React, { useEffect, useState, useRef } from 'react'
import ReactQuill from 'react-quill';
import { useSelector, useDispatch } from 'react-redux'
import UserAction from '../../redux/action/userAction'
import { Route, Routes, BrowserRouter, Link, useNavigate, useParams } from 'react-router-dom'

import { Chart as ChartJS } from 'chart.js/auto';
import { Line } from 'react-chartjs-2';

import Images from '../../assets/Images'
import Icons from '../../assets/Icons'
import Utils from '../../utils'

import WorkSheet from '../../components/worksheets/worksheets'
import AlertPopup from '../../components/AlertPopup'
import Loading from '../../components/Loading'
import StoreHandler from '../../redux/StoreHandler'
import Patients_Handler from '../../Handlers/Patients/Patients'

const Scheduler = () => {


    const { hospitalID } = useParams();

    const patients_Handler = new Patients_Handler()

    const store = useSelector((store) => store)
    const dispatch = useDispatch()
    const { updateState } = new UserAction

    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate();
    const [warningAlert, setWarningAlert] = useState(false)
    const [apiFailedMessage, setApiFailedMessage] = useState('Invalid Inputs, Please try again with vaild Inputs!')

    const [activeSection, setActiveSection] = useState('today')
    const [TodayItems, setTodayItems] = useState([])
    const [UpCommingItems, setUpCommingItems] = useState([])
    const [CompletedItems, setCompletedItems] = useState([])

    const HandleWarningConfirm = (confirmation) => {

        setWarningAlert(false)
    }


    const LoadAppointments = async () => {

        let userdetials = JSON.parse(localStorage.getItem("userdetials"))

        let update_data = {
            hospital_id: userdetials.hospital_id,
            user_id: userdetials.id,
        }
        setIsLoading(true)

        let response = await patients_Handler.getAppointmentsHandler(update_data)

        if (response.success && response.data) {

            setIsLoading(false)

            if (!response.data) return

            if (Array.isArray(response.data)) {

                let TodayData = response.data.filter(d => {

                    return d.date == new Date().toISOString().slice(0, 10);
                })
                let UpCommingData = response.data.filter(d => {
                    return new Date(d.date).getTime() > new Date().getTime()
                })

                let CompletedData = response.data.filter(d => d.status == 'completed')

                setTodayItems(TodayData)
                setUpCommingItems(UpCommingData)
                setCompletedItems(CompletedData)

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

    const HandleSectionHeader = (type) => {
        setActiveSection(type)
    }

    const HandleSectionClick = (item) => {

        let { patient_id, appointmentID } = item
        navigate(`/app/hospital/H-001/patients/${patient_id}/visits/${appointmentID}/view`)
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

            <div className="project-projectsscheduler-main">

                <div className="projectsscheduler-content">
                    <div className="projectsscheduler-header">
                        <div className="left">
                            <div className="title">Scheduler</div>
                        </div>
                        <div className="right right-buttons">
                        </div>
                    </div>

                    <div className="projectsscheduler-sections-main">
                        <div className="projectsscheduler-section-header">
                            <div
                                className={`section-header ${activeSection == 'today' ? 'header-today-active' : ''}`}
                                onClick={(e) => HandleSectionHeader('today')}
                            >
                                <div className="count count-today">{TodayItems.length}</div>
                                <div className="title">Today</div>
                            </div>
                            <div
                                className={`section-header ${activeSection == 'upcomming' ? 'header-upcomming-active' : ''}`}
                                onClick={(e) => HandleSectionHeader('upcomming')}
                            >
                                <div className="count count-pending">{UpCommingItems.length}</div>
                                <div className="title">UpComming</div>
                            </div>
                            <div
                                className={`section-header ${activeSection == 'completed' ? 'header-completed-active' : ''}`}
                                onClick={(e) => HandleSectionHeader('completed')}
                            >
                                <div className="count count-completed">{CompletedItems.length}</div>
                                <div className="title">Completed</div>
                            </div>
                        </div>
                        <div className="projectsscheduler-sections">
                            <div className={`section-items ${activeSection == 'today' ? 'section-items-active' : ''}`}>
                                {TodayItems.map((item, i) => (

                                    <div
                                        key={item._id}
                                        id={item._id}
                                        className="section-item"
                                        onClick={(e) => HandleSectionClick(item)}
                                    >

                                        <div className="left">
                                            <img className="profile" src={Images.User} alt="" />
                                            <div className="detials">
                                                <div className="title">{item.appointmentID}</div>
                                                <div className="desc">{item.diagnosis}</div>
                                            </div>
                                        </div>
                                        <div className="right">
                                            <div className="time">{item.date}</div>
                                        </div>
                                    </div>
                                ))}

                            </div>
                            <div className={`section-items ${activeSection == 'upcomming' ? 'section-items-active' : ''}`}>
                                {UpCommingItems.map((item, i) => (

                                    <div
                                        key={item._id}
                                        id={item._id}
                                        className="section-item"
                                        onClick={(e) => HandleSectionClick(item)}
                                    >

                                        <div className="left">
                                            <img className="profile" src={Images.User} alt="" />
                                            <div className="detials">
                                                <div className="title">{item.appointmentID}</div>
                                                <div className="desc">{item.diagnosis}</div>
                                            </div>
                                        </div>
                                        <div className="right">
                                            <div className="time">{item.date}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className={`section-items ${activeSection == 'completed' ? 'section-items-active' : ''}`}>
                                {CompletedItems.map((item, i) => (

                                    <div
                                        key={item._id}
                                        id={item._id}
                                        className="section-item"
                                        onClick={(e) => HandleSectionClick(item)}
                                    >

                                        <div className="left">
                                            <img className="profile" src={Images.User} alt="" />
                                            <div className="detials">
                                                <div className="title">{item.appointmentID}</div>
                                                <div className="desc">{item.diagnosis}</div>
                                            </div>
                                        </div>
                                        <div className="right">
                                            <div className="time">{item.date}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default Scheduler;