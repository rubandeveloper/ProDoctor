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

const Overview = () => {


    const { hospitalID } = useParams();

    const store = useSelector((store) => store)
    const dispatch = useDispatch()
    const { updateState } = new UserAction

    const [isLoading, setIsLoading] = useState(false)
    const navigate = useNavigate();
    const [warningAlert, setWarningAlert] = useState(false)
    const [apiFailedMessage, setApiFailedMessage] = useState('Invalid Inputs, Please try again with vaild Inputs!')

    const options = {
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
                position: 'top',
            },
            title: {
                display: false,
            },
        },
    };
    const costChartLabels = ['Manpower', 'Materials', 'Machines', 'Fee', 'Allowance'];

    const currency_type = "$"

    const [costChart, setCostChart] = useState({
        labels: costChartLabels,
        datasets: [
            {
                label: 'Price',
                data: [0, 0, 0, 0, 0],
                borderColor: '#2855ff',
                backgroundColor: '#2855ff',
                cubicInterpolationMode: 'monotone',
            },
            {
                label: 'Tax',
                data: [0, 0, 0, 0, 0],
                borderColor: '#f44336',
                backgroundColor: '#f44336',
                cubicInterpolationMode: 'monotone',
            },
            {
                label: 'Markup',
                data: [0, 0, 0, 0, 0],
                borderColor: '#07C07E',
                backgroundColor: '#07C07E',
                cubicInterpolationMode: 'monotone',
            },
        ],
    })

    const [financeChart, setFinanceChart] = useState({
        price: 0,
        estimate: 0,
        markup: 0,
    })
    const [financeChartValues, setFinanceChartValues] = useState({
        margin: 0,
        price: 0,
        estimate: 0,
        markup: 0,
    })
    const [filters, setFilters] = useState({
        left: [],
        right: []
    })
    const [headers, setHeaders] = useState([
        {
            label: "Proposal ID",
            id: "proposal_id",
            isID: true,
            dropdown: true,
            isLeft: true,
            active: true,
        },
        {
            label: "Proposal Name",
            id: "name",
            dropdown: true,
            isLeft: true,
            active: true,
        },
        {
            label: "Price",
            id: "price",
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
    ])
    const [items, setItems] = useState([])


    const HandleCircelChartAnimation = () => {

        let circles = document.querySelectorAll('.overview-chart-circle')

        circles.forEach(c => {

            let radius = parseInt(c.getAttribute('r') || 0) || 0
            let percent = parseInt(c.getAttribute('data-percent') || 0) || 0
            let circum = 2 * radius * Math.PI

            let draw = ((percent * circum) / 1000) || 0;

            c.style.strokeDasharray = draw + " 999";
        })
    }

    const HandleWarningConfirm = (confirmation) => {

        setWarningAlert(false)
    }

    const HandleProposalSeeMore = (e) => {
        navigate(`/hospital/${hospitalID}/proposal`)
    }

    useEffect(() => {
        HandleCircelChartAnimation()

    }, [financeChart])

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

            <div className="project-projectsoverview-main">

                <div className="projectsoverview-content">
                    <div className="projectsoverview-content-section">
                        <div className="projectsoverview-section-item section-item-size-small">
                            <div className="title">Financial Chart</div>
                            <div className="chart">
                                <svg class="circle-chart" viewbox="0 0 250 250" width="250" height="250" >
                                    <circle className='circle-bg' cx="125" cy="125" r="120" />
                                    <circle className='circle-bg' cx="125" cy="125" r="105" />
                                    <circle className='circle-bg' cx="125" cy="125" r="90" />

                                    <circle className='overview-chart-circle circle-1' data-percent={`${financeChart.price}`} id='overview-chart-circle-1' cx="125" cy="125" r="120" />
                                    <circle className='overview-chart-circle circle-2' data-percent={`${financeChart.estimate}`} id='overview-chart-circle-2' cx="125" cy="125" r="105" />
                                    <circle className='overview-chart-circle circle-3' data-percent={`${financeChart.markup}`} id='overview-chart-circle-3' cx="125" cy="125" r="90" />
                                    <text x="125" y="125" fill="#000" font-size="15px" font-weight='600' class="recharts-text" text-anchor="middle">
                                        <tspan x="-125" dy="0.355em">Profit {financeChartValues.margin || 0}%</tspan>
                                    </text>
                                </svg>
                            </div>
                            <div className="detials">
                                <div className="detials-item">
                                    <div className="label">
                                        <span className='color-label' style={{ background: '#2855ff' }}></span>
                                        <span>Project price</span>
                                    </div>
                                    <div className="value">{currency_type}{financeChartValues.price || 0}</div>
                                </div>
                                <div className="detials-item">
                                    <div className="label">
                                        <span className='color-label' style={{ background: '#F29D41' }}></span>
                                        <span>Estimated price</span>
                                    </div>
                                    <div className="value">{currency_type}{financeChartValues.estimate || 0}</div>
                                </div>
                                <div className="detials-item">
                                    <div className="label">
                                        <span className='color-label' style={{ background: '#07C07E' }}></span>
                                        <span>Markup</span>
                                    </div>
                                    <div className="value">{currency_type}{financeChartValues.markup || 0}</div>
                                </div>
                            </div>
                        </div>
                        <div className="projectsoverview-section-item section-item-size-mid">
                            <div className="title">Cost Graph</div>
                            <div className="chart">
                                {costChart ? <Line style={{ width: '100%', height: '370px' }} options={options} data={costChart} /> : null}
                            </div>
                        </div>
                        <div className="projectsoverview-section-item section-item-commingsoon section-item-task section-item-size-small">
                            <div className="commingsoon-bg"></div>
                            <div className="commingsoon-label">Project Management<br /> Comming Soon.</div>
                            <div className="title">My Tasks</div>
                            <div className="record">
                                <div className="result">
                                    <div
                                        className="icon"
                                        dangerouslySetInnerHTML={{ __html: Icons.general.no_tasks }}
                                    ></div>
                                    <div className="label">There are no tasks to show</div>
                                </div>
                                <div className="button">
                                    <div
                                        className="icon"
                                        dangerouslySetInnerHTML={{ __html: Icons.general.add_active }}
                                    ></div>
                                    <div className="label">Add Task</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="projectsoverview-content-section">
                        <div className="projectsoverview-section-item section-table">
                            <div className="title">Proposals Progress</div>
                            <div className="table">

                                <WorkSheet props={{
                                    Header: headers,
                                    Items: items,
                                    isStepper: false,
                                    isFilters: false,
                                    isPaggination: false,
                                    Filters: filters,
                                    openSidebar: (item, type) => { },
                                    openEditView: () => { },
                                    deleteOption: async (item) => { }
                                }} />

                            </div>
                            <div className="action" onClick={(e) => HandleProposalSeeMore(e)}>
                                <div className="label">See more</div>
                                <div
                                    className="icon"
                                    dangerouslySetInnerHTML={{ __html: Icons.general.more_arrow }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}

export default Overview;