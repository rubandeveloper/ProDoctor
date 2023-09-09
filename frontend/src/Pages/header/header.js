import React, { useEffect, useState, useRef, Fragment } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import UserAction from '../../redux/action/userAction'
import StoreHandler from '../../redux/StoreHandler'

import { Link, useNavigate } from 'react-router-dom'
import Image from '../../assets/Images'
import Icons from '../../assets/Icons'

const Header = () => {

    const [isLoading, setIsLoading] = useState(false)

    const store = useSelector((store) => store)
    const dispatch = useDispatch()
    const { updateState } = new UserAction
    const [hospitalID, setHospitalID] = useState('')

    const storeHandler = new StoreHandler({
        dataStack: ['user'],
        dispatch: dispatch,
        updateState: updateState,
    })

    const LoadStoreData = async () => {
        setIsLoading(true)
        let resolved = await storeHandler.init()
        setIsLoading(false)
    }

    const [userDetials, setUserDetials] = useState({})
    const profile_img_url = userDetials && userDetials.profile_img ? `data:image/png;base64,${userDetials.profile_img}` : ''

    const navigate = useNavigate();

    const LogoutEvent = () => {
        try {

            localStorage.removeItem('authToken');
            localStorage.removeItem('userdetials');
            window.location.href = '/app/signin'


        } catch (error) {
            console.error('Error decoding authToken:', error);
        }
    }

    const makeCustomDropDown = (params) => {

        let { id, icon, isItemsLabel, itemsLabel, callback = () => { }, _classList, activeClass, isIcon, isImg, img, isLable, lablel, isOptions, options = [] } = params

        options = options || []
        _classList = _classList || []

        let active_dropdown_class = activeClass || "custom-dropdown-active"

        let container = document.createElement('div')

        _classList.push('custom-dropdown')

        container.classList.add(..._classList)
        container.id = id

        container.innerHTML = `
            <div class="custom-dropdown-label">
                ${isLable ? `<span class='lablel'>${lablel}</span>` : ''}
                ${isImg ? `<span class='img'><img src='${img}'/></span>` : ''}
                ${isIcon ? `<span class='icon'>${icon}</span>` : ''}
            </div>
            <div class="custom-dropdown-items-main">
                ${isItemsLabel ? `<span class='dropdown-items-label'>${itemsLabel}</span>` : ''}
                <div class="custom-dropdown-items" id='custom-dropdown-items'>
                </div>
            </div>
        `

        let makeItem = (option) => {

            let { icon, isIcon, isLeft, lablel, callback } = option

            let item = document.createElement('div')
            item.classList.add('custom-dropdown-item')

            item.innerHTML = `

                <div class="custom-dropdown-item-label">
                    ${isLeft && isIcon ? `<span class='icon'>${icon}</span>` : ''}
                    <span class='lablel'>${lablel}</span>
                    ${!isLeft && isIcon ? `<span class='icon'>${icon}</span>` : ''}
                </div>

            `

            item.addEventListener('click', (e) => {
                callback(e)
                container.classList.remove(active_dropdown_class)
            })

            return item

        }

        let items_parent = container.querySelector('#custom-dropdown-items')

        if (isOptions) {

            options.forEach((opt, i) => {

                let item = makeItem(opt)
                items_parent.appendChild(item)
            })
        }


        let container_label = container.querySelector('.custom-dropdown-label')


        container_label.addEventListener('click', (e) => {

            if (isOptions) container.classList.toggle(active_dropdown_class)

            else callback(e)



        })

        window.addEventListener('click', (e) => {

            let path = e.path || (e.composedPath && e.composedPath());

            if (Array.isArray(path) && !path.includes(items_parent) && !path.includes(container_label))
                container.classList.remove(active_dropdown_class)
        })

        return container
    }

    const CustomDropDown = (dropdown, parentContainer) => {

        let hideContainer = (id, parentContainer) => {

            if (!id || !parentContainer) return false

            if (parentContainer.querySelector(`#${id}`))
                parentContainer.removeChild(parentContainer.querySelector(`#${id}`))

            return true
        }

        hideContainer(dropdown.id, parentContainer)

        let container = makeCustomDropDown(dropdown)
        parentContainer.appendChild(container)
    }

    const HandleDropDownEvents = () => {

        let parentContainer = document.querySelector('#project-header-main')
        let project_dropdown = parentContainer.querySelector('#project-select-dropdown')
        let feedback_dropdown = parentContainer.querySelector('#feedback-select-dropdown')
        let contact_dropdown = parentContainer.querySelector('#contact-select-dropdown')
        let help_dropdown = parentContainer.querySelector('#help-select-dropdown')
        let profile_dropdown = parentContainer.querySelector('#profile-select-dropdown')

        let project_data = {
            id: "header-project-dropdown-input",
            lablel: "Projects",
            _classList: [],
            isIcon: true,
            isLable: true,
            icon: Icons.general.dropdown_arrow,
            isOptions: true,
            callback: () => { },
            options: [
                {
                    icon: undefined,
                    isIcon: false,
                    isLeft: false,
                    lablel: "Demo Project",
                    callback: () => { navigate('/project') }
                },
                {
                    icon: undefined,
                    isIcon: false,
                    isLeft: false,
                    lablel: "Demo Project",
                    callback: () => { navigate('/project') }
                },
            ]
        }
        let _contacts_data = {
            id: "header-help-dropdown-input",
            lablel: "Build Mate",
            itemsLabel: 'SYSTEM SETTINGS',
            isItemsLabel: false,
            _classList: [],
            activeClass: 'custom-button-dropdown-active-norotate',
            isIcon: true,
            isImg: false,
            img: null,
            isLable: false,
            icon: Icons.general.feedback,
            isOptions: true,
            callback: () => { },
            options: [
                {
                    icon: Icons.general.chat,
                    isIcon: true,
                    isLeft: true,
                    lablel: "Live Chat",
                    callback: () => { }
                },
                {
                    icon: Icons.general.info,
                    isIcon: true,
                    isLeft: true,
                    lablel: "Help Center",
                    callback: () => { navigate('/help-center') }
                },
                {
                    icon: Icons.general.schedule,
                    isIcon: true,
                    isLeft: true,
                    lablel: "Schedule demo",
                    callback: () => { navigate('/schedule-demo') }
                },

            ]
        }
        let contacts_data = {
            id: "header-contact-dropdown-input",
            lablel: "Feedback",
            itemsLabel: 'SYSTEM SETTINGS',
            isItemsLabel: false,
            _classList: [],
            activeClass: 'custom-button-dropdown-active-norotate',
            isIcon: true,
            isImg: false,
            img: null,
            isLable: false,
            icon: Icons.general.whatsapp,
            isOptions: false,
            callback: () => {
                window.open('https://wa.link/2ktfa6', '_blank');
            },
            options: [
            ]
        }
        let feedback_data = {
            id: "header-feedback-dropdown-input",
            lablel: "Feedback",
            itemsLabel: 'SYSTEM SETTINGS',
            isItemsLabel: false,
            _classList: [],
            activeClass: 'custom-button-dropdown-active-norotate',
            isIcon: true,
            isImg: false,
            img: null,
            isLable: false,
            icon: Icons.general.feedback,
            isOptions: false,
            callback: () => { navigate('/app/feedback') },
            options: [
            ]
        }
        let profile_data = {
            id: "header-profile-dropdown-input",
            lablel: "Build Mate",
            itemsLabel: 'SYSTEM SETTINGS',
            isItemsLabel: false,
            _classList: ['custom-dropdown-img'],
            activeClass: 'custom-button-dropdown-active',
            isIcon: true,
            isImg: true,
            img: profile_img_url || Image.User,
            isLable: false,
            icon: Icons.general.dropdown_arrow,
            isOptions: true,
            callback: () => { },
            options: [
                {
                    icon: Icons.general.user,
                    isIcon: true,
                    isLeft: true,
                    lablel: "My Profile",
                    callback: () => { navigate('/app/my_profile') }
                },
                {
                    icon: Icons.general.logout,
                    isIcon: true,
                    isLeft: true,
                    lablel: "Log out",
                    callback: () => { LogoutEvent() }
                },
            ]
        }

        // CustomDropDown(contacts_data, contact_dropdown)
        // CustomDropDown(feedback_data, feedback_dropdown)
        CustomDropDown(profile_data, profile_dropdown)
    }

    const DOM_Events = () => {

        HandleDropDownEvents()

    }

    const MobileSideBar_Event = (e) => {
        let sidebar_contanier = document.querySelector('#project-sidebar-main')

        let sidebar_active_class = "project-sidebar-active"

        if (sidebar_contanier) sidebar_contanier.classList.toggle(sidebar_active_class)
    }


    const HandleHospitalDetials = () => {

        const { hospitalID } = JSON.parse(localStorage.getItem("userdetials"))

        if (hospitalID) setHospitalID(hospitalID)

    }

    useEffect(() => {

        DOM_Events()

        let user = store.user.user
        if (!user || !Object.keys(user).length > 0) LoadStoreData()
        HandleHospitalDetials()
    }, [])

    useEffect(() => {
        let user = store.user.user
        if (user && Object.keys(user).length > 0) setUserDetials(user)
        DOM_Events()
    }, [store])

    return (
        <div className='project-header-main' id='project-header-main'>
            <div className="header-content">
                <div className="header-left">
                    <div className="header-left-item">
                        <Link to={`/app/hospital/${hospitalID}/scheduler`}><img className='header-logo' src={Image.logo} /></Link>
                    </div>
                    <div
                        className="header-right-item header-mobile-menu-btn header-mobile-menu-disabled"
                        id='header-mobile-menu-btn'
                        dangerouslySetInnerHTML={{ __html: Icons.general.mobile_menu }}
                        onClick={(e) => MobileSideBar_Event(e)}
                    >
                    </div>
                </div>
                <div className="header-right">
                    <div className="header-right-item" id='contact-select-dropdown'></div>
                    <div className="header-right-item" id='feedback-select-dropdown'></div>
                    <div className="header-right-item" id='profile-select-dropdown'></div>
                </div>
            </div>
        </div>
    )
}

export default Header;
