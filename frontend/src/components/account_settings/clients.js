import React, { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import StoreHandler from '../../redux/StoreHandler'
import UserAction from '../../redux/action/userAction'

import { Link, useNavigate } from 'react-router-dom'
import ReactQuill from 'react-quill';

import Images from '../../assets/Images'
import Icons from '../../assets/Icons'
import Utils from '../../utils'
import Loading from '../Loading'

import hospital_Handler from '../../Handlers/hospital/hospital'

import { CostInput, TextInput, SelectInput, RadioInput } from '../../components/Inputs'
import WorkSheet from '../../components/worksheets/worksheets'
import AlertPopup from '../AlertPopup'

const Clients = () => {
    const [isLoading, setIsLoading] = useState(false)

    const [warningAlert, setWarningAlert] = useState(false)
    const [apiFailedMessage, setApiFailedMessage] = useState('Invalid Inputs, Please try again with vaild Inputs!')


    const hospital_Handler = new hospital_Handler()
    const store = useSelector((store) => store)
    const dispatch = useDispatch()
    const { updateState } = new UserAction

    const storeHandler = new StoreHandler({
        dataStack: ['hospital'],
        dispatch: dispatch,
        updateState: updateState,
    })

    const LoadStoreData = async () => {
        setIsLoading(true)
        let resolved = await storeHandler.init()
        setIsLoading(false)
    }

    const hospitalProfile = store.user ? store.user.hospital : undefined
    const hospital_clients = store.user ? store.user.hospital.clients || [] : undefined

    const navigate = useNavigate();

    const [headers, setHeaders] = useState([

        {
            label: "Name",
            id: "name",
            dropdown: false,
            isLeft: true,
            active: true,
        },
        {
            label: "Email",
            id: "email",
            active: true,
        },
        {
            label: "Phone",
            id: "phone",
            active: true,
        },
        {
            label: "Action",
            id: "action",
            active: true,
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
    const [filters, setFilters] = useState({
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
        ],
        right: []
    })
    const [editShowPopup, setEditShowPopup] = useState(false)
    const [existItemData, setExistItemData] = useState({})


    const LoadClients = async () => {

        if (!Array.isArray(hospital_clients)) return

        let clients = hospital_clients.map((data, i) => {

            return {
                id: data.id,
                parentId: null,
                hasAction: true,
                order: 1,
                path: [],
                itemChildren: [],
                name: data.name,
                email: data.email,
                isSelectOption: false,
                isSelected: false,
                phone: data.phone,
                type: "ITEM",
                rawdata: data
            }
        });

        setItems(clients)

    }
    useEffect(() => {

        LoadClients()

    }, [])

    const saveEvent = async (e) => {
        e.preventDefault()

        let userdetials = JSON.parse(localStorage.getItem("userdetials"))


        let updated_data = {

            user_id: userdetials.id,
            hospital_id: userdetials.hospital_id
        }

        setIsLoading(true)
        let response = await hospital_Handler.updatehospitalHandler(updated_data)

        if (response.success) {
            setIsLoading(false)
        }
        else {
            setIsLoading(false)
            setWarningAlert(true)
            setApiFailedMessage(`${response.message}, Please try again!`)
        }

    }
    const HandleOpenProject = (item) => {
        setExistItemData(item)
        setEditShowPopup(true)
    }
    const AddHeadCategoryPopup = () => {


        const [name, setName] = useState('')
        const [email, setEmail] = useState('')
        const [phone, setPhone] = useState('')

        const isExistItemData = existItemData && existItemData.id != undefined

        useEffect(() => {

            if (isExistItemData) {
                setName(existItemData.name || '')
                setEmail(existItemData.email || '')
                setPhone(existItemData.phone || '')
            }

        }, [])

        const HandlePopupSubmit = async (e) => {
            e.preventDefault()

            let userdetials = JSON.parse(localStorage.getItem("userdetials"))

            let updated_data = {

                id: isExistItemData ? existItemData.id : Utils.getUniqueId(),
                name,
                email,
                phone,
                user_id: userdetials.id,
                hospital_id: userdetials.hospital_id
            }
            setIsLoading(true)
            let response = isExistItemData ? await hospital_Handler.updateClientHandler(updated_data) : await hospital_Handler.addClientHandler(updated_data)

            if (response.success) {
                setIsLoading(false)

                LoadStoreData()
            }
            else {
                setIsLoading(false)
                setWarningAlert(true)
                setApiFailedMessage(`${response.message}, Please try again!`)
            }

            setEditShowPopup(false)
            setExistItemData({})
        }

        const Popup_Header = ({ props }) => {

            const { icon, label } = props
            return (
                <div className="side-popup-header">
                    <div className="header-item-select">
                        <div className="header-item-select-content">
                            <span className="icon" dangerouslySetInnerHTML={{ __html: icon }}></span>
                            <div className="label">{isExistItemData ? 'Update' : 'Add'} {label}</div>

                        </div>
                    </div>
                    <div
                        className="header-item-close"
                        onClick={(e) => {
                            setEditShowPopup(false)
                            setExistItemData({})
                        }}
                        dangerouslySetInnerHTML={{ __html: Icons.general.close }}
                    ></div>
                </div>
            );
        };
        const Popup_Footer = ({ props }) => {

            const { icon, label } = props

            return (
                <div className="sidebar-popup-footer">
                    <div className="footer-item action-items">
                        <div className="action-preview">
                        </div>
                        <button
                            className="action-btn"
                            type='submit'
                        >
                            <div className="icon" dangerouslySetInnerHTML={{ __html: isExistItemData ? Icons.general.save : Icons.general.add_btn }}></div>
                            <div className="label">{isExistItemData ? 'Save' : 'Add Client'}</div>
                        </button>
                    </div>
                </div>
            );
        };

        return (
            <div className="popup-container-main popup-container-center">
                <div className="popup-block-ui"></div>
                <form className="side-popup-container" onSubmit={HandlePopupSubmit}>
                    <Popup_Header props={{ icon: Icons.general.user, label: 'Client' }} />

                    <div className="sidebar-popup-content">
                        <div className="content-section">


                            <div className="content-item">
                                <TextInput
                                    props={{
                                        id: "createclient-name",
                                        value: name,
                                        placeholder: '',
                                        setValue: (value) => setName(value),
                                        isIcon: false,
                                        isLabel: true,
                                        isRequired: true,
                                        label: "Name",
                                    }}
                                />
                            </div>
                            <div className="content-item">
                                <TextInput
                                    props={{
                                        id: "createclient-email",
                                        value: email,
                                        placeholder: '',
                                        setValue: (value) => setEmail(value),
                                        isIcon: false,
                                        isLabel: true,
                                        isRequired: true,
                                        label: "Email",
                                    }}
                                />
                            </div>
                            <div className="content-item">
                                <TextInput
                                    props={{
                                        id: "createclient-phone",
                                        value: phone,
                                        placeholder: '',
                                        setValue: (value) => setPhone(value),
                                        isIcon: false,
                                        isLabel: true,
                                        isRequired: true,
                                        label: "Phone Number",
                                    }}
                                />
                            </div>

                        </div>
                    </div>

                    <Popup_Footer props={{ icon: Icons.general.user, label: 'Client' }} />
                </form>
            </div>
        )

    }

    const HandleDeleteItem = async (item) => {

        let userdetials = JSON.parse(localStorage.getItem("userdetials"))

        let updated_data = {

            id: item.id,
            type: item.type,
            hospital_id: userdetials.hospital_id,
            user_id: userdetials.id,
        }
        setIsLoading(true)
        let response = await hospital_Handler.deleteClientHandler(updated_data)

        if (response.success) {
            setIsLoading(false)
            LoadStoreData()
        }
        else {
            setIsLoading(false)
            setWarningAlert(true)
            setApiFailedMessage(`${response.message}, Please try again!`)
        }
    }

    const HandleAddBtn = (e) => {
        setEditShowPopup(true)
    }




    const HandleWarningConfirm = (confirmation) => {

        setWarningAlert(false)
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

            <div className='project-settingsContent-main'>
                <div className="settingsContent-editview-main" id='settingsContent-hospital-main'>

                    {editShowPopup ? <AddHeadCategoryPopup /> : null}

                    <div className="settingsContent-content-header">
                        <div className="settingsContent-content-section">
                            <div className="settingsContent-content-title">Clients</div>
                        </div>
                        <div className="settingsContent-content-section">
                            <div
                                className="settingsContent-content-btn"
                                onClick={(e) => HandleAddBtn(e)}
                            >
                                <div
                                    className="icon"
                                    dangerouslySetInnerHTML={{ __html: Icons.general.add_active }}
                                ></div>
                                <div className="label">Add Client</div>
                            </div>
                        </div>
                    </div>

                    <div className="settingsContent-editview-content">

                        <WorkSheet props={{
                            Header: headers,
                            Items: items,
                            isStepper: false,
                            isFilters: true,
                            Filters: filters,
                            openSidebar: (item, type) => {
                                HandleOpenProject(item)
                            },
                            openEditView: HandleOpenProject,
                            deleteOption: async (item) => await HandleDeleteItem(item)
                        }} />

                    </div>
                </div>
            </div>
        </>
    )
}

export default Clients;
