import React, { useState, useEffect } from 'react'
import Icons from '../assets/Icons'

const CostInput = ({ props }) => {

    const { id, readOnly = false, currency_type, costMethodValue, isCostMethod, value = "", setValue, isIcon, icon, isLabel, label, isRequired } = props

    const [cost, setCost] = useState(0)
    const [costMethod, setCostMethod] = useState('')
    const [focus, setFocus] = useState(false)

    const HandleNumberOnly = (value) => {
        const numberRegex = /^-?\d+(\.\d+)?$/;
        const isNumber = numberRegex.test(value)
        if (isNumber) setCost(cost)

        return isNumber
    }
    const HandleCostMethod = (_value) => {

        if (_value == costMethodValue) return

        setCostMethod(_value)
        setValue(cost, _value)
    }
    const HandleInput = (_value, init = false) => {

        if (_value && !HandleNumberOnly(_value)) return

        if (_value == value) return

        setCost(_value)
        setValue(_value, costMethod)
    }

    useEffect(() => {

        setCost(value)
        setCostMethod(costMethodValue)

    }, [value, costMethodValue])

    return (
        <div className="costinput-main">
            <input
                className="input"
                value={cost}
                type="text"
                id={id}
                aria-invalid={false}
                readOnly={readOnly}
                required={isRequired}
                autoComplete='off'
                onChange={(e) => HandleInput(e.target.value)}
                onFocus={(e) => setFocus(true)}
                onBlur={(e) => setFocus(false)}

            />
            {isCostMethod && !readOnly ?
                <select
                    className="costmethod-select"
                    value={costMethod}
                    onChange={(e) => HandleCostMethod(e.target.value)}
                    autoComplete='off'
                >
                    <option value="%">%</option>
                    <option value={`${currency_type}`}>{currency_type}</option>
                </select>
                : null}
            {!isCostMethod && isIcon ?
                <span className='costtype-icon'>{icon}</span>
                : null}
            {isLabel && label ? <label htmlFor={id} className={`textinput-label ${focus || String(cost).length > 0 ? 'textinput-label-active' : ''}`} data-required={`${isRequired ? '*' : ''}`} >{label}</label> : null}

        </div>
    )
}
const DateTimeInput = ({ props }) => {

    const { id, readOnly = false, value = "", setValue, isIcon, icon, isLabel, label, isRequired } = props

    const [cost, setDate] = useState(0)
    const [focus, setFocus] = useState(false)

    const HandleInput = (_value, init = false) => {

        if (_value == value) return

        setDate(_value)
        setValue(_value)
    }

    useEffect(() => {

        setDate(value)

    }, [value])

    return (
        <div className="dateinput-main">

            <input
                autoComplete='off'
                max='9999-12-31T23:59'
                className="input"
                value={cost}
                type="date"
                id={id}
                aria-invalid={true}
                readOnly={readOnly}
                onChange={(e) => HandleInput(e.target.value)}
                onFocus={(e) => setFocus(true)}
                onBlur={(e) => setFocus(false)}
            />


            {isLabel && label ? <label htmlFor={id} className={`textinput-label ${focus || String(cost).length > 0 ? 'textinput-label-active' : ''}`} data-required={`${isRequired ? '*' : ''}`} >{label}</label> : null}

        </div>
    )
}
const TextInput = ({ props }) => {

    const { id, isRequired, value = "", readOnly = false, placeholder = "", setValue, isIcon, icon, isLeft = true, isLabel, label } = props

    const [text, setText] = useState(value || '')
    const [focus, setFocus] = useState(false)

    const HandleInput = (value, init = false) => {
        setText(value)
        if (!init) setValue(value)
    }

    useEffect(() => {

        setText(value)

    }, [value])

    return (
        <div
            className="textinput-main"

        >
            {isIcon && isLeft ? <span className='textinput-icon'>{icon}</span> : null}
            <input
                autoComplete='off'
                className={`input ${!isIcon ? 'input-full' : ''}`}
                id={id}
                value={text}
                readOnly={readOnly}
                placeholder={placeholder}
                type="text"
                required={isRequired}
                aria-invalid={false}
                onChange={(e) => {
                    HandleInput(e.target.value)
                }}
                onFocus={(e) => setFocus(true)}
                onBlur={(e) => setFocus(false)}

            />
            {isIcon && !isLeft ? <span className='textinput-icon'>{icon}</span> : null}
            {isLabel && label ? <label htmlFor={id} className={`textinput-label ${focus || text.length > 0 ? 'textinput-label-active' : ''}`} data-required={`${isRequired ? '*' : ''}`} >{label}</label> : null}
        </div>
    )
}
const QuantityInput = ({ props }) => {

    const { id, parentQty, actionType, isRequired, value = "", readOnly = false, placeholder = "", setValue, isIcon, icon, isLeft = true, isLabel, label } = props

    const _actionType = actionType == "multiple" ? "X" : actionType == "add" ? "+" : actionType == "subract" ? "-" : "."

    const [text, setText] = useState(value || '')
    const [focus, setFocus] = useState(false)
    const [resultValue, setResultValue] = useState(0)

    const HandleInput = (value, init = false) => {

        if (parentQty) {

            let qty = 0

            if (actionType == "multiple") qty = parseFloat(parentQty || 1) * parseFloat(value)
            else if (actionType == "add") qty = parseFloat(parentQty || 0) + parseFloat(value)
            else if (actionType == "subract") qty = parseFloat(parentQty || 0) - parseFloat(value)

            setResultValue(qty || 0)

        }

        setText(value || 0)

        if (!init) setValue(value || 0)

    }

    useEffect(() => {

        setText(value || 0)

    }, [value])

    return (
        <div
            className="textinput-main"

        >
            {parentQty ?
                <div className="input-parent-value">
                    <div className="value">{parentQty}</div>
                    <div className="action">{_actionType}</div>
                </div>
                : null}
            {isIcon && isLeft ? <span className='textinput-icon'>{icon}</span> : null}
            <input
                autoComplete='off'
                className={`input ${!isIcon ? 'input-full' : ''}`}
                id={id}
                value={text}
                readOnly={readOnly}
                placeholder={placeholder}
                type="text"
                aria-invalid={false}
                onChange={(e) => {
                    HandleInput(e.target.value)
                }}
                onFocus={(e) => setFocus(true)}
                onBlur={(e) => setFocus(false)}

            />
            {parentQty ?
                <div className="input-value-result">
                    <div className="value">{parseFloat(resultValue).toFixed(0) || "N/A"}</div>
                </div>
                : null}
            {isIcon && !isLeft ? <span className='textinput-icon'>{icon}</span> : null}
            {isLabel && label ? <label htmlFor={id} className={`textinput-label ${focus || text.length > 0 ? 'textinput-label-active' : ''}`} data-required={`${isRequired ? '*' : ''}`} >{label}</label> : null}
        </div>
    )
}
const SearcBarInput = ({ props }) => {

    const { id, value = "", placeholder = "", setValue, isIcon, icon, isLeft = true } = props

    const [text, setText] = useState('')
    const [searchDebounce, setSearchDebounce] = useState(null)
    const DebounceDelay = 200

    const HandleInput = (value, init = false) => {

        setText(value)

        if (searchDebounce) clearTimeout(searchDebounce)

        setSearchDebounce(setTimeout(() => {

            if (!init) setValue(value)

        }, DebounceDelay))
    }

    useEffect(() => {
        setText(value)
    }, [])

    return (
        <div className="textinput-main">
            {isIcon && isLeft ? <span
                className='textinput-icon'
                dangerouslySetInnerHTML={{ __html: icon }}
            ></span> : null}
            <input
                autoComplete='off'
                className={`input ${!isIcon ? 'input-full' : ''}`}
                value={text}
                placeholder={placeholder}
                type="text"
                id={id}
                aria-invalid={false}
                onChange={(e) => HandleInput(e.target.value)}
            />
            {isIcon && !isLeft ? <span
                className='textinput-icon'
                dangerouslySetInnerHTML={{ __html: icon }}
            ></span> : null}
        </div>
    )
}
const SelectInput = ({ props }) => {

    const { id, placeholder, readOnly = false, isStatus = false, alsoTypeValue, isRequired, value = "", options, setValue, isIcon, icon, isLabel, label } = props

    const [searchInput, setSearchInput] = useState('')
    const [focus, setFocus] = useState(false)
    const [dropdownsStatus, setDropdownsStatus] = useState(false)
    const [dropdowns, setDropdowns] = useState([])

    const HandleDropdownStatus = () => {

        let input = document.getElementById(id)
        let dropdown_items = document.getElementById(`${id}-textinput-dropdown-results`)

        window.addEventListener('click', (e) => {

            let path = e.path || (e.composedPath && e.composedPath());

            if (Array.isArray(path) && !path.includes(dropdown_items) && !path.includes(input)) {
                setDropdownsStatus(false)
            }
        })

    }
    const HandleDropdownSelect = (opt) => {

        setSearchInput(opt.label)
        setValue(opt.value, opt.label)
    }
    const searchItemInArray = (input, array) => {
        const matches = [];

        for (let i = 0; i < array.length; i++) {

            if (array[i].label.toLowerCase().includes(input.toLowerCase())) {
                matches.push(array[i]);
            }
        }

        return matches;
    }

    const HandleInput = (value) => {

        setSearchInput(value)

        let _items = options

        _items = searchItemInArray(value, _items)

        setDropdowns(_items)


        if (alsoTypeValue) setValue(value)
    }

    const HandleAddDropDown = (id) => {
    }

    useEffect(() => {

        let option = options.filter(opt => opt.value == value)[0]
        setSearchInput(option ? option.label : value)
        setDropdowns(options)

        if (!readOnly) {
            HandleDropdownStatus()
        }


    }, [value, options])

    return (
        <div className="textinput-main">
            {isIcon ? <span
                className='textinput-icon'
                dangerouslySetInnerHTML={{ __html: icon }}
            ></span> : null}
            <input
                autoComplete='off'
                className={`input ${!isIcon ? 'input-full' : ''}`}
                value={searchInput}
                placeholder={placeholder || ""}
                type="text"
                id={id}
                aria-invalid={false}
                required={isRequired}
                onInput={(e) => HandleInput(e.target.value)}
                onFocus={(e) => {
                    setFocus(true)
                    setDropdownsStatus(true)
                }}
                onBlur={(e) => setFocus(false)}
                readOnly={readOnly}
            />

            {dropdownsStatus && !readOnly ?
                <div className="textinput-dropdown-main" id={`${id}-textinput-dropdown-results`}>
                    <div className="textinput-dropdown-results">
                        {dropdowns.length ?
                            dropdowns.map((opt, i) => (

                                isStatus ?
                                    <span onClick={(e) => HandleDropdownSelect(opt)} className="textinput-dropdown-item" id={opt.value} key={i}>
                                        <div className={`input-status input-status-${opt.value}`}></div>
                                        <div className="label"> {opt.label}</div>
                                    </span>
                                    :
                                    <span onClick={(e) => HandleDropdownSelect(opt)} className="textinput-dropdown-item" id={opt.value} key={i}>
                                        {opt.label}
                                    </span>

                            ))
                            :
                            <div className="textinput-dropdown-noresult">
                                <div
                                    className="icon"
                                    dangerouslySetInnerHTML={{ __html: Icons.general.noresult }}
                                ></div>
                                <div className="label">No options</div>
                            </div>
                        }

                    </div>
                    <div className="textinput-dropdown-actions" style={{ display: 'none' }}>
                        <div
                            className="dropdown-additem"
                            onClick={(e) => HandleAddDropDown(id)}
                        >
                            <div
                                className="icon"
                                dangerouslySetInnerHTML={{ __html: Icons.general.add_round_btn }}
                            ></div>
                            <div className="label">Add new</div>
                        </div>
                    </div>
                </div>
                : null}
            {isLabel && label ? <label htmlFor={id} className={`textinput-label ${focus || searchInput.length > 0 ? 'textinput-label-active' : ''}`} data-required={`${isRequired ? '*' : ''}`}>{label}</label> : null}
        </div>
    )
}
const RadioInput = ({ props }) => {

    const { id = "", inputType, className = [], value = "", setValue, name = "" } = props

    const [checked, setChecked] = useState(value)

    const HandleInput = (value, init = false) => {

        setChecked(value)
        if (!init) setValue(value)
    }

    useEffect(() => {
        setChecked(value)
    }, [])

    return (
        <div className="checkboxinput-main">
            {inputType == 'toggle' ?
                <label class="checkboxinput-switch">
                    <input
                        autoComplete='off'
                        type="checkbox"
                        name={name}
                        defaultChecked={checked}
                        onInput={(e) => HandleInput(e.target.checked)}
                    />
                    <span class="checkboxinput-slider"></span>
                </label>
                :
                <input
                    autoComplete='off'
                    id={id}
                    className={`input ${className.join(' ')}`}
                    name={name}
                    type={inputType || `radio`}
                    defaultChecked={checked}
                    onInput={(e) => HandleInput(e.target.checked)}
                />
            }
        </div>
    )
}

export { CostInput, DateTimeInput, SearcBarInput, QuantityInput, TextInput, SelectInput, RadioInput }