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


const ViewSection_Records = () => {
    return (
        <>Records</>
    )
}

export default ViewSection_Records;