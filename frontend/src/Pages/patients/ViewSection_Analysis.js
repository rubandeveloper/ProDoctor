import React, { useEffect, useState, useRef } from 'react'
import { Route, Routes, BrowserRouter, Link, useNavigate, useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import UserAction from '../../redux/action/userAction'
import StoreHandler from '../../redux/StoreHandler'
import ReactQuill from 'react-quill';

import { Line } from 'react-chartjs-2';
import { lightningChart, AxisScrollStrategies } from "@arction/lcjs";

import Images from '../../assets/Images'
import Icons from '../../assets/Icons'
import Utils from '../../utils'
import { CostInput, DateTimeInput, TextInput, SelectInput, RadioInput } from '../../components/Inputs'
import Loading from '../../components/Loading'
import AlertPopup from '../../components/AlertPopup'

import Patients_Handler from '../../Handlers/Patients/Patients'


const ViewSection_Analysis = ({ props }) => {

    const patientData = props

    const [isLoading, setIsLoading] = useState(false)
    const [warningAlert, setWarningAlert] = useState(false)
    const [apiFailedMessage, setApiFailedMessage] = useState('Invalid Inputs, Please try again with vaild Inputs!')


    const patients_Handler = new Patients_Handler()

    const navigate = useNavigate();
    const { hospitalID, patientId } = useParams();
    const [appointmentsData, setAppointmentsData] = useState([])

    const bloodPresure_Max = 110
    const [liveBloodPresure, setLiveBloodPresure] = useState(80)

    const HandleLiveBloodPresureChartAnimation = () => {

        let circles = document.querySelectorAll('.overview-chart-circle')

        circles.forEach(c => {

            let radius = parseInt(c.getAttribute('r') || 0) || 0
            let percent = parseInt(c.getAttribute('data-percent') || 0) || 0
            let circum = 2 * radius * Math.PI

            let draw = ((percent * circum) / 1000) || 0;

            c.style.strokeDasharray = draw + " 999";
        })
    }

    const ECG_options = {
        responsive: true,
        redraw: true,
        maintainAspectRatio: false,
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        },
        plugins: {
            legend: {
                display: false,
                position: 'top',
            },
            title: {
                display: false,
            },
        },
    };
    const ECG_ChartReference = useRef();
    const Latest_ChartReference = useRef();


    const [liveECGChartLabels, setLiveECGChartLabels] = useState(['0'])
    const [liveECGChart, setLiveECGChart] = useState({
        labels: liveECGChartLabels,
        datasets: [
            {
                label: 'Price',
                data: [0],
                borderColor: '#f44336',
                backgroundColor: '#f44336',
            },
        ],
    })


    useEffect(() => {
        HandleLiveBloodPresureChartAnimation()

    }, [liveBloodPresure])

    const StartLive = () => {

        setTimeout(() => {

            setLiveBloodPresure(String(parseInt(Math.random() * 100)))

        }, 2000)
    }
    const StartLiveECG = () => {

        const chart = ECG_ChartReference.current;

        if (chart) {

            setTimeout(() => {

                let labels = [...liveECGChartLabels]
                let data = [...liveECGChart.datasets[0].data]

                labels.push(String(parseInt(Math.random() * 100)))
                data.push(String(parseInt(Math.random() * 100)))

                setLiveECGChartLabels(labels)

                setLiveECGChart({
                    labels: labels,
                    datasets: [
                        {
                            label: 'Price',
                            data: data,
                            borderColor: '#f44336',
                            backgroundColor: '#f44336',
                        }],
                })

            }, 2000)
        }
    }

    useEffect(() => {
        StartLive()
        StartLiveECG()
    }, [liveECGChart])

    const [tempature, setTempature] = useState('0')
    const [bloodPresure, setBloodPresure] = useState('0')
    const [bloodSugar, setBloodSugar] = useState('0')
    const [LastAppointmentDocs, setLastAppointmentDocs] = useState([])

    const Latest_options = {
        responsive: true,
        redraw: true,
        maintainAspectRatio: false,
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            title: {
                display: false,
            },
        },
    };
    const [lastestChartLabels, setLatestChartLabels] = useState([])
    const [LatestChart, setLatestChart] = useState({
        labels: lastestChartLabels,
        datasets: [
            {
                label: 'BP',
                data: [],
                borderColor: '#07C07E',
                backgroundColor: '#07C07E',
            },
            {
                label: 'Tempature',
                data: [],
                borderColor: '#F29D41',
                backgroundColor: '#F29D41',
            },
            {
                label: 'Sugar',
                data: [],
                borderColor: '#2855ff',
                backgroundColor: '#2855ff',
            },
        ],
    })

    const [previewDocument, setPreviewDocument] = useState(undefined)

    const HandleDocumentPreview = () => {

        const [img_url, setImg_url] = useState('')

        useEffect(() => {

            if (previewDocument) {

                setImg_url(previewDocument.image)
            }
        }, [])

        return (
            <div className="popup-container-main popup-container-center">
                <div className="popup-block-ui"></div>
                <div className="side-popup-container">
                    <div className="side-popup-header">
                        <div className="header-item-select">
                            <div className="header-item-select-content">
                                <span className="icon" dangerouslySetInnerHTML={{ __html: Icons.general.fee }}></span>
                                <div className="label">Document Preview</div>

                            </div>
                        </div>
                        <div
                            className="header-item-close"
                            onClick={(e) => {
                                setPreviewDocument(undefined)
                            }}
                            dangerouslySetInnerHTML={{ __html: Icons.general.close }}
                        ></div>
                    </div>
                    <div className="sidebar-popup-content">
                        <div className="content-section">
                            <div className="document-preview-main">
                                <img src={img_url || Images.UploadDoc_Default} />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        )
    }



    const LoadAppointment = async () => {

        let userdetials = JSON.parse(localStorage.getItem("userdetials"))

        let updated_data = {
            patient_id: patientId,
            user_id: userdetials.id,
            hospital_id: userdetials.hospital_id
        }
        setIsLoading(true)

        let response = await patients_Handler.getAppointmentsHandler(updated_data)

        if (response.success && response.data) {

            setIsLoading(false)

            if (!response.data) return

            if (Array.isArray(response.data) && response.data.length) {

                let appointments = response.data



                if (Array.isArray(appointments)) {

                    let appointments_labels = []
                    let appointments_datas = { ...LatestChart }

                    appointments.forEach((apt, i) => {
                        appointments_labels.push(String(i))

                        appointments_datas.datasets[0].data.push(apt.bloodPressure)
                        appointments_datas.datasets[1].data.push(apt.temperature)
                        appointments_datas.datasets[2].data.push(apt.bloodSugar)

                        if (i == appointments.length - 1) {

                            setTempature(apt.temperature)
                            setBloodPresure(apt.bloodPressure)
                            setBloodSugar(apt.bloodSugar)
                            let documents = []

                            if (apt.documents && Object.keys(apt.documents).length) {

                                for (const key in apt.documents) {

                                    let document = {
                                        name: String(key).toUpperCase().split('_')[0],
                                        key,
                                        document: apt.documents[key],
                                        image: `data:image/png;base64,${apt.documents[key]}`
                                    }

                                    documents.push(document)
                                }
                            }
                            setLastAppointmentDocs(documents)
                        }
                    })

                    appointments_datas.labels = appointments_labels

                    setLatestChartLabels(appointments_labels)
                    setLatestChart(appointments_datas)
                    setAppointmentsData(appointments)

                }
            }

        }
        else {
            setIsLoading(false)
            setWarningAlert(true)
            setApiFailedMessage(`${response.message}, Please try again!`)
        }

    }
    useEffect(() => {

        LoadAppointment()

    }, [])
    return (
        <>
            {previewDocument ? <HandleDocumentPreview /> : ''}
            <div className="project-projectsoverview-main">
                <div className="projectsoverview-content">
                    <div className="projectsoverview-content-section">

                        <div className="projectsoverview-section-item section-item-size-small">
                            <div className="title">Live Blood Pressure</div>
                            <div className="chart">
                                <svg class="circle-chart" viewbox="0 0 180 180" width="180" height="180" >
                                    <circle className='circle-bg' cx="90" cy="90" r="60" />
                                    <circle className='overview-chart-circle circle-1' data-percent={`${liveBloodPresure}`} id='overview-chart-circle-1' cx="90" cy="90" r="60" />
                                    <text x="90" y="90" fill="#000" font-size="15px" font-weight='600' class="recharts-text" text-anchor="middle">
                                        <tspan x="-90" dy="0.355em">BP {liveBloodPresure || 0}mmHg</tspan>
                                    </text>
                                </svg>
                            </div>

                        </div>
                        <div className="projectsoverview-section-item section-item-size-big">
                            <div className="title">Live ECG</div>
                            <div className="chart">
                                {liveECGChart ? <Line ref={ECG_ChartReference} style={{ width: '100%', height: '100%' }} options={ECG_options} data={liveECGChart} /> : null}
                            </div>

                        </div>

                    </div>
                    <div className="projectsoverview-content-section">

                        <div className="projectsoverview-section-item section-item-size-small">
                            <div className="title">Blood Pressure</div>
                            <div className="chart">
                                <svg class="circle-chart" viewbox="0 0 180 180" width="180" height="180" >
                                    <circle className='circle-bg' cx="90" cy="90" r="60" />
                                    <circle className='overview-chart-circle circle-1' data-percent={`${bloodPresure}`} id='overview-chart-circle-1' cx="90" cy="90" r="60" />
                                    <text x="90" y="90" fill="#000" font-size="15px" font-weight='600' class="recharts-text" text-anchor="middle">
                                        <tspan x="-90" dy="0.355em">BP {bloodPresure || 0}mmHg</tspan>
                                    </text>
                                </svg>
                            </div>

                        </div>
                        <div className="projectsoverview-section-item section-item-size-small">
                            <div className="title">Tempature</div>
                            <div className="chart">
                                <svg class="circle-chart" viewbox="0 0 180 180" width="180" height="180" >
                                    <circle className='circle-bg' cx="90" cy="90" r="60" />
                                    <circle className='overview-chart-circle circle-2' data-percent={`${tempature}`} id='overview-chart-circle-1' cx="90" cy="90" r="60" />
                                    <text x="90" y="90" fill="#000" font-size="15px" font-weight='600' class="recharts-text" text-anchor="middle">
                                        <tspan x="-90" dy="0.355em">BP {tempature || 0}mmHg</tspan>
                                    </text>
                                </svg>
                            </div>

                        </div>
                        <div className="projectsoverview-section-item section-item-size-small">
                            <div className="title">Blood Sugar</div>
                            <div className="chart">
                                <svg class="circle-chart" viewbox="0 0 180 180" width="180" height="180" >
                                    <circle className='circle-bg' cx="90" cy="90" r="60" />
                                    <circle className='overview-chart-circle circle-3' data-percent={`${bloodSugar}`} id='overview-chart-circle-1' cx="90" cy="90" r="60" />
                                    <text x="90" y="90" fill="#000" font-size="15px" font-weight='600' class="recharts-text" text-anchor="middle">
                                        <tspan x="-90" dy="0.355em">BP {bloodSugar || 0}mmHg</tspan>
                                    </text>
                                </svg>
                            </div>

                        </div>
                        <div className="projectsoverview-section-item section-item-size-mid">
                            <div className="title">Last B.T.S Chart</div>
                            <div className="chart">
                                {LatestChart ? <Line ref={Latest_ChartReference} style={{ width: '100%', height: '100%' }} options={Latest_options} data={LatestChart} /> : null}
                            </div>

                        </div>

                    </div>
                    <div className="projectsoverview-content-section">

                        {LastAppointmentDocs.map((apt, i) => (

                            <div key={`appointment_docs_${i}`} className="projectsoverview-section-item section-item-size-small">
                                <div className="title">{apt.name}</div>
                                <div className="image">
                                    <img src={apt.image || Images.ECG_Default} alt="" />
                                </div>
                                <div className="buttons">
                                    <span
                                        className='button button-preview'
                                        onClick={(e) => setPreviewDocument(apt)}
                                    >Preview</span>
                                    <span
                                        className='button button-predict'
                                        onClick={(e) => setPreviewDocument(apt)}
                                    >Predited</span>
                                </div>

                            </div>
                        ))}


                    </div>
                </div>

            </div>
        </>
    )
}

export default ViewSection_Analysis;