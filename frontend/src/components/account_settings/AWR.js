import React, { useEffect, useState, useRef, useDeferredValue } from 'react'
import ReactQuill from 'react-quill';
import { useSelector, useDispatch } from 'react-redux'
import 'react-quill/dist/quill.snow.css';

import Utils from '../../utils'
import Images from '../../assets/Images'
import Icons from '../../assets/Icons'
import UserAction from '../../redux/action/userAction'
import StoreHandler from '../../redux/StoreHandler'

import { CostInput, TextInput, QuantityInput, SelectInput, RadioInput } from '../Inputs'
import WorkSheet from '../worksheets/worksheets'
import AlertPopup from '../AlertPopup'
import Loading from '../Loading'

import hospital_Handler from '../../Handlers/hospital/hospital'

const AWR = () => {

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

    const finance_settings = store.user ? store.user.hospital.finance_settings : undefined
    const field_settings = store.user ? store.user.hospital.field_settings : undefined
    const sor_categories = store.user ? store.user.hospital.sor_categories || [] : undefined
    let sor_items = store.user ? store.user.hospital.sor_items || [] : []
    const sor_templates = store.user ? store.user.sor_templates || [] : []
    sor_items = [...sor_items, ...sor_templates]
    const awr_items = store.user ? store.user.hospital.awr_items || [] : undefined

    console.log(awr_items, 'awr_items');

    const hospitalSettingsProfile = store.user ? store.user.hospital.settings : undefined

    const currency_type = hospitalSettingsProfile ? hospitalSettingsProfile.currency || "₹" : "₹"

    const unit_options = field_settings ? field_settings.units.map(unit => {
        return {
            value: unit.name,
            label: unit.name
        }
    }) : []
    const taxes_options = finance_settings ? finance_settings.taxes.map(unit => {
        return {
            value: unit.value,
            label: unit.name,
        }
    }) : []
    const insurances_options = finance_settings ? finance_settings.insurances.map(unit => {
        return {
            value: unit.name,
            label: unit.name
        }
    }) : []
    const markups_options = finance_settings ? finance_settings.markups.map(unit => {
        return {
            value: unit.value,
            label: unit.name,
            type: unit.value_type
        }
    }) : []
    const sor_items_options = sor_items ? sor_items.map(item => {
        return {
            value: item.id,
            label: item.name,
            type: item.head.id
        }
    }) : []

    const [itemShowPopup, setItemShowPopup] = useState(false)
    const [headers, setHeaders] = useState([
        {
            label: "Workcode",
            id: "workcode",
            active: true,
            isID: true,
            isLeft: true,
        },
        {
            label: "Name",
            id: "name",
            dropdown: false,
            isLeft: true,
            active: true,
        },

        {
            label: "Quantity",
            id: "quantity",
            active: true,
        },
        {
            label: "Unit",
            id: "unit",
            active: true,
        },
        {
            label: "Tax",
            id: "tax_amount",
            active: true,
        },
        {
            label: "Markups",
            id: "markups_amount",
            active: true,
        },

        {
            label: "Amount",
            id: "final_amount",
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
    const [existItemData, setExistItemData] = useState({})

    const [deleteItemId, setDeleteItem] = useState(null)
    const [deleteItemType, setDeleteItemType] = useState(null)
    const [deleteItemAlert, setDeleteItemAlert] = useState(false)

    const Filters = {
        left: [
            {
                id: "awr-worksheetfilter-multiselect",
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
                        callback: (val) => { }
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
    headers.forEach((head, i) => {

        if (head.id == 'action' || head.id == 'select') return

        Filters.right[0].dropDownOptions.push(
            {
                type: "option",
                label: head.label,
                id: head.id,
                value: true,
            }
        )
    });
    const saveEvent = (e) => {
        e.preventDefault()

    }
    const AddItemPopup = () => {

        const [price, setPrice] = useState(0)
        const [totalTaxes, setTotalTaxes] = useState(0)
        const [totalMarkups, setTotalMarkups] = useState(0)
        const [code, setCode] = useState('')
        const [name, setName] = useState('')
        const [unit, setUnit] = useState('')
        const [quantity, setQuantity] = useState('')
        const [description, setDescription] = useState('')

        const [sideItemShowPopup, setSideItemShowPopup] = useState(false)
        const [sideItemType, setSideItemType] = useState('add')
        const [sideItemHeader, setSideItemHeader] = useState({})
        const [sideItemExistDetials, setSideItemExistDetials] = useState({})
        const [AWR_Items, setAWR_Items] = useState([]);
        const [additionalNotes, setAdditionalNotes] = useState(false);

        const isExistItemData = existItemData && existItemData.id != undefined


        const getNextWorkcode = async () => {

            let userdetials = JSON.parse(localStorage.getItem("userdetials"))

            let update_data = {
                hospital_id: userdetials.hospital_id,
                user_id: userdetials.id,
            }
            let response = await hospital_Handler.getNextWorkcodeHandler(update_data)

            if (response.success) {

                let { workcode } = response.data
                setCode(workcode || '')
            }
            else {

            }
        }

        useEffect(() => {

            if (isExistItemData) {

                setCode(existItemData.workcode || '')
                setName(existItemData.name || '')
                setUnit(existItemData.unit || '')
                setQuantity(existItemData.quantity || '')
                setAWR_Items(existItemData.items_involved || [])
                setDescription(existItemData.description || '')
            }
            else {
                getNextWorkcode()
            }

        }, [])

        const AddItemSidePopup = ({ props }) => {

            let { type, header_option, existingData = undefined, setValue, MainQty } = props

            MainQty = MainQty || 0

            const [SORItem_id, setSORItem_id] = useState(existingData ? existingData.sor_item_id || "" : '')
            const [SORItem_name, setSORItem_name] = useState(existingData ? existingData.sor_item_name || "" : '')
            const [quantity, setQuantity] = useState(existingData ? existingData.quantity || 0 : 0)
            const [unit, setUnit] = useState(existingData ? existingData.unit || '' : '')
            const [unitrate, setUnitrate] = useState(existingData ? existingData.unitrate || 0 : 0)
            const [tax_option, setTaxOption] = useState(existingData ? existingData.tax_id || '' : '')
            const [tax, setTax] = useState(existingData ? existingData.tax_value || 0 : 0)
            const [markups_option, setMarkupsOption] = useState(existingData ? existingData.markups_id || '' : '')
            const [markups, setMarkups] = useState(existingData ? existingData.markups_value || 0 : 0)
            const [markupType, setMarkupType] = useState(existingData ? existingData.markupType || '%' : '%')
            const [description, setDescription] = useState(existingData ? existingData.description || '' : '')

            const [additionalNotes, setAdditionalNotes] = useState(false);

            const unti_tax = (parseFloat((unitrate * (MainQty * quantity)) || 0) * parseFloat(tax)) / 100
            const unti_markup = markupType == '%' ? (parseFloat((unitrate * (MainQty * quantity)) || 0) * parseFloat(markups)) / 100 : parseFloat(markups)

            const price = (unitrate * (MainQty * quantity)) + unti_tax + unti_markup

            const HandlePopupSubmit = (e) => {
                e.preventDefault()

                let popup_data = {
                    id: existingData && existingData.id ? existingData.id : Utils.getUniqueId(),
                    sor_item_id: SORItem_id,
                    sor_item_name: SORItem_name,
                    unit: unit,
                    unitrate: unitrate,
                    quantity: quantity,
                    prime_cost: (MainQty * quantity) * unitrate,

                    tax_id: tax_option,
                    tax_value: tax,
                    tax_amount: unti_tax,

                    markups_id: markups_option,
                    markups_value: markups,
                    markupType: markupType,
                    markups_amount: unti_markup,

                    description,
                    type: header_option.type,
                    final_amount: price
                }

                setValue(popup_data, type)

                setSideItemExistDetials({})
                setSideItemHeader({})
            }

            const Popup_Header = ({ props }) => {

                const { icon, label } = props
                return (
                    <div className="side-popup-header">
                        <div className="header-item-select">
                            <div className="header-item-select-content">
                                <span className="icon" dangerouslySetInnerHTML={{ __html: icon }}></span>
                                <div className="label">{type == 'edit' ? 'Edit' : 'Add'} Work {label}</div>
                            </div>
                        </div>
                        <div
                            className="header-item-close"
                            onClick={(e) => {
                                setSideItemShowPopup(false)
                                setSideItemExistDetials({})
                                setSideItemHeader({})
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
                                <div className="label">Price</div>
                                <div className="value">{currency_type}{parseFloat(price || 0).toFixed(2) || '0.00'}</div>
                            </div>
                            <button
                                className="action-btn"
                                type='submit'
                            >
                                {type == 'edit' ?
                                    <>
                                        <div className="icon" dangerouslySetInnerHTML={{ __html: Icons.general.save }}></div>
                                        <div className="label">Save</div>
                                    </>
                                    :
                                    <>
                                        <div className="icon" dangerouslySetInnerHTML={{ __html: Icons.general.add_btn }}></div>
                                        <div className="label">Add Item</div>
                                    </>
                                }

                            </button>
                        </div>
                    </div>
                );
            };

            const HandleSOR_Select = (value, label) => {

                setSORItem_id(value)
                setSORItem_name(label)

                let sor_item = sor_items.filter(s => s.id == value)[0]

                if (!sor_item) return

                setTimeout(() => {
                    setUnit(sor_item.unit)
                    setUnitrate(parseFloat(sor_item.unitrate))
                }, 0)
            }
            const head_sor_items = sor_items_options.filter((s, i) => s.type == header_option.type)
            return (
                <div className="popup-container-main">
                    <div className="popup-block-ui"></div>
                    <form className="side-popup-container" onSubmit={HandlePopupSubmit}>
                        <Popup_Header props={header_option} />

                        <div className="sidebar-popup-content">
                            <div className="content-section">

                                <div className="content-item">

                                    <SelectInput
                                        props={{
                                            value: SORItem_id,
                                            placeholder: '',
                                            alsoTypeValue: true,
                                            options: head_sor_items || [],
                                            setValue: (value, label) => HandleSOR_Select(value, label),
                                            isIcon: false,
                                            isLabel: true,
                                            isRequired: true,
                                            label: "Schedule Item",
                                            id: "work-general-info-item-soritem"
                                        }}
                                    />

                                </div>

                                <div className="content-item">
                                    <QuantityInput
                                        props={{
                                            parentQty: String(MainQty),
                                            actionType: "multiple",
                                            value: String(quantity),
                                            placeholder: '',
                                            setValue: (value) => setQuantity(parseFloat(value)),
                                            isIcon: false,
                                            isLabel: true,
                                            isRequired: true,
                                            label: "Quantity (Main Qty x Work Quantity)",
                                            id: "work-general-info-item-quantity"
                                        }}
                                    />
                                </div>
                                <div className="content-item">
                                    <div className="content-sub-item">
                                        <SelectInput
                                            props={{
                                                id: "work-general-info-item-unittype",
                                                value: unit,
                                                placeholder: '',
                                                options: unit_options || [],
                                                setValue: (value) => setUnit(value),
                                                isIcon: false,
                                                readOnly: true,
                                                isLabel: true,
                                                isRequired: true,
                                                label: "Unit type",

                                            }}
                                        />
                                    </div>
                                    <div className="content-sub-item">
                                        <CostInput
                                            props={{
                                                value: unitrate,
                                                isCostMethod: false,
                                                readOnly: true,
                                                currency_type: currency_type,
                                                placeholder: '',
                                                setValue: (value) => {
                                                    setUnitrate(parseFloat(value) || 0)
                                                },
                                                isIcon: true,
                                                icon: currency_type,
                                                isLabel: true,
                                                isRequired: true,
                                                label: "Unit rate",
                                                id: "work-general-info-item-unitrate"
                                            }}
                                        />
                                    </div>
                                </div>

                            </div>
                            <div className="content-section">
                                <div className="content-section-header">
                                    <div className="label">Pricing</div>
                                </div>

                                <div className="content-section-header">
                                    <div className="label">Tax</div>
                                    <div className="input">
                                        <select
                                            name=""
                                            id=""
                                            onInput={(e) => {
                                                setTax(parseFloat(e.target.value || 0))
                                                setTaxOption(e.target.value)
                                            }}
                                            value={tax_option}
                                        >
                                            {taxes_options.map((tax, i) => (
                                                <option value={`${tax.value}`}>{tax.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="content-item">
                                    <div className="content-sub-item">
                                        <CostInput
                                            props={{
                                                value: tax,
                                                isCostMethod: false,
                                                placeholder: '',
                                                currency_type: currency_type,
                                                setValue: (value) => {
                                                    setTax(parseFloat(value) || 0)
                                                },
                                                isIcon: true,
                                                icon: '%',
                                                isLabel: true,
                                                isRequired: true,
                                                label: "Tax",
                                                id: "work-general-info-item-tax"
                                            }}
                                        />
                                    </div>
                                    <div className="content-sub-item content-sub-label-item">
                                        <div className="content-sub-label-content">
                                            <div className="label">Unit tax</div>
                                            <div className="value">{currency_type}{unti_tax}</div>
                                        </div>
                                    </div>

                                </div>

                                <div className="content-section-header">
                                    <div className="label">Markup</div>
                                    <div className="input">
                                        <select
                                            name=""
                                            id=""
                                            onInput={(e) => {
                                                setMarkups(parseFloat(e.target.value || 0))
                                                setMarkupsOption(e.target.value)

                                                let item = markups_options.filter(itm => itm.value == e.target.value)[0]
                                                if (item) setMarkupType(item.type)
                                            }}
                                            value={markups_option}
                                        >
                                            {markups_options.map((tax, i) => (
                                                <option value={`${tax.value}`}>{tax.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="content-item">
                                    <div className="content-sub-item">
                                        <CostInput
                                            props={{
                                                value: markups,
                                                isCostMethod: true,
                                                currency_type: currency_type,
                                                costMethodValue: markupType,
                                                placeholder: 'Unit cost',
                                                setValue: (value, type) => {
                                                    setMarkups(parseFloat(value) || 0)
                                                    if (type) setMarkupType(type)
                                                },
                                                isIcon: true,
                                                icon: '%',
                                                isLabel: true,
                                                isRequired: true,
                                                label: "Markup",
                                                id: "work-general-info-item-markup"
                                            }}
                                        />
                                    </div>
                                    <div className="content-sub-item content-sub-label-item">
                                        <div className="content-sub-label-content">
                                            <div className="label">Unit markup</div>
                                            <div className="value">{currency_type}{unti_markup}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                        </div>

                        <Popup_Footer props={header_option} />
                    </form>
                </div>
            )

        }

        const getItemIcon = (type) => {
            if (!type) return Icons.general.cost_code

            if (type == "labour") return Icons.general.manpower
            else if (type == "material") return Icons.general.material
            else if (type == "machine") return Icons.general.machines
        }

        const HandlePopupSubmit = async (e) => {
            e.preventDefault()

            let userdetials = JSON.parse(localStorage.getItem("userdetials"))
            let updated_data = {

                id: isExistItemData ? existItemData.id : Utils.getUniqueId(),
                name,
                workcode: code,
                quantity,
                unit,
                final_amount: price,
                items_involved: AWR_Items,
                description,
                user_id: userdetials.id,
                hospital_id: userdetials.hospital_id
            }
            setIsLoading(true)
            let response = isExistItemData ? await hospital_Handler.updateAWRItemHandler(updated_data) : await hospital_Handler.addAWRItemHandler(updated_data)

            if (response.success) {
                LoadStoreData()
                setIsLoading(false)

            }
            else {
                setIsLoading(false)
                setWarningAlert(true)
                setApiFailedMessage(`${response.message}, Please try again!`)
            }

            setItemShowPopup(false)
            setAWR_Items([])
        }

        const Popup_Header = ({ props }) => {

            return (
                <div className="side-popup-header">
                    <div className="header-item-select">
                        <div className="header-item-select-content">
                            <span className="icon" dangerouslySetInnerHTML={{ __html: Icons.general.work }}></span>
                            <div className="label">{isExistItemData ? 'Update' : 'Add'} Work</div>
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

            return (
                <div className="sidebar-popup-footer">
                    <div className="footer-item action-items">
                        <div className="footer-item-left">

                            <div className="action-preview">
                                <div className="label">Work Price</div>
                                <div className="value">{currency_type}{parseFloat(price || 0).toFixed(2)}</div>
                            </div>
                            <div className="action-preview">
                                <div className="label">Total Taxes</div>
                                <div className="value">{currency_type}{parseFloat(totalTaxes || 0).toFixed(2)}</div>
                            </div>
                            <div className="action-preview">
                                <div className="label">Total Markups</div>
                                <div className="value">{currency_type}{parseFloat(totalMarkups).toFixed(2) || '0.00'}</div>
                            </div>
                        </div>
                        <button
                            className="action-btn"
                            type='submit'
                        >
                            <div className="icon" dangerouslySetInnerHTML={{ __html: Icons.general.save }}></div>
                            <div className="label">Save</div>
                        </button>
                    </div>
                </div>
            );
        };

        const HandleAddWorkItem = (type) => {

            setSideItemHeader({
                icon: getItemIcon(type),
                label: type,
                type: type

            })

            setSideItemType('add')
            setSideItemShowPopup(true)

        }
        const HandleRemoveWorkItem = (index) => {
            let _AWR_Items = [...AWR_Items]

            if (_AWR_Items.length) _AWR_Items.splice(index, 1)

            setAWR_Items(_AWR_Items)
        }
        const HandleOpenItem = (item, index) => {

            setSideItemHeader({
                icon: Icons.general.manpower,
                label: item.sor_item_name,
                type: item.type

            })
            setSideItemType('edit')
            setSideItemExistDetials(item)

            setSideItemShowPopup(true)
        }
        const HandleCreateWorkItem = (data, type = 'add') => {

            if (type == 'add') setAWR_Items([...AWR_Items, data])
            else if (type == 'edit') {

                let _items = [...AWR_Items]

                let exist_item_index = _items.findIndex(itm => itm.id == data.id)

                console.log(exist_item_index, data, 'exist_item_index');

                if (exist_item_index != -1) {
                    _items[exist_item_index] = data
                    setAWR_Items(_items)
                }
            }
            setSideItemShowPopup(false)
        }
        const HandleQuantityChange = (value) => {

            setQuantity(value)

            let _items = [...AWR_Items]

            let mainQty = parseInt(value) || 0

            if (Array.isArray(_items) && _items.length) {

                let __items = _items.map((itm, i) => {

                    itm.prime_cost = (mainQty * itm.quantity) * itm.unitrate
                    itm.tax_amount = itm.tax_value ? parseFloat((mainQty * itm.quantity) * itm.unitrate) / parseFloat(itm.tax_value) / 100 : 0
                    itm.markups_amount = itm.markups_value ? itm.markupType == '%' ? (parseFloat((itm.unitrate * (mainQty * itm.quantity)) || 0) * parseFloat(itm.markups_value)) / 100 : parseFloat(itm.markups_value) : 0
                    itm.final_amount = (itm.unitrate * (mainQty * itm.quantity)) + itm.tax_amount + itm.markups_amount

                    return itm
                })

                setAWR_Items(__items)
            }

        }

        useEffect(() => {

            let _items = [...AWR_Items]


            let _total = _items.reduce((prev, val, i) => {
                return {
                    price: prev.price + parseFloat(val.final_amount),
                    markups: prev.markups + parseFloat(val.tax_amount),
                    taxes: prev.taxes + parseFloat(val.markups_amount),
                }

            }, {
                price: 0,
                markups: 0,
                taxes: 0
            })

            setPrice(_total.price)
            setTotalTaxes(_total.markups)
            setTotalMarkups(_total.taxes)

        }, [AWR_Items])

        return (
            <>
                <div className="popup-container-main popup-container-scroll-center">
                    <div className="popup-block-ui"></div>
                    <form className="side-popup-container" onSubmit={(e) => {
                        HandlePopupSubmit(e)
                        setExistItemData({})
                    }}>
                        <Popup_Header />

                        <div className="sidebar-popup-content">

                            <div className="content-section-title">GENERAL INFO</div>
                            <div className="content-section content-top-main">

                                <div className="content-top-items">

                                    <div className="content-item">
                                        <TextInput
                                            props={{
                                                value: name,
                                                placeholder: '',
                                                setValue: (value) => setName(value),
                                                isIcon: false,
                                                isLabel: true,
                                                isRequired: true,
                                                label: "Name",
                                                id: "work-general-info-name"
                                            }}
                                        />
                                    </div>
                                    <div className="content-item">
                                        <TextInput
                                            props={{
                                                value: code,
                                                placeholder: '',
                                                setValue: (value) => setCode(value),
                                                isIcon: false,
                                                isLabel: true,
                                                readOnly: true,
                                                isRequired: true,
                                                label: "Work Code",
                                                id: "work-general-info-workcode"
                                            }}
                                        />
                                    </div>
                                    <div className="content-item">
                                        <TextInput
                                            props={{
                                                value: quantity,
                                                placeholder: '',
                                                setValue: (value) => HandleQuantityChange(value),
                                                isIcon: false,
                                                isLabel: true,
                                                isRequired: true,
                                                label: "Quantity",
                                                id: "work-general-info-quantity"
                                            }}
                                        />
                                    </div>
                                    <div className="content-item">
                                        <SelectInput
                                            props={{
                                                id: "work-general-info-unittype",
                                                value: unit,
                                                placeholder: '',
                                                options: unit_options || [],
                                                setValue: (value) => setUnit(value),
                                                isIcon: false,
                                                isLabel: true,
                                                isRequired: true,
                                                label: "Unit type",

                                            }}
                                        />

                                    </div>
                                </div>

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

                            <div className="content-section-title">WORK ITEMS</div>
                            <div className="content-section content-section-items">
                                {AWR_Items.map((item, index) => (

                                    <div className="content-section-item" key={index} onClick={(e) => HandleOpenItem(item, index)}>
                                        <div className="left">
                                            <div
                                                className="icon"
                                                dangerouslySetInnerHTML={{ __html: getItemIcon(item.type) }}
                                            ></div>
                                            <div className="detials">
                                                <div className="title">{item.sor_item_name}</div>
                                                <div className="desc">
                                                    <div className="label">Quantity</div>
                                                    <div className="value">{item.quantity} {item.sor_item_unit}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="right">
                                            <div className="right-items">
                                                <div className="right-item">
                                                    <div className="label">Prime Cost</div>
                                                    <div className="value">{currency_type}{parseFloat(item.prime_cost || 0).toFixed(2)}</div>
                                                </div>
                                                <div className="right-item">
                                                    <div className="label">Markup</div>
                                                    <div className="value">{currency_type}{parseFloat(item.markups_amount || 0).toFixed(2)}</div>
                                                </div>
                                                <div className="right-item">
                                                    <div className="label">Tax</div>
                                                    <div className="value">{currency_type}{parseFloat(item.tax_amount || 0).toFixed(2)}</div>
                                                </div>
                                                <div className="right-item">
                                                    <div className="label">Final Amount</div>
                                                    <div className="value">{currency_type}{parseFloat(item.final_amount || 0).toFixed(2)}</div>
                                                </div>
                                            </div>
                                            <div className="right-action">
                                                <div className="right-action-item">
                                                    <div
                                                        className="icon"
                                                        dangerouslySetInnerHTML={{ __html: Icons.general.delete }}
                                                        onClick={(e) => HandleRemoveWorkItem(index)}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                        </div>
                        <div className="content-addbtn-items">
                            <div
                                className="content-addbtn-item"
                                onClick={(e) => HandleAddWorkItem('labour')}
                            >
                                <div className="content">
                                    <div
                                        className="icon"
                                        dangerouslySetInnerHTML={{ __html: Icons.general.manpower }}
                                    ></div>
                                    <div className="label">Add Labor</div>
                                </div>
                            </div>
                            <div
                                className="content-addbtn-item"
                                onClick={(e) => HandleAddWorkItem('material')}
                            >
                                <div className="content">
                                    <div
                                        className="icon"
                                        dangerouslySetInnerHTML={{ __html: Icons.general.material }}
                                    ></div>
                                    <div className="label">Add Materials</div>
                                </div>
                            </div>
                            <div
                                className="content-addbtn-item"
                                onClick={(e) => HandleAddWorkItem('machine')}
                            >
                                <div className="content">
                                    <div
                                        className="icon"
                                        dangerouslySetInnerHTML={{ __html: Icons.general.machines }}
                                    ></div>
                                    <div className="label">Add Machines</div>
                                </div>
                            </div>

                        </div>
                        <Popup_Footer />
                    </form>
                </div>
                {sideItemShowPopup ? <AddItemSidePopup props={{
                    type: sideItemType,
                    header_option: sideItemHeader,
                    setValue: HandleCreateWorkItem,
                    existingData: sideItemExistDetials,
                    MainQty: quantity || 0
                }} /> : null}
            </>
        )

    }
    const HandleAddBtn = (e) => {

        setItemShowPopup(true)
    }
    const HandleDeleteItem = async (item) => {

        setDeleteItem(item.id)
        setDeleteItemType("WORK")
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
            hospital_id: userdetials.hospital_id,
            user_id: userdetials.id,
        }
        setIsLoading(true)
        let response = await hospital_Handler.deleteAWRItemHandler(updated_data)

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


    useEffect(() => {

        let _items = [...items]

        if (Array.isArray(awr_items)) {

            let work = awr_items.map((itm, i) => {

                let tax_amount = itm.items_involved.reduce((prev, val) => prev + val.tax_amount, 0)
                let markups_amount = itm.items_involved.reduce((prev, val) => prev + val.markups_amount, 0)

                return {
                    id: itm.id,
                    parentId: null,
                    hasAction: true,
                    order: (i + 1),
                    path: [],
                    itemChildren: [],
                    name: itm.name,
                    isSelected: false,
                    isSelectOption: true,
                    status: "COMPLETE",
                    type: "GROUP",
                    isAWR: true,
                    unit: itm.unit,
                    workcode: itm.workcode,
                    quantity: itm.quantity,
                    final_amount: `${currency_type}${itm.final_amount}`,
                    items_involved: itm.items_involved,
                    tax_amount: `${currency_type}${tax_amount}`,
                    markups_amount: `${currency_type}${markups_amount}`,
                }
            })

            _items.push(...work)

            setItems(_items)
        }
        setItems(_items)

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
                                callback: (confirmation) => HandleDeleteConfirmItem(deleteItemId, "WORK", confirmation)
                            }} />

                        : null}

                    {itemShowPopup ? <AddItemPopup /> : null}

                    <div className="settingsContent-content-header">
                        <div className="settingsContent-content-section">
                            <div className="settingsContent-content-title">Analysis of Work rates</div>
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
                                <div className="label">Add Work</div>
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
                                setExistItemData(item)
                                setItemShowPopup(true)
                            },
                            openEditView: (item, type) => {
                                setExistItemData(item)
                                setItemShowPopup(true)
                            },
                            deleteOption: async (item) => await HandleDeleteItem(item)
                        }} />
                    </div>
                </div>
            </div>
        </>
    )
}

export default AWR;
