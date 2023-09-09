import React, { useEffect, useMemo, useState, useRef } from 'react'

import Images from '../../assets/Images'
import Icons from '../../assets/Icons'

import { SearcBarInput, RadioInput } from '../Inputs'
import Pagination from '../Pagination';
import Utils from '../../utils'

let searchDebounce = undefined

const WorkSheet = ({ props }) => {

    const { Header, isPreview, selectEvent, isDisableOption, isPaggination, isGroupIndex, isStepper, isViewOnly, Items, isFilters, Filters, openSidebar, openEditView, deleteOption } = props

    const isLeftFilter = isFilters ? Array.isArray(Filters.left) && Filters.left.length > 0 : false
    const isRightFilter = isFilters ? Array.isArray(Filters.right) && Filters.right.length > 0 : false

    const [headersOriginal, setHeadersOriginal] = useState([])
    const [headers, setHeaders] = useState([])
    const [items, setItems] = useState([])
    const [itemsOrginal, setItemsOrginal] = useState([])
    const [tableItemsOrginal, setTableItemsOrginal] = useState([])
    const [tableItems, setTableItems] = useState([])
    const [selectAllValue, setSelectAllValue] = useState(false)
    const [selecOptVisible, setSelecOptVisible] = useState(true)
    const [filterSearchVal, setFilterSearchVal] = useState('')


    const paginationOptions = [
        {
            value: 10,
            label: "10/page"
        },
        {
            value: 25,
            label: "25/page"
        },
        {
            value: 50,
            label: "50/page"
        },
        {
            value: 100,
            label: "100/page"
        },
    ]

    const [currentPage, setCurrentPage] = useState(1);
    const [totalItemsCount, setTotalItemsCount] = useState(Items.length)

    useEffect(() => {

        setTotalItemsCount(Items.length)

    }, [Items])

    const HandleItemSelect = (value, id, allBtn = false) => {

        setSelectAllValue(value)

        let selectAllFun = (data, value) => {

            data.isSelected = value

            if (typeof selectEvent == 'function') selectEvent(data.id, value)

            if (Array.isArray(data.itemChildren)) {
                data.itemChildren.forEach((itm, i) => {
                    selectAllFun(itm, value)
                })
            }
        }

        let _items = [...tableItems]

        for (let itm of _items) {
            selectAllFun(itm, value)
        }

        setTableItems(_items)
        setTableItemsOrginal(_items)
    }
    const WorkSheet_Header = () => {

        return (
            <div className="worksheet-table-header">
                <div className="worksheet-table-header-left">

                    {Array.isArray(headers) ? headers.map((head, i) => (

                        head.active ?
                            head.isLeft ?
                                head.id == 'select' ?
                                    !selecOptVisible ? null :
                                        <div className='worksheet-table-selectall worksheet-table-minsize-mini' key={`worksheet-table-th-${i}`} id={`worksheet-table-th-${head.id}`}>
                                            <RadioInput
                                                props={{
                                                    inputType: 'checkbox',
                                                    value: selectAllValue,
                                                    className: ['worksheet-table-minsize-mini'],
                                                    name: "",
                                                    setValue: (value) => { HandleItemSelect(value, `worksheet-table-th-${head.id}`, true) }
                                                }}
                                            />
                                        </div>
                                    :
                                    head.id == 'toggle' ?
                                        !selecOptVisible ? null :
                                            <div className='worksheet-table-selectall worksheet-table-minsize-mini' key={`worksheet-table-th-${i}`} id={`worksheet-table-th-${head.id}`}>
                                                <RadioInput
                                                    props={{
                                                        inputType: 'toggle',
                                                        value: selectAllValue,
                                                        className: ['worksheet-table-minsize-mini'],
                                                        name: "",
                                                        setValue: (value) => { HandleItemSelect(value, `worksheet-table-th-${head.id}`, true) }
                                                    }}
                                                />
                                            </div>
                                        :
                                        <div className={`${head.id == 'name' ? 'worksheet-table-minsize-high' : 'worksheet-table-minsize-mid'}  worksheet-table-th`} key={i} id={`worksheet-table-th-${head.id}`}>{head.label}</div>
                                : null
                            : null

                    )) : ''}
                </div>
                <div className="worksheet-table-header-right">
                    {Array.isArray(headers) ? headers.map((head, i) => (

                        head.active ?
                            !head.isLeft ?
                                <div className={`${head.id == 'action' ? 'worksheet-table-minsize-mini' : 'worksheet-table-minsize-mid'}  worksheet-table-th`} key={i} id={`worksheet-table-th-${head.id}`}>{head.label}</div>
                                : null
                            : null
                    )) : ''}
                </div>
            </div>
        )
    }
    const WorSheet_Body_Tr = ({ props }) => {

        const { tr, key, parentGroup, index, side_step = 0, isParentClose = false } = props

        const [groupStatus, setGroupStatus] = useState(tr.isOpen || false)
        const [trSelected, setTrSelected] = useState(tr.isSelected)
        const [actionDropdown, setActionDropdown] = useState(false)
        const isGroup = tr.type == 'GROUP'
        const isMain = tr.type == 'GROUP' && tr.isMain

        const className = `${isGroup ? 'worksheet-table-body-group' : 'worksheet-table-body-item'} `
        const selectedClassName = `${isDisableOption ? tr.isSelected ? 'worksheet-table-body-item-selected' : 'worksheet-table-body-item-disable' : ''} `

        const diable_item_class = "worksheet-table-item-disable"

        const HandleGroupOpenClose = (tr) => {


            if (typeof tr.openStatusCallback == 'function') tr.openStatusCallback(tr.id, groupStatus)

            setGroupStatus(!groupStatus)
        }

        const HandleSelectInput = (value, id, item) => {


            setTrSelected(value)

            let findItemPath = (items, existPath, id) => {

                if (!Array.isArray(items)) return

                let path = [...existPath]

                let isExistIndex = items.findIndex((itm, i) => itm.id == id)

                if (isExistIndex != undefined && isExistIndex != -1) {
                    path.push(isExistIndex)

                    return path
                }

                for (let idx = 0; idx < items.length; idx++) {

                    path.push(idx)

                    return findItemPath(items[idx].itemChildren, path, id)
                }

            }

            let _items = [...tableItems]

            let path = findItemPath(_items, [], tr.id)


            let selectAllFun = (data, value) => {

                data.isSelected = value

                if (Array.isArray(data.itemChildren)) {
                    data.itemChildren.forEach((itm, i) => {
                        selectAllFun(itm, value)
                    })
                }
            }

            const updateItemByIndexPath = (data, index_path, value) => {

                index_path = Array.isArray(index_path) ? index_path : []

                let currentArray = data;

                for (let i = 0; i < index_path.length - 1; i++) {
                    const index = index_path[i];
                    if (currentArray[index] && Array.isArray(currentArray[index].itemChildren)) {
                        currentArray = currentArray[index].itemChildren;
                    } else {
                        console.error("Invalid index path");
                        return;
                    }
                }

                const lastIndex = index_path[index_path.length - 1];
                if (Array.isArray(currentArray) && lastIndex >= 0 && lastIndex < currentArray.length) {

                    selectAllFun(currentArray[lastIndex], value)

                }

                return data;
            }



            let __items = updateItemByIndexPath(_items, path, value)


            if (typeof selectEvent == 'function') selectEvent(item.id, value)

            setTableItems(__items)
            setTableItemsOrginal(__items)
        }

        const HandleSORItemOpen = (e, tr) => {

            if (tr.isAWR || tr.hasAction) openSidebar(tr, tr.type)
        }
        const HandleItemEditOpen = (e, tr) => {

            if (tr.isAWR || tr.hasAction) openEditView(tr, tr.type)
        }

        const HandleActionDropdown = () => {

            if (tr.hasAction) setActionDropdown(!actionDropdown)
        }

        useEffect(() => {

            let items_parent = document.querySelector(`#worksheet-table-tr-action-${tr.id}`)

            window.addEventListener('click', (e) => {

                let path = e.path || (e.composedPath && e.composedPath());

                if (Array.isArray(path) && !path.includes(items_parent))
                    setActionDropdown(false)
            })



        }, [])
        useEffect(() => {

        }, [groupStatus])

        const HandleActionCallback = async (e, opt) => {

            if (opt.id == 'edit-item') HandleItemEditOpen(e, tr)
            else if (opt.id == 'delete-item') {
                await deleteOption(tr)
            }

            opt.callback(e, tr)

            setActionDropdown(false)
        }

        return (
            <div className={`worksheet-table-tr ${selectedClassName} ${isParentClose ? diable_item_class : ''}`} key={`worksheet-table-tr-${tr.id}`} id={`worksheet-table-tr-${tr.id}`}>
                <div className={`worksheet-table-tr-content ${tr.isSubTotal ? 'worksheet-table-body-subtotal' : ''} ${className}`} >

                    <div className={`worksheet-table-td-left ${tr.isSubTotal ? 'worksheet-table-body-subtotal' : ''} ${className}`}>
                        {Array.isArray(headers) ? headers.map((head, i) => (

                            head.active ?
                                head.isLeft ?

                                    head.id == 'select' ?
                                        !selecOptVisible ? null :
                                            <div>
                                                {!tr.isSelectOption ? <div className="worksheet-table-minsize-mini"></div> :
                                                    <RadioInput
                                                        props={{
                                                            inputType: 'checkbox',
                                                            value: trSelected,
                                                            className: ['worksheet-table-minsize-mini'],
                                                            name: "",
                                                            setValue: (value) => { HandleSelectInput(value, `worksheet-table-tr-${tr.id}`, tr) }
                                                        }}
                                                    />
                                                }
                                            </div>
                                        :
                                        head.id == 'toggle' ?
                                            !selecOptVisible ? null :
                                                <div>
                                                    {!tr.isSelectOption ? <div className="worksheet-table-minsize-mini"></div> :
                                                        <RadioInput
                                                            props={{
                                                                inputType: 'toggle',
                                                                value: trSelected,
                                                                className: ['worksheet-table-minsize-mini'],
                                                                name: "",
                                                                setValue: (value) => { HandleSelectInput(value, `worksheet-table-tr-${tr.id}`, tr) }
                                                            }}
                                                        />
                                                    }
                                                </div>
                                            :


                                            <div
                                                className={`worksheet-table-td ${head.id == 'name' ? 'worksheet-table-minsize-high' : 'worksheet-table-minsize-mid'}`}
                                                style={{ paddingLeft: `${head.id == 'name' && isStepper ? side_step : 0}rem` }}
                                            >

                                                {isGroup && head.id == 'name' && head.dropdown ?
                                                    <span
                                                        className={`worksheet-table-group-openbtn ${groupStatus ? 'worksheet-table-groupbtn-open' : 'worksheet-table-groupbtn-close'}`}
                                                        onClick={(e) => HandleGroupOpenClose(tr)}
                                                        dangerouslySetInnerHTML={{ __html: Icons.general.group_arrow }}
                                                    >
                                                    </span>
                                                    : null}

                                                <div
                                                    className={`worksheet-table-td-content ${head.isID ? 'worksheet-table-td-id' : ''}`}
                                                    onClick={(e) => {
                                                        if (!isViewOnly && head.id != 'name' && head.isID) HandleSORItemOpen(e, tr)
                                                    }}
                                                    onDoubleClick={(e) => {
                                                        if (!isViewOnly && !head.isID && head.id == 'name') HandleSORItemOpen(e, tr)
                                                    }}
                                                >
                                                    {head.id == 'name' && parentGroup && isGroup && isGroupIndex ? `${String(index).length > 1 ? index + 1 : `0${index + 1}`}.` : ''}
                                                    {
                                                        <div className='worksheet-row-name'>
                                                            {tr[head.id]}
                                                            {tr.isTemplate ? <span className='worksheet-template-icon'>{tr.templateLabel || "D"}</span> : ''}
                                                        </div>
                                                    }

                                                    {head.id == 'name' && tr.isDescription == true && String(tr.description).length ? <span className='worksheet-table-td-content-desc' dangerouslySetInnerHTML={{ __html: tr.description || '' }}></span> : ''}
                                                </div>

                                            </div>
                                    : null
                                : null
                        )) : ''}
                    </div>
                    <div className={`worksheet-table-td-right ${tr.isSubTotal ? 'worksheet-table-body-subtotal' : ''} ${className}`}>
                        {Array.isArray(headers) ? headers.map((head, i) => (
                            head.active ?
                                !head.isLeft ?
                                    <div
                                        className={`worksheet-table-td ${head.id == 'action' ? 'worksheet-table-minsize-mini' : 'worksheet-table-minsize-mid'}`}
                                        style={{ paddingLeft: `${head.id == 'name' ? side_step : 0}rem` }}
                                    >
                                        {
                                            head.id == "action" && !tr.isTemplate && tr.hasAction ?
                                                <div id={`worksheet-table-tr-action-${tr.id}`}>

                                                    <span
                                                        onClick={(e) => HandleActionDropdown(e)}
                                                        className='worksheet-table-action-btn'
                                                        dangerouslySetInnerHTML={{ __html: Icons.general.dotted_action }}
                                                    ></span>
                                                    {actionDropdown && Array.isArray(head.options) && head.options.length ?
                                                        <div key={i} className='worksheet-table-action-dropdown'>
                                                            {head.options.map((opt, i) => (

                                                                <div className="action-dropdown-item" onClick={(e) => HandleActionCallback(e, opt)}>
                                                                    <div
                                                                        dangerouslySetInnerHTML={{ __html: opt.icon }}
                                                                        className="icon"
                                                                    ></div>
                                                                    <div className="label">{opt.label}</div>
                                                                </div>

                                                            ))}
                                                        </div>
                                                        : null}

                                                </div>
                                                :
                                                head.id == "status" && head.isBox ?
                                                    <div className={`worksheet-table-tr-status-main`} >
                                                        <div className={`worksheet-table-tr-status ${tr.status ? `worksheet-status-${tr.status}` : ''}`}></div>
                                                        <span>{tr[head.id]}</span>
                                                    </div>
                                                    :

                                                    head.isInnerHTML ?
                                                        <div
                                                            className='worksheet-table-td-content'
                                                            dangerouslySetInnerHTML={{ __html: tr[head.id] }}
                                                        ></div>
                                                        :
                                                        <div className='worksheet-table-td-content'>{tr[head.id]}</div>
                                        }

                                    </div>
                                    : null
                                : null
                        )) : ''}
                    </div>
                </div>
                {tr.itemChildren.length ?
                    <div className="worksheet-table-tr-subitems">
                        {tr.itemChildren.map((tr, i) => (<WorSheet_Body_Tr props={{ tr, parentGroup: false, index: i, key: i, side_step: side_step + 1, isParentClose: groupStatus }} />))}
                    </div>
                    : null}
            </div>
        )
    }

    const HandlePaginationPage = (page, limit) => {

        const firstPageIndex = (page - 1) * limit;
        const lastPageIndex = firstPageIndex + limit;

        let data = tableItemsOrginal.slice(firstPageIndex, lastPageIndex);
        setTableItems(data)
    }

    const WorkSheet_Paggination = () => {

        const [pageLimit, setPageLimit] = useState(paginationOptions[0].value);
        const HandlePageLimit = (e) => {

            let limit = parseInt(e.target.value)
            setPageLimit(limit)
        }


        return (
            <div className="worksheet-table-paggination">
                <div className="paggination-content" id='worksheet-paggination-content'>

                    <Pagination
                        className="pagination-bar"
                        currentPage={currentPage}
                        totalCount={totalItemsCount}
                        pageSize={pageLimit}
                        onPageChange={page => {
                            setCurrentPage(page)
                            HandlePaginationPage(page, pageLimit)
                        }}
                    />

                </div>
                <div className="paggination-limit">
                    <select name="" id="" onInput={(e) => HandlePageLimit(e)}>
                        {paginationOptions.map((option, i) => (
                            <option value={option.value}>{option.label}</option>
                        ))}

                    </select>
                </div>
            </div>
        )
    }

    const ItemsStatus = (items) => {

        const updateField = (item) => {

            if (item.type == "GROUP") {

                let status = item.itemChildren.filter(itm => itm.type != 'GROUP').map(itm => itm.status)
                if (status.length) {

                    let allSame = status.length > 0 && status.every(item => item == status[0]);

                    if (allSame) item.status = status[0]
                }

                let itemChildren = []
                item.itemChildren.forEach(itm => {

                    itemChildren.push(updateField(itm))

                })

                item.itemChildren = itemChildren
            }

            return item

        }

        items.forEach((itm, i) => {
            items[i] = updateField(itm)
        })


        return items
    }

    const setupTableItems = () => {

        const Items = [...items]

        const getOrderedTableItems = (data = []) => {
            const groupedItems = {};

            for (const item of data) {

                const parentId = item.parentId;

                if (parentId != null) {

                    if (!groupedItems[parentId]) groupedItems[parentId] = [];

                    groupedItems[parentId].push(item);
                }
            }

            for (const item of data) {
                const itemId = item.id;
                if (groupedItems[itemId]) {
                    item.itemChildren = groupedItems[itemId];
                }
            }

            const result = data.filter(d => d.parentId == null)

            result.sort((a, b) => a.order - b.order)

            return result;

        }

        const Table_Items = getOrderedTableItems(Items);
        const _items = ItemsStatus(Table_Items)

        let allSelected = _items.every(itm => itm.isSelected == true)
        setSelectAllValue(allSelected)

        setTableItems(_items.slice(0, paginationOptions[0].value))
        setTableItemsOrginal(_items)
    }

    const HandleSearch = (value) => {



        if (!value) {

            return setTableItems(itemsOrginal)
        }

        let _tableItems = [...itemsOrginal]

        let searchInArray = (searhVal, array, column) => {
            const matches = [];

            for (let i = 0; i < array.length; i++) {

                if (array[i][column].toLowerCase().includes(searhVal.toLowerCase())) {
                    matches.push(array[i]);
                }
            }

            return matches;
        }

        let _itms = searchInArray(value, _tableItems, 'name')

        let parents = []

        let getParents = (item) => {

            let getParent = (parentId) => {

                let parent = _tableItems.filter(item => item.id == parentId)[0]

                if (!parent) return

                parents.push(parent)

                if (parent.parentId) getParent(parent.parentId)


            }

            if (item.parentId) getParent(item.parentId)

        }

        _itms.forEach(itm => getParents(itm))

        let _parents = parents.filter(item => (!_itms.filter(n_itm => n_itm.id == item.id).length))

        _itms.push(..._parents)

        if (searchDebounce) clearTimeout(searchDebounce)

        searchDebounce = setTimeout(() => {

            setFilterSearchVal(value)
            setItems(_itms)

        }, 100)

    }


    const Button_Filter = ({ props }) => {
        const {
            id,
            isSearchBar,
            type,
            isDropDownContainer,
            dropDownOptions,
            callback,
            isIcon,
            icon,
            isLabel,
            label,
            isIconLeft,
        } = props
        const [selectFilterOpts, setSelectFilterOpts] = useState([])

        const [dropdownStatus, setDropDownStatus] = useState(false)

        const HandleClick = (e) => {
            setDropDownStatus(!dropdownStatus)
            callback(!dropdownStatus)
        }

        let HandleSubItemChange = (value, opt, i) => {

            let _filters = [...selectFilterOpts]

            _filters[i].value = value

            setSelectFilterOpts(_filters)

            if (id == "sor-worksheetfilter-select") {

                if (opt.id == 'opt-select-all') {
                    let _items = [...items]

                    _items = _items.map(itm => {
                        itm.isSelected = value

                        return itm
                    })
                    setItems(_items)
                }
                else {
                    let _items = [...items]

                    _items = _items.map(itm => {

                        if (opt.match) {

                            if (opt.id == "work" && itm.type == "WORK") itm.isSelected = value
                            else if (opt.match == "category" && itm.rawdata.sor_head && itm.rawdata.sor_head.id == opt.id) itm.isSelected = value
                            else if (opt.id == itm[opt.match]) itm.isSelected = value
                        }
                        else if (itm.id == opt.id || itm.parentId == opt.id) itm.isSelected = value

                        return itm
                    })
                    setItems(_items)
                }

            }
            else if (id == "worksheetfilter-status") {

                if (opt.id == 'opt-select-all') {

                    let _items = [...itemsOrginal]

                    if (value) setItems(_items)
                    else setItems([])

                }
                else {
                    let _items = [...itemsOrginal]

                    let filters = _filters.filter(f => f.value && f.type == 'option' && f.id != 'opt-select-all')

                    let __items = []

                    filters.forEach(f => {

                        let itm = _items.filter(itm => itm.rawdata.status == f.id)[0]

                        if (itm) __items.push(itm)
                    })

                    if (!filters.length) __items = _items

                    setItems(__items)
                }

            }
            else if (id == "worksheetfilter-filter") {

                if (opt.id == 'filter-opt-select-all') {

                    let _items = [...itemsOrginal]

                    if (value) setItems(_items)
                    else setItems([])

                }
                else {
                    let _items = [...itemsOrginal]

                    let new_items = []

                    let filters = _filters.filter(f => f.value && f.type == 'option' && f.id != 'opt-select-all')

                    filters.forEach(filterOpt => {

                        if (filterOpt.match) {

                            _items.forEach(itm => {

                                if (
                                    (filterOpt.id == "filterwork" && itm.type == "WORK")
                                    || (filterOpt.match == "category" && itm.rawdata.sor_head && 'filter' + itm.rawdata.sor_head.id == filterOpt.id)
                                    || (filterOpt.id == 'filter' + itm[filterOpt.match])) {

                                    if (!new_items.filter(n_itm => n_itm.id == itm.id).length) new_items.push(itm)

                                    let parents = []

                                    let getParents = (item) => {

                                        let getParent = (parentId) => {

                                            let parent = _items.filter(item => item.id == parentId)[0]

                                            if (!parent) return

                                            parents.push(parent)

                                            if (parent.parentId) getParent(parent.parentId)
                                        }

                                        if (item.parentId) getParent(item.parentId)

                                    }

                                    getParents(itm)

                                    let subItems = parents.filter(item => (!new_items.filter(n_itm => n_itm.id == item.id).length))

                                    new_items.push(...subItems)
                                }

                            })
                        }
                        else {
                            let item = _items.filter(itm => ('filter' + itm.id) == filterOpt.id)[0]

                            if (!item) return

                            _items.forEach(itm => {

                                if (item.parentId && itm.id == item.parentId)

                                    if (!new_items.filter(n_itm => n_itm.id == itm.id).length) new_items.push(itm)
                            })

                            let subItems = _items.filter(itm => itm.id == item.id || itm.parentId == item.id)

                            new_items.push(...subItems)

                        }
                    })


                    if (!filters.length) new_items = _items

                    setItems(new_items)


                }
            }
            else if (id == "worksheetfilter-show_hide") {

                if (opt.id == 'filter-opt-select-all') {

                    let _items = [...headersOriginal]

                    if (value) setHeaders(_items)
                    else setHeaders([])
                }
                else {

                    let _items = [...headersOriginal]

                    let new_items = []

                    {
                        let item = _items.filter(itm => itm.id == 'select')[0]

                        if (item) new_items.push(item)
                    }

                    let filters = _filters.filter(f => f.value && f.type == 'option' && f.id != 'opt-select-all')


                    filters.forEach(filterOpt => {

                        let item = _items.filter(itm => itm.id == filterOpt.id)[0]
                        if (item) new_items.push(item)
                    })

                    {
                        let item = _items.filter(itm => itm.id == 'action')[0]

                        if (item) new_items.push(item)
                    }

                    if (typeof opt.callback == 'function') opt.callback(selectFilterOpts)


                    if (!filters.length) new_items = _items

                    setHeaders(new_items)

                }
            }


        }

        useEffect(() => {

            let items_parent = document.querySelector(`#${id}`)

            window.addEventListener('click', (e) => {

                let path = e.path || (e.composedPath && e.composedPath());

                if (Array.isArray(path) && !path.includes(items_parent))
                    setDropDownStatus(false)
            })
            setSelectFilterOpts(dropDownOptions)
        }, [])


        return (
            <div className='filters-item-button' id={id}>
                <div
                    className="button"
                    onClick={(e) => HandleClick(e)}
                >
                    {isIcon && isIconLeft ?
                        <span
                            className='icon'
                            dangerouslySetInnerHTML={{ __html: icon }}
                        ></span>
                        : null}

                    {isLabel ? <span class='label'>{label}</span> : null}

                    {isIcon && !isIconLeft ?
                        <span
                            className='icon'
                            dangerouslySetInnerHTML={{ __html: icon }}
                        ></span>
                        : null}
                </div>

                {isDropDownContainer ?

                    <div className={`filters-item-button-results ${dropdownStatus ? 'filters-item-button-results-active' : ''}`}>

                        {selectFilterOpts.map((opt, i) => (

                            opt.type == 'label' ?
                                <div className="button-results-label">{opt.label}</div>
                                :
                                <div className="button-results-item" >
                                    <div className="input">
                                        <RadioInput
                                            props={{
                                                id: `filters-item-select-${opt.id}`,
                                                inputType: "checkbox",
                                                className: [],
                                                value: opt.value,
                                                setValue: (val) => HandleSubItemChange(val, opt, i)
                                            }}
                                        />
                                    </div>
                                    <label htmlFor={`filters-item-select-${opt.id}`}>{opt.label}</label>
                                </div>
                        ))}

                    </div>

                    : null}
            </div>

        )
    }
    const Icon_Filter = ({ props }) => {

        const {
            isSearchBar,
            type,
            isSelectToggle,
            isDropDownContainer,
            dropDownOptions,
            placeholder,
            callback,
            isIcon,
            icon,
            isLabel,
            label,
            isIconLeft,
        } = props

        const HandleFilterIconInput = (e) => {
            if (isSelectToggle) setSelecOptVisible(!selecOptVisible)

            callback(e)
        }


        return (
            <>
                {isIcon && type == 'icon' ?
                    <div
                        className="filters-item-icon"
                        dangerouslySetInnerHTML={{ __html: icon }}
                        onClick={(e) => HandleFilterIconInput(e)}
                    ></div>
                    : null}
            </>
        )
    }
    const Search_Filter = ({ props }) => {

        const {
            id,
            isSearchBar,
            type,
            isDropDownContainer,
            dropDownOptions,
            placeholder,
            callback,
            isIcon,
            icon,
            isLabel,
            label,
            isIconLeft,
        } = props


        return (
            <>
                {isSearchBar && type == 'input' ?
                    <div className='filters-item-input'>
                        <SearcBarInput
                            props={{
                                id: id,
                                value: filterSearchVal,
                                placeholder: placeholder || "Search by name",
                                setValue: (val) => {
                                    HandleSearch(val)
                                },
                                isIcon: isIcon,
                                isLeft: isIconLeft,
                                icon: icon || Icons.general.search
                            }}
                        />
                    </div >
                    : null}
            </>
        )
    }

    useEffect(() => {
    }, [tableItems])

    useEffect(() => {
        setHeaders(Header)
        setHeadersOriginal(Header)
        setItems(Items)
        setItemsOrginal(Items)
    }, [Items, Header])
    useEffect(() => {
        setupTableItems()
    }, [items])


    return (
        <div className="worksheet-main">
            {isFilters ?
                <div className="worksheet-filters">
                    <div className="worksheet-filters-content">
                        {isLeftFilter ?
                            <div className={`filters-left ${!isRightFilter ? 'filters-left-full' : ''}`}>
                                {Filters.left.map((item, i) => (
                                    <div className="filters-item" key={i}>
                                        {
                                            item.isHeading ?
                                                <span className='filter-item-title'>
                                                    {item.heading}
                                                    {item.isSubTitle ? <div className="filter-sub-title">{item.subtitle}</div> : null}
                                                </span>
                                                :
                                                item.type == 'icon' ? <Icon_Filter props={item} />
                                                    : item.type == 'button' ? <Button_Filter props={item} />
                                                        : item.isSearchBar && item.type == 'input' ?

                                                            <div className='filters-item-input'>
                                                                <SearcBarInput
                                                                    props={{
                                                                        id: item.id,
                                                                        value: filterSearchVal,
                                                                        placeholder: item.placeholder || "Search by name",
                                                                        setValue: (val) => {
                                                                            HandleSearch(val)
                                                                        },
                                                                        isIcon: item.isIcon,
                                                                        isLeft: item.isIconLeft,
                                                                        icon: item.icon || Icons.general.search
                                                                    }}
                                                                />
                                                            </div >

                                                            : null
                                        }

                                    </div>
                                ))}
                            </div>
                            : null}
                        {isRightFilter ?
                            <div className={`filters-right ${!isLeftFilter ? 'filters-right-full' : ''}`}>
                                {Filters.right.map((item, i) => (
                                    <div className="filters-item" key={i}>
                                        {
                                            item.type == 'icon' ? <Icon_Filter props={item} />
                                                : item.type == 'button' ? <Button_Filter props={item} />
                                                    : item.isSearchBar && item.type == 'input' ? <Search_Filter props={item} />
                                                        : null
                                        }
                                    </div>
                                ))}
                            </div>
                            : null}
                    </div>
                </div>
                : null}
            <div className="worksheet-table">
                <WorkSheet_Header />
                <div className="worksheet-table-body">
                    {tableItems.map((tr, i) => (<WorSheet_Body_Tr props={{ tr, parentGroup: true, index: i, key: i, side_step: 0 }} />))}
                </div>
                {isPaggination ? <WorkSheet_Paggination /> : null}
            </div>
        </div>
    )
}

export default WorkSheet