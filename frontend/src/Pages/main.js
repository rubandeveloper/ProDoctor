import React, { useEffect, useState, useRef } from 'react'
import { Link, useNavigate, useParams, Route, Routes, BrowserRouter } from 'react-router-dom'


import Sidebar from './sidebar/sidebar'
import Scheduler from './scheduler/scheduler'
import Patients from './patients/patients'
import ViewPatient from './patients/ViewPatient'
import AddPatient from './patients/AddPatient'
import Analyzer from './analyzer/analyzer'

import OpenText_Handler from '../Handlers/OpenText/OpenText'

const Main = ({ }) => {

    const { hospitalID } = useParams();
    const navigate = useNavigate();
    const openText_Handler = new OpenText_Handler()

    const setMenuResult = (item) => {
        navigate(`/app/hospital/${hospitalID}/${item.id}`)
    }

    const HandleOpentTextFreshToken = async (duration = 50000) => {

        await openText_Handler.getToken()

        // setInterval(async () => {

        //     await openText_Handler.getToken()

        // }, duration)
    }

    useEffect(() => {

        HandleOpentTextFreshToken()

    }, [])


    return (
        <div className="project-projects-main">
            <Sidebar props={{ setMenuResult }} />
            <div className="projects-content-container">
                <Routes>
                    <Route exact path='/scheduler/*' element={<Scheduler />}></Route>
                    <Route exact path='/patients/*' element={<Patients />}></Route>
                    <Route exact path='/patients/:patientId/*' element={<ViewPatient props={{ menuType: 'create' }} />}></Route>
                    <Route exact path='/patients/:patientId/edit' element={<AddPatient props={{ menuType: 'edit', isEditView: true }} />}></Route>
                    <Route exact path='/patients/create' element={<AddPatient props={{ menuType: 'create' }} />}></Route>
                    <Route exact path='/analyzer/*' element={<Analyzer />}></Route>
                </Routes>
            </div>
        </div>
    )
}
export default Main;