import React, { useEffect, useState, useRef, useDeferredValue } from 'react'
import ReactQuill from 'react-quill';
import { useSelector, useDispatch } from 'react-redux'
import 'react-quill/dist/quill.snow.css';
import UserAction from '../../redux/action/userAction'
import StoreHandler from '../../redux/StoreHandler'

import Images from '../../assets/Images'
import Icons from '../../assets/Icons'
import Utils from '../../utils'

import { CostInput, TextInput, SelectInput, RadioInput } from '../Inputs'
import WorkSheet from '../worksheets/worksheets'
import AlertPopup from '../AlertPopup'
import Loading from '../Loading'

import hospital_Handler from '../../Handlers/hospital/hospital'

const SOR = () => {

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

    const field_settings = store.user ? store.user.hospital.field_settings : undefined
    const sor_categories = store.user ? store.user.hospital.sor_categories || [] : undefined
    const awr_items = store.user ? store.user.hospital.awr_items || [] : undefined
    let sor_items = store.user ? store.user.hospital.sor_items || [] : []
    const sor_templates = store.user ? store.user.sor_templates || [] : []
    sor_items = [...sor_items, ...sor_templates]

    const hospitalSettingsProfile = store.user ? store.user.hospital.settings : undefined
    const currency_type = hospitalSettingsProfile ? hospitalSettingsProfile.currency || "₹" : "₹"

    const head_options = [
        {
            value: "labour",
            label: "Labour"
        },
        {
            value: "material",
            label: "Material"
        },
        {
            value: "machine",
            label: "Machine"
        },
    ]
    const category_options = sor_categories ? sor_categories.map(category => {
        return {
            value: category.id,
            label: category.name,
            head: category.head
        }
    }) : []

    const unit_options = field_settings ? field_settings.units.map(unit => {
        return {
            value: unit.name,
            label: unit.name
        }
    }) : []

    const [isAddBtnClicked, setIsAddBtnClicked] = useState(false)
    const [itemShowPopup, setItemShowPopup] = useState(false)
    const [headCatgShowPopup, setHeadCatgShowPopup] = useState(false)
    const [addBtnOption, setAddBtnOption] = useState({})

    const [deleteItemId, setDeleteItem] = useState(null)
    const [deleteItemType, setDeleteItemType] = useState(null)
    const [deleteItemAlert, setDeleteItemAlert] = useState(false)

    const [existItemData, setExistItemData] = useState({})

    const [headers, setHeaders] = useState([
        {
            label: "Select all",
            id: "select",
            isLeft: true,
            active: true,
        },
        {
            label: "Name",
            id: "name",
            dropdown: true,
            active: true,
            isLeft: true
        },
        {
            label: "Unit",
            active: true,
            id: "unit"
        },
        {
            label: "Unitrate",
            active: true,
            id: "unitrate"
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
    const [items, setItems] = useState([

        {
            id: "labour",
            parentId: null,
            hasAction: false,
            order: 1,
            isMain: true,
            path: [],
            itemChildren: [],
            name: "Labour",
            isSelected: false,
            isSelectOption: true,
            status: "COMPLETE",
            type: "GROUP",
            unit: null,
            unitrate: null,
            action: null,
            description: null,
            head: null,
            category: null,
        },

        {
            id: "material",
            parentId: null,
            hasAction: false,
            order: 1,
            path: [],
            isMain: true,
            itemChildren: [],
            isSelected: false,
            isSelectOption: true,
            name: "Materials",
            status: "COMPLETE",
            type: "GROUP",
            unit: null,
            unitrate: null,
            action: null,
            description: null,
            head: null,
            category: null,

        },
        {
            id: "material_template",
            parentId: "material",
            hasAction: false,
            order: 1,
            path: [],
            itemChildren: [],
            name: "Template",
            isSelected: false,
            isSelectOption: true,
            status: "COMPLETE",
            type: "GROUP",
            unit: null,
            unitrate: null,
            action: null,
            description: null,
            head: {
                id: "material",
                label: "Material"
            },
            category: null,
            isTemplate: true,
            templateLabel: "T"
        },
        {
            id: "cement_material_template",
            parentId: "material_template",
            hasAction: false,
            order: 1,
            path: [],
            itemChildren: [],
            name: "Cement",
            isSelected: false,
            isSelectOption: true,
            status: "COMPLETE",
            type: "GROUP",
            unit: null,
            unitrate: null,
            action: null,
            description: null,
            head: {
                id: "material_template",
                label: "Template"
            },
            category: null,
            isTemplate: true,
            templateLabel: "T"
        },

        {
            id: "machine",
            parentId: null,
            hasAction: false,
            order: 1,
            isMain: true,
            path: [],
            itemChildren: [],
            isSelected: false,
            isSelectOption: true,
            name: "Machines",
            status: "COMPLETE",
            type: "GROUP",
            unit: null,
            unitrate: null,
            action: null,
            description: null,
            head: null,
            category: null,
        },

    ])
    const [templateItems, setTemplateItems] = useState([])

    const Filters = {
        left: [
            {
                id: "sor-worksheetfilter-multiselect",
                type: "icon",
                isSelectToggle: true,
                placeholder: "",
                callback: (val) => { },
                isIcon: true,
                icon: Icons.general.multi_select,
                isLabel: false,
                label: "",
                isIconLeft: false
            },
            {
                id: "sor-worksheetfilter-select",
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
                        label: "By categories",
                        callback: (val) => { }
                    },
                ],
                callback: (val) => { },
                isIcon: true,
                icon: Icons.general.dropdown_arrow,
                isLabel: true,
                label: "Select",
                isIconLeft: false
            },
            {
                id: "sor-worksheetfilter-search",
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
        right: [
            {
                id: "worksheetfilter-filter",
                isSearchBar: false,
                type: "button",
                isDropDownContainer: true,
                dropDownOptions: [
                    {
                        type: "option",
                        label: "Select all",
                        id: 'filter-opt-select-all',
                        value: false,
                    },
                ],
                callback: (val) => { },
                isIcon: true,
                icon: Icons.general.filter_by,
                isLabel: false,
                label: "",
                isIconLeft: false
            },
            {
                id: "worksheetfilter-show_hide",
                isSearchBar: false,
                type: "button",
                isDropDownContainer: true,
                dropDownOptions: [
                    {
                        type: "option",
                        label: "Select all",
                        id: 'filter-opt-select-all',
                        value: true,
                    },

                    {
                        type: "label",
                        label: "By Status",
                    },
                ],
                callback: (val) => { },
                isIcon: true,
                icon: Icons.general.show_hide,
                isLabel: false,
                label: "",
                isIconLeft: false
            },
        ]
    }

    category_options.forEach((category, i) => {

        Filters.left[1].dropDownOptions.push(
            {
                type: "option",
                label: category.label,
                id: category.value,
                value: false,
            }
        )
        Filters.right[0].dropDownOptions.push(
            {
                type: "option",
                label: category.label,
                id: 'filter' + category.value,
                value: false,
            }
        )
    });
    headers.forEach((head, i) => {

        if (head.id == 'action' || head.id == 'select') return

        Filters.right[1].dropDownOptions.push(
            {
                type: "option",
                label: head.label,
                id: head.id,
                value: true,
            }
        )
    });


    const AddBtnOptions = [
        {
            icon: Icons.general.group,
            label: 'Category',
            type: 'category'
        },
        {
            icon: Icons.general.cost_code,
            label: 'Item',
            type: 'item'
        },
    ]

    const LoadSORTemplates = async (params) => {

        let response = await hospital_Handler.getSORTemplatesHandler(params || {})

        if (response && response.success) {
            let items = response.data

        }
    }
    const AddHeadCategoryPopup = () => {


        const [name, setName] = useState('')
        const [head_id, setHead_id] = useState('')
        const [head, setHead] = useState('')
        const [description, setDescription] = useState('')

        const [additionalNotes, setAdditionalNotes] = useState(false);
        const isExistItemData = existItemData && existItemData.id != undefined


        useEffect(() => {

            if (isExistItemData) {
                setName(existItemData.name || '')
                setHead_id(existItemData.head?.id || '')
                setHead(existItemData.head?.label || '')
                setDescription(existItemData.description || '')
            }

        }, [])

        const HandlePopupSubmit = async (e) => {
            e.preventDefault()

            let userdetials = JSON.parse(localStorage.getItem("userdetials"))

            let updated_data = {

                id: isExistItemData ? existItemData.id : Utils.getUniqueId(),
                name,
                head: {
                    id: head_id,
                    label: head
                },
                description,
                user_id: userdetials.id,
                hospital_id: userdetials.hospital_id
            }
            setIsLoading(true)
            let response = isExistItemData ? await hospital_Handler.updateSORCategoryHandler(updated_data) : await hospital_Handler.addSORCategoryHandler(updated_data)

            if (response.success) {
                LoadStoreData()
                setIsLoading(false)

            }
            else {
                setIsLoading(false)
                setWarningAlert(true)
                setApiFailedMessage(`${response.message}, Please try again!`)
            }

            setHeadCatgShowPopup(false)
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
                            setHeadCatgShowPopup(false)
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
                            <div className="label">{isExistItemData ? 'Save' : 'Add Item'}</div>
                        </button>
                    </div>
                </div>
            );
        };

        return (
            <div className="popup-container-main popup-container-center">
                <div className="popup-block-ui"></div>
                <form className="side-popup-container" onSubmit={(e) => {
                    HandlePopupSubmit(e)
                    setExistItemData({})
                }}>
                    <Popup_Header props={addBtnOption} />

                    <div className="sidebar-popup-content">
                        <div className="content-section">


                            <div className="content-item">
                                <TextInput
                                    props={{
                                        id: "sor-addcategory-name",
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
                                <SelectInput
                                    props={{
                                        id: "sor-addcategory-head",
                                        value: head_id,
                                        placeholder: '',
                                        options: head_options || [],
                                        setValue: (value, label) => {
                                            setHead_id(value)
                                            setHead(label)
                                        },
                                        isIcon: false,
                                        isLabel: true,
                                        isRequired: true,
                                        label: "Head",
                                    }}
                                />

                            </div>
                        </div>
                        <div className="content-section">
                            <div className="content-item">
                                <div id="sor-addcategory-description" className={`additional-item ${additionalNotes ? 'additional-item-active' : ''}`}>
                                    <div className="head" onClick={(e) => setAdditionalNotes(!additionalNotes)}>
                                        <div className="icon" dangerouslySetInnerHTML={{ __html: Icons.general.description }}></div>
                                        <div className="label">Description</div>
                                    </div>
                                    <div className="item-expanded">
                                        <ReactQuill
                                            theme="snow"
                                            value={description}
                                            onChange={(value) => setDescription(value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Popup_Footer props={addBtnOption} />
                </form>
            </div>
        )

    }
    const AddItemPopup = () => {

        const [price, setPrice] = useState(0)
        const [name, setName] = useState('')
        const [head_id, setHead_id] = useState('')
        const [head, setHead] = useState('')
        const [category_id, setCategory_id] = useState('')
        const [category, setCategory] = useState('')
        const [unit, setUnit] = useState('')
        const [unitrate, setUnitrate] = useState('')
        const [description, setDescription] = useState('')

        const [additionalNotes, setAdditionalNotes] = useState(false);

        const isExistItemData = existItemData && existItemData.id != undefined
        const isTemplate = existItemData && existItemData.isTemplate == true

        const [selectedHeadCategories, setSelectedHeadCategories] = useState([])


        const HandleSelectedCat = (headid) => {

            if (!headid) return setSelectedHeadCategories(category_options)

            let categories = category_options.filter(cat => cat.head.id == headid)
            setSelectedHeadCategories(categories)
        }

        useEffect(() => {

            HandleSelectedCat()

            if (isExistItemData) {
                setPrice(existItemData.unitrate || '')
                setName(existItemData.name || '')
                setHead_id(existItemData.head?.id || '')
                setHead(existItemData.head?.label || '')
                setCategory_id(existItemData.categories?.id || '')
                setCategory(existItemData.categories?.label || '')
                setUnit(existItemData.unit || '')
                setUnitrate(existItemData.unitrate || '')
                setDescription(existItemData.description || '')
            }

        }, [])

        const UpdateAWRWorks = async (sor_item) => {

            let { id, name, unit, unitrate } = sor_item

            let updated_awr_items = awr_items

            unitrate = parseFloat(unitrate || 0)

            awr_items.forEach((item, i) => {

                let MainQty = parseFloat(item.quantity || 0)

                if (Array.isArray(item.items_involved)) {

                    item.items_involved.forEach((itm, idx) => {

                        let { tax_value, markupType, markups_value, quantity } = itm

                        quantity = parseFloat(itm.quantity || 0)

                        let final_amount = 0

                        if (itm.sor_item_id == id) {

                            const tax_amount = (parseFloat((unitrate * (MainQty * quantity)) || 0) * parseFloat(tax_value)) / 100
                            const markups_amount = markupType == '%' ? (parseFloat((unitrate * (MainQty * quantity)) || 0) * parseFloat(markups_value)) / 100 : parseFloat(markups_value)
                            const price = (unitrate * (MainQty * quantity)) + tax_amount + markups_amount

                            updated_awr_items[i].items_involved[idx].sor_item_name = name
                            updated_awr_items[i].items_involved[idx].unit = unit
                            updated_awr_items[i].items_involved[idx].unitrate = unitrate
                            updated_awr_items[i].items_involved[idx].prime_cost = (MainQty * quantity) * unitrate
                            updated_awr_items[i].items_involved[idx].tax_amount = tax_amount
                            updated_awr_items[i].items_involved[idx].markups_amount = markups_amount
                            updated_awr_items[i].items_involved[idx].final_amount = price

                            final_amount += price

                        }

                        updated_awr_items[i].final_amount = final_amount || 0

                    })

                }
            })

            let response = await hospital_Handler.updateAWRItemsHandler(updated_awr_items)

            if (response.success) return response

            // awr_items
        }

        const HandlePopupSubmit = async (e) => {
            e.preventDefault()

            let userdetials = JSON.parse(localStorage.getItem("userdetials"))

            let updated_data = {

                id: isExistItemData ? existItemData.id : Utils.getUniqueId(),
                name: name,
                category: {
                    id: category_id,
                    label: category
                },
                head: {
                    id: head_id,
                    label: head,
                },
                unit,
                unitrate,
                description,
                hospital_id: userdetials.hospital_id,
                user_id: userdetials.id,
            }
            setIsLoading(true)

            let response = isExistItemData ? await hospital_Handler.updateSORItemHandler(updated_data) : await hospital_Handler.addSORItemHandler(updated_data)

            let awr_response = await UpdateAWRWorks(updated_data)

            if (response.success && awr_response.success) {
                LoadStoreData()
                setIsLoading(false)

            }
            else {
                setIsLoading(false)
                setWarningAlert(true)
                setApiFailedMessage(`${response.message}, Please try again!`)
            }

            setItemShowPopup(false)
        }

        const Popup_Header = ({ props }) => {

            const { icon, label } = props
            return (
                <div className="side-popup-header">
                    <div className="header-item-select">
                        <div className="header-item-select-content">
                            <span className="icon" dangerouslySetInnerHTML={{ __html: icon }}></span>
                            <div className="label">{isTemplate ? 'Template' : isExistItemData ? 'Update' : 'Add'} {label}</div>

                        </div>
                    </div>
                    <div
                        className="header-item-close"
                        onClick={(e) => {
                            setItemShowPopup(false)
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
                            <div className="label">{label} Price</div>
                            <div className="value">{currency_type}{price || '0.00'}</div>
                        </div>
                        {!isTemplate ?
                            <button
                                className="action-btn"
                                type='submit'
                            >
                                <div className="icon" dangerouslySetInnerHTML={{ __html: isExistItemData ? Icons.general.save : Icons.general.add_btn }}></div>
                                <div className="label">{isExistItemData ? 'Save' : 'Add Item'}</div>
                            </button>
                            : ''}
                    </div>
                </div>
            );
        };



        return (
            <div className="popup-container-main popup-container-center">
                <div className="popup-block-ui"></div>
                <form className="side-popup-container" onSubmit={(e) => {
                    HandlePopupSubmit(e)
                    setExistItemData({})
                }}>
                    <Popup_Header props={addBtnOption} />

                    <div className="sidebar-popup-content">
                        <div className="content-section">

                            <div className="content-item">
                                <TextInput
                                    props={{
                                        id: "sor-additem-name",
                                        value: name,
                                        placeholder: '',
                                        setValue: (value) => setName(value),
                                        isIcon: false,
                                        isLabel: true,
                                        isRequired: true,
                                        label: "Name",
                                        readOnly: isTemplate,
                                    }}
                                />
                            </div>
                            <div className="content-item">
                                <SelectInput
                                    props={{
                                        id: "sor-additem-head",
                                        value: head_id,
                                        placeholder: '',
                                        options: head_options || [],
                                        setValue: (value, label) => {
                                            setHead_id(value)
                                            setHead(label)
                                            HandleSelectedCat(value)
                                        },
                                        isIcon: false,
                                        isLabel: true,
                                        isRequired: true,
                                        readOnly: isTemplate,
                                        label: "Head",
                                    }}
                                />
                            </div>
                            <div className="content-item">
                                <SelectInput
                                    props={{
                                        value: category_id,
                                        id: "sor-additem-category",
                                        placeholder: '',
                                        options: selectedHeadCategories || [],
                                        setValue: (value, label) => {
                                            setCategory_id(value)
                                            setCategory(label)
                                        },
                                        isIcon: false,
                                        isLabel: true,
                                        readOnly: isTemplate,
                                        isRequired: true,
                                        label: "Category",
                                    }}
                                />
                            </div>
                            <div className="content-item">
                                <div className="content-sub-item">
                                    <SelectInput
                                        props={{
                                            id: "sor-additem-unit",
                                            value: unit,
                                            placeholder: '',
                                            options: unit_options || [],
                                            setValue: (value) => setUnit(value),
                                            isIcon: false,
                                            isLabel: true,
                                            readOnly: isTemplate,
                                            isRequired: true,
                                            label: "Unit type",
                                        }}
                                    />
                                </div>
                                <div className="content-sub-item">
                                    <CostInput
                                        props={{
                                            id: "sor-additem-unitrate",
                                            value: unitrate,
                                            isCostMethod: false,
                                            currency_type: currency_type,
                                            placeholder: '',
                                            setValue: (value) => {
                                                setUnitrate(value)
                                                setPrice(value)
                                            },
                                            isIcon: true,
                                            icon: currency_type,
                                            readOnly: isTemplate,
                                            isLabel: true,
                                            isRequired: true,
                                            label: "Unit rate",
                                        }}
                                    />
                                </div>
                            </div>

                        </div>
                        {!isTemplate ?
                            <div className="content-section">
                                <div className="content-item">
                                    <div className={`additional-item ${additionalNotes ? 'additional-item-active' : ''}`}>
                                        <div className="head" onClick={(e) => setAdditionalNotes(!additionalNotes)}>
                                            <div className="icon" dangerouslySetInnerHTML={{ __html: Icons.general.description }}></div>
                                            <div className="label">Description</div>
                                        </div>
                                        <div className="item-expanded">
                                            <ReactQuill
                                                theme="snow"
                                                value={description}
                                                onChange={(value) => setDescription(value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            : ''}
                    </div>

                    <Popup_Footer props={addBtnOption} />
                </form>
            </div>
        )

    }

    const HandleAddBtn = (e) => {


        setIsAddBtnClicked(true)

        let items_parent = document.querySelector('#settingsContent-sor-addbtn')

        window.addEventListener('click', (e) => {

            let path = e.path || (e.composedPath && e.composedPath());

            if (Array.isArray(path) && !path.includes(items_parent))
                setIsAddBtnClicked(false)
        })
    }
    const HandleAddBtnOption = (option) => {

        setAddBtnOption(option)

        if (option.type == 'item') setItemShowPopup(true)
        if (option.type == 'head' || option.type == 'category') setHeadCatgShowPopup(true)


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
            type: type,
            hospital_id: userdetials.hospital_id,
            user_id: userdetials.id,
        }
        setIsLoading(true)
        let response = await hospital_Handler.deleteSORItemHandler(updated_data)

        if (response.success) {
            LoadStoreData()
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

    const LoadSORItems = async () => {

        let _items = [...items]

        if (Array.isArray(sor_categories)) {

            let categories = sor_categories.map((itm, i) => {
                return {
                    id: itm.id,
                    parentId: itm.head.id,
                    hasAction: true,
                    order: (i + 1),
                    path: [],
                    itemChildren: [],
                    name: itm.name,
                    isSelected: false,
                    isSelectOption: true,
                    status: "COMPLETE",
                    type: "GROUP",
                    unit: null,
                    unitrate: null,
                    action: true,
                    description: itm.description,
                    head: itm.head,
                    categories: null
                }
            })

            _items.push(...categories)

            setItems(_items)
        }
        if (Array.isArray(sor_items)) {

            let __items = [...sor_items, ...sor_templates].map((itm, i) => {
                return {
                    id: itm.id,
                    hasAction: true,
                    parentId: itm.category.id,
                    order: (i + 1),
                    path: [],
                    itemChildren: [],
                    name: itm.name,
                    isSelected: false,
                    isSelectOption: true,
                    status: "COMPLETE",
                    type: "ITEM",
                    unit: itm.unit,
                    unitrate: itm.unitrate,
                    action: true,
                    description: itm.description,
                    head: itm.head,
                    categories: itm.category,
                    isTemplate: itm.isTemplate || false,
                    templateLabel: itm.isTemplate ? "T" : "",
                }
            })

            _items.push(...__items)

        }
        setItems(_items)

    }

    useEffect(() => {
        let loadItems = async () => await LoadSORItems()
        loadItems()
    }, [])


    useEffect(() => {

    }, [items])

    const getDeleteMessage = (type) => {

        if (type == "GROUP") return `Are you sure you want to delete the Group? Items included in the group will be deleted accordingly.`
        else if (type == "WORK") return `Are you sure you want to delete the Work?`
        else if (type == "ITEM") return `Are you sure you want to delete the Item?`
        else return "Are you sure you want to delete?"
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
                <div className="settingsContent-editview-main">

                    {deleteItemAlert ?

                        <AlertPopup
                            props={{
                                type: "delete",
                                actionBtnOption: { icon: Icons.general.btn_delete, label: "Yes, Delete" },
                                heading: "Delete project",
                                message: getDeleteMessage(deleteItemType),
                                callback: (confirmation) => HandleDeleteConfirmItem(deleteItemId, deleteItemType, confirmation)
                            }} />

                        : null}

                    {itemShowPopup ? <AddItemPopup /> : null}
                    {headCatgShowPopup ? <AddHeadCategoryPopup /> : null}

                    <div className="settingsContent-content-header">
                        <div className="settingsContent-content-section">
                            <div className="settingsContent-content-title">Schedule of Rates</div>
                        </div>
                        <div className="settingsContent-content-section">
                            <div
                                className="settingsContent-content-btn"
                                onClick={(e) => HandleAddBtn(e)}
                                id="settingsContent-sor-addbtn"
                            >
                                <div
                                    className="icon"
                                    dangerouslySetInnerHTML={{ __html: Icons.general.add_active }}
                                ></div>
                                <div className="label">Add Item</div>

                                <div id="settingsContent-content-btn-options" className={`settingsContent-content-btn-options ${isAddBtnClicked ? 'settingsContent-content-btn-options-active' : ''}`}>

                                    {AddBtnOptions.map((option, i) => (
                                        <div
                                            key={i}
                                            className="btn-option-item"
                                            onClick={(e) => HandleAddBtnOption(option)}
                                        >
                                            <div
                                                className="icon"
                                                dangerouslySetInnerHTML={{ __html: option.icon }}
                                            ></div>
                                            <div className="label">{option.label}</div>
                                        </div>
                                    ))}

                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="settingsContent-editview-content">
                        <WorkSheet props={{
                            Header: headers,
                            Items: items,
                            isStepper: true,
                            isFilters: true,
                            Filters: Filters,
                            openSidebar: (item, type) => {


                                let add_option = item.type == 'GROUP' ? AddBtnOptions[0] : item.type == 'ITEM' ? AddBtnOptions[1] : {}
                                if (add_option) setAddBtnOption(add_option)

                                setExistItemData(item)
                                if (type == 'ITEM') setItemShowPopup(true)
                                else if (type == "GROUP") setHeadCatgShowPopup(true)
                            },
                            openEditView: (item, type) => {

                                let add_option = item.type == 'GROUP' ? AddBtnOptions[0] : item.type == 'ITEM' ? AddBtnOptions[1] : {}
                                if (add_option) setAddBtnOption(add_option)

                                setExistItemData(item)
                                if (type == 'ITEM') setItemShowPopup(true)
                                else if (type == "GROUP") setHeadCatgShowPopup(true)
                            },
                            deleteOption: async (item) => await HandleDeleteItem(item)
                        }} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default SOR;
