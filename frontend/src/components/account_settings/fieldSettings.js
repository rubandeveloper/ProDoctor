import React, { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import StoreHandler from '../../redux/StoreHandler'
import UserAction from '../../redux/action/userAction'

import Images from '../../assets/Images'
import Icons from '../../assets/Icons'
import Loading from '../Loading'

import AlertPopup from '../AlertPopup'
import hospital_Handler from '../../Handlers/hospital/hospital'

import { CostInput, TextInput, SelectInput, RadioInput } from '../Inputs'

const FieldSettings = () => {

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


    const isFieldSettings = Object.keys(store.user.hospital).length ? store.user.hospital.field_settings && Object.keys(store.user.hospital.field_settings).length : false
    const [FieldSettings, setFieldSettings] = useState(isFieldSettings ? store.user.hospital.field_settings : {})

    const Sidebar_ResultView = ({ menu, tableBody, setTableBody, inputChanged, handleDiscardChanges }) => {

        const handleInputChange = (value, index, field) => {

            setTableBody((prevTableBody) => {
                let updatedTableBody = [...prevTableBody];

                if (field == "isDefault") {

                    updatedTableBody = updatedTableBody.map(itm => {
                        return {
                            ...itm,
                            [field]: false,
                        }
                    })
                }

                updatedTableBody[index] = {
                    ...updatedTableBody[index],
                    [field]: value,
                };



                return updatedTableBody;
            });

        };

        const handleAddItemBtn = () => {

            const updatedTableBody = [...tableBody]
            updatedTableBody.push(
                {
                    name: "",
                    isDefault: false,
                    isActive: true,
                    index: updatedTableBody.length,
                }
            )
            setTableBody(updatedTableBody);

        }
        const handleDeleteItemBtn = (event, index) => {

            const updatedTableBody = [...tableBody]

            if (updatedTableBody.length == 1) return
            updatedTableBody.splice(index, 1)
            setTableBody(updatedTableBody);

        }

        return (
            <>
                <div className='editview-drag-table' id='fielsettings-editview-drag-table'>
                    <table >
                        <thead>
                            <tr>
                                <th>Active</th>
                                <th>Default</th>
                                <th>Name</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody id='fielsettings-editview-table-body'>
                            {tableBody.map((itm, index) => (

                                <tr key={index}>
                                    <td className='active' data-label="Active">

                                        {index != 0 ?
                                            <RadioInput props={{
                                                value: itm.isActive,
                                                isIcon: false,
                                                icon: "",
                                                inputType: "checkbox",
                                                name: "table-default-radio",
                                                setValue: (value) => handleInputChange(value, index, 'isActive')
                                            }} />
                                            :
                                            <span
                                                className='checkboxinput-main'
                                                dangerouslySetInnerHTML={{ __html: Icons.general.checkbox_disabled }}
                                            >
                                            </span>
                                        }

                                    </td>
                                    <td className='default' data-label="Default">
                                        <RadioInput props={{
                                            value: itm.isDefault,
                                            isIcon: false,
                                            icon: "",
                                            inputType: "radio",
                                            name: "table-default-radio",
                                            setValue: (value) => handleInputChange(value, index, 'isDefault')
                                        }} />

                                    </td>
                                    <td className='name' data-label="Name">
                                        <input
                                            type='text'
                                            value={itm.name}
                                            placeholder='Name'
                                            required
                                            onChange={(e) => handleInputChange(e.target.value, index, 'name')}
                                        />
                                    </td>

                                    {index != 0 ?
                                        <td className='close'
                                            data-label="Close"
                                            dangerouslySetInnerHTML={{ __html: Icons.general.close_small }}
                                            onClick={(e) => handleDeleteItemBtn(e, index)}
                                        ></td>
                                        : null}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className='editview-tabel-additem'>
                        <div className='add-item-btn' onClick={(e) => handleAddItemBtn()}>
                            <span className='icon' dangerouslySetInnerHTML={{ __html: Icons.general.add_btn }}></span>
                            <span className='label'>Add new option</span>
                        </div>
                    </div>
                </div>
                <div className={`editview-button-items  ${inputChanged ? '' : 'editview-button-items-disabled'}`}>
                    <div className="editview-button-item" onClick={(e) => handleDiscardChanges()}>
                        <span className='label'>Discard Changes</span>
                    </div>
                    <button type='submit' className="editview-button-item button-save">
                        <span
                            className='icon'
                            dangerouslySetInnerHTML={{ __html: Icons.general.save }}
                        ></span>
                        <span className='label' >Save Changes</span>
                    </button>
                </div>
            </>
        );


    }

    const EditView = () => {

        const [selectedMenu, setSelectedMenu] = useState('')
        const selectedMenuRef = useRef(null);

        const [units, setUnits] = useState(isFieldSettings ? FieldSettings.units : []);
        const [projectStatus, setProjectStatus] = useState(isFieldSettings ? FieldSettings.projectStatus : []);
        const [projectTypes, setProjectTypes] = useState(isFieldSettings ? FieldSettings.projectTypes : []);
        const [paymentMethods, setPaymentMethods] = useState(isFieldSettings ? FieldSettings.paymentMethods : []);
        const [selectionCategories, setSelectionCategories] = useState(isFieldSettings ? FieldSettings.selectionCategories : []);
        const [selectionLocations, setSelectionLocations] = useState(isFieldSettings ? FieldSettings.selectionLocations : []);

        const [inputChanged, setInputChanged] = useState(true)

        const sidebar_menus = [
            "Units",
        ]

        // const sidebar_menus = [
        //     "Units",
        //     "Project statuses",
        //     "Project types",
        //     "Payment methods",
        //     "Selection categories",
        //     "Selection locations",
        // ]


        const saveEvent = async (e) => {
            e.preventDefault()


            // if (!inputChanged) {
            //     console.log('No Chnages made');
            //     return
            // }

            let userdetials = JSON.parse(localStorage.getItem("userdetials"))

            let updated_data = {
                units: units || [],
                projectStatus,
                projectTypes,
                paymentMethods,
                selectionCategories,
                selectionLocations,
                user_id: userdetials.id,
                hospital_id: userdetials.hospital_id
            }

            setIsLoading(true)
            let response = await hospital_Handler.updateFieldSettingsHandler(updated_data)

            if (response.success) {
                LoadStoreData()
                setIsLoading(false)
            }
            else {
                setIsLoading(false)
                setWarningAlert(true)
                setApiFailedMessage(`${response.message}, Please try again!`)
            }
        }

        useEffect(() => {
            setTimeout(() => {
                setSelectedMenu(sidebar_menus[0])
            }, 0)
        }, [])



        useEffect(() => {

            if (selectedMenuRef.current) {
                const menu = selectedMenuRef.current.textContent;
                setSelectedMenu(menu);
            }
        }, [selectedMenu]);


        // useEffect(() => {

        //     console.log(units, isFieldSettings, FieldSettings.units, 'units');

        //     let isChanged = false

        //     if (isFieldSettings && units != FieldSettings.units) isChanged = true
        //     if (projectStatus != isFieldSettings ? FieldSettings.projectStatus : undefined) isChanged = true
        //     if (projectTypes != isFieldSettings ? FieldSettings.projectTypes : undefined) isChanged = true
        //     if (paymentMethods != isFieldSettings ? FieldSettings.paymentMethods : undefined) isChanged = true
        //     if (selectionCategories != isFieldSettings ? FieldSettings.selectionCategories : undefined) isChanged = true
        //     if (selectionLocations != isFieldSettings ? FieldSettings.selectionLocations : undefined) isChanged = true

        //     setInputChanged(isChanged)

        // }, [units, projectStatus, projectTypes, paymentMethods, selectionCategories, selectionLocations])

        const handleDiscardChanges = () => {

            setUnits(isFieldSettings ? FieldSettings.units : []);
            setProjectStatus(isFieldSettings ? FieldSettings.projectStatus : []);
            setProjectTypes(isFieldSettings ? FieldSettings.projectTypes : []);
            setPaymentMethods(isFieldSettings ? FieldSettings.paymentMethods : []);
            setSelectionCategories(isFieldSettings ? FieldSettings.selectionCategories : []);
            setSelectionLocations(isFieldSettings ? FieldSettings.selectionLocations : []);

        }

        return (
            <form className="settingsContent-editview-main" onSubmit={saveEvent}>

                <div className="settingsContent-content-title">Default values</div>

                <div className="settingsContent-editview-content">
                    <div className="editview-content-sidebar-main">
                        <div className="editview-sidebar">

                            {sidebar_menus.map((menu, i) => (
                                <div
                                    className={`editview-sidebar-item ${selectedMenu === menu ? 'editview-sidebar-item-active' : ''}`}
                                    key={i}
                                    onClick={() => setSelectedMenu(menu)}
                                    ref={selectedMenu == menu ? selectedMenuRef : null}
                                >
                                    {menu}
                                </div>
                            ))}
                        </div>
                        <div className="editview-sidebar-result" ref={selectedMenuRef}>
                            {
                                selectedMenu == "Units" ? <Sidebar_ResultView menu={selectedMenu} setTableBody={setUnits} tableBody={units} inputChanged={inputChanged} handleDiscardChanges={handleDiscardChanges} />
                                    : selectedMenu == "Project statuses" ? <Sidebar_ResultView menu={selectedMenu} setTableBody={setProjectStatus} tableBody={projectStatus} inputChanged={inputChanged} discardChanges={handleDiscardChanges} />
                                        : selectedMenu == "Project types" ? <Sidebar_ResultView menu={selectedMenu} setTableBody={setProjectTypes} tableBody={projectTypes} inputChanged={inputChanged} handleDiscardChanges={handleDiscardChanges} />
                                            : selectedMenu == "Payment methods" ? <Sidebar_ResultView menu={selectedMenu} setTableBody={setPaymentMethods} tableBody={paymentMethods} inputChanged={inputChanged} handleDiscardChanges={handleDiscardChanges} />
                                                : selectedMenu == "Selection categories" ? <Sidebar_ResultView menu={selectedMenu} setTableBody={setSelectionCategories} tableBody={selectionCategories} inputChanged={inputChanged} handleDiscardChanges={handleDiscardChanges} />
                                                    : selectedMenu == "Selection locations" ? <Sidebar_ResultView menu={selectedMenu} setTableBody={setSelectionLocations} tableBody={selectionLocations} inputChanged={inputChanged} handleDiscardChanges={handleDiscardChanges} />
                                                        : null
                            }

                        </div>
                    </div>
                </div>
            </form>
        )
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
                <EditView />
            </div>
        </>
    )
}

export default FieldSettings;
