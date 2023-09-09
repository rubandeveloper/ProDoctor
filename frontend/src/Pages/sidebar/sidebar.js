import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useParams, Route, Routes, BrowserRouter } from 'react-router-dom'

import Image from '../../assets/Images'
import Icons from '../../assets/Icons'

const Sidebar = ({ props }) => {

    const { setMenuResult } = props
    const { hospitalID } = useParams();
    const navigate = useNavigate();

    const currentURL = window.location.pathname;

    let selectSection = currentURL ? currentURL.split(`/${hospitalID}/`)[1] : undefined;

    const sidebar_items = [
        {
            id: "scheduler",
            icon: Icons.general.calender,
            label: 'Scheduler',
            bg_color: "#e3f2fd",
            active_color: "#42a5f5"
        },
        {
            id: "patients",
            icon: Icons.general.patients,
            label: 'Patients',
            bg_color: "#e0f7fa",
            active_color: "#21abbc"
        },
        {
            id: "analyzer",
            icon: Icons.general.analyzer,
            label: 'Analyzer',
            bg_color: "#deecff",
            active_color: "#0060df"
        },
        {
            id: "settings",
            icon: Icons.general.settings,
            label: 'Settings',
            bg_color: "#fce4ec",
            active_color: "#ec407a"
        },
    ]

    const [selectedMenu, setSelectedMenu] = useState('')
    const selectedMenuRef = useRef(null);


    const Hide_SideBar = () => {
        let sidebar_contanier = document.querySelector('#project-sidebar-main')

        let sidebar_active_class = "project-sidebar-active"
        sidebar_contanier.classList.remove(sidebar_active_class)
    }

    const HandleSidebarMenu = (item) => {
        setSelectedMenu(item.id)


        if (item.id == 'settings') {

            navigate(`/app/my_profile`)
        }
        else {
            setMenuResult(item)
        }


        Hide_SideBar()
    }

    useEffect(() => {

        setTimeout(() => {

            if (selectSection) setSelectedMenu(selectSection)
            else {
                setSelectedMenu(sidebar_items[0].id)
                navigate(`/app/hospital/${hospitalID}/${sidebar_items[0].id}`)
            }
        }, 0)
    }, [])

    return (
        <div className='project-sidebar-main' id='project-sidebar-main'>
            <div className="sidebar-header">
                <div className="header-title">Menus</div>
                <div
                    className="header-close"
                    dangerouslySetInnerHTML={{ __html: Icons.general.close }}
                    onClick={(e) => Hide_SideBar(e)}
                ></div>
            </div>
            <div className="sidebar-items">

                {sidebar_items.map((item, i) => (

                    <div
                        className={`${item.disabled ? 'sidebar-item-disabled' : 'sidebar-item'} ${selectedMenu == item.id ? 'sidebar-item-active' : ''}`}
                        key={i}
                        onClick={() => { if (!item.disabled) HandleSidebarMenu(item) }}
                        ref={selectedMenu == item.id ? selectedMenuRef : null}
                        style={{
                            background: `${selectedMenu == item.id ? item.bg_color : '#fff'}`,
                            color: `${selectedMenu == item.id ? item.active_color : '#000'}`
                        }}
                    >
                        <span
                            className='icon'
                            dangerouslySetInnerHTML={{ __html: item.icon }}
                            style={{ background: item.bg_color }}
                        ></span>
                        <span className='label'>{item.label}</span>
                        {item.commingsoon ?
                            <span
                                className='sidebae-item-commingsoon icon'
                                dangerouslySetInnerHTML={{ __html: Icons.general.commingsoon }}
                            ></span> : null
                        }
                    </div>

                ))}

            </div>
        </div>
    )
}

export default Sidebar;
