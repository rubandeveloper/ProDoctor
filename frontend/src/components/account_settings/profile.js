import React, { useEffect, useState, useRef, Fragment } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import UserAction from '../../redux/action/userAction'
import StoreHandler from '../../redux/StoreHandler'

import Images from '../../assets/Images'
import Icons from '../../assets/Icons'
import Utils from '../../utils'
import Loading from '../Loading'
import SystemNotification from '../../Pages/ToastMsg'
import { CostInput, TextInput, SelectInput, RadioInput } from '../Inputs'
import AlertPopup from '../AlertPopup'

import User_Handler from '../../Handlers/Users/User'


const Profile = () => {

    const user_Handler = new User_Handler()
    const sysNotification = new SystemNotification()
    const [isLoading, setIsLoading] = useState(false)
    const [userDetials, setUserDetials] = useState({})
    const [warningAlert, setWarningAlert] = useState(false)
    const [apiFailedMessage, setApiFailedMessage] = useState('Invalid Inputs, Please try again with vaild Inputs!')


    const store = useSelector((store) => store)
    const dispatch = useDispatch()
    const { updateState } = new UserAction

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

    const [editView, setEditView] = useState(false)


    const CreateSectionItem = ({ props }) => {

        const { title, items } = props

        return (
            <div className="userprofile-content-section">
                <div className="section-title">{title}</div>
                <div className="section-items">

                    {items.map((itm, i) => {
                        const { label, value } = itm

                        return (
                            <div className="section-item" key={i}>
                                <div className="label">{label}</div>
                                <div className="value">{value}</div>
                            </div>
                        )

                    })}
                </div>

            </div>
        )

    }

    const SectionsItems = () => {

        let profile_items = [{
            title: "Personal Information",
            items: [
                {
                    label: "Username",
                    value: userDetials.username || ""
                },
                {
                    label: "Email",
                    value: userDetials.email || ""
                },
                {
                    label: "Phone",
                    value: userDetials.phone || ""
                },
            ]
        }]


        return (
            <div className="userprofile-content-sections">
                {profile_items.map((section, i) => (<CreateSectionItem props={section} key={i} />))}
            </div>
        )
    }

    const ProfileShortView = () => {

        const profile_img_url = userDetials && userDetials.profile_img ? `data:image/png;base64,${userDetials.profile_img}` : ''

        return (
            <div className="userprofile-content-profileshort">
                <div className="profileshort-left">
                    <div className="profileshort-img">
                        <img src={profile_img_url || Images.User} />
                    </div>
                    <div className="profileshort-detials">
                        <div className="detials-title">{userDetials.username || ""}</div>
                        <div className="detials-subtitle">General admin</div>
                        <div className="detials-desc">{userDetials.email || ""}</div>
                    </div>
                </div>
                <div className="profileshort-right">
                    <div className="userprofile-edit-btn" onClick={(e) => setEditView(true)}>
                        <span className='label'>Edit</span>
                        <span
                            className='icon'
                            dangerouslySetInnerHTML={{ __html: Icons.general.edit }}
                        ></span>
                    </div>
                </div>
            </div>
        )
    }

    const ProfileEditView = () => {


        const exits_profile_img = Utils.dataURLtoFile(`data:image/png;base64,${userDetials.profile_img}`, userDetials.username)


        const [username, setUsername] = useState(userDetials.username || "")
        const [email, setEmail] = useState(userDetials.email || "")
        const [phone, setPhone] = useState(userDetials.phone || "")
        const [profileImg, setProfileImg] = useState(exits_profile_img || {})
        const [profileImg_url, setProfileImg_url] = useState(userDetials && userDetials.profile_img ? `data:image/png;base64,${userDetials.profile_img}` : '')

        const [fileValue, setFileValue] = useState({})

        const saveEvent = async (e) => {
            e.preventDefault()

            const formData = new FormData();

            let userdetials = JSON.parse(localStorage.getItem("userdetials"))

            formData.append('username', username)
            formData.append('email', userdetials.email)
            formData.append('work_email', email)
            formData.append('phone', phone)
            formData.append('profile_img', profileImg)

            setIsLoading(true)

            let response = await user_Handler.updateProfileHandler(formData)

            if (response.success) {
                LoadStoreData()
                setIsLoading(false)
                setEditView(false)
            }
            else {
                setIsLoading(false)
                setWarningAlert(true)
                setApiFailedMessage(`${response.message}, Please try again!`)
            }

        }

        const handleImageChange = (event) => {
            const file = event.target.files[0];

            if (!file) return

            setProfileImg(file);

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setProfileImg_url(reader.result)
            };


        };
        const uploadImage = (event) => {

            let input = document.getElementById('userprofile-profile-image')
            input.click()
        };

        const isFile = (variable) => {
            return variable !== null && typeof variable === 'object' && variable.constructor === File;
        }

        useEffect(() => {

            let loadImg = () => {

                if (!isFile(profileImg)) return

                let input = document.getElementById('userprofile-profile-image')
                const fileList = new DataTransfer();
                fileList.items.add(profileImg);

                input.files = fileList.files;
            }

            loadImg()

        }, [profileImg])

        return (
            <form className="userprofile-editview-main" onSubmit={saveEvent}>
                <div className="editview-image-main">
                    <div className="editview-image">
                        <img src={profileImg_url || Images.User} />
                    </div>
                    <div className="editview-image-btn">

                        <span className='label'>Upload a category image</span>
                        <span className='sm-label'>PNG or JPG (max 1MB)</span>
                        <input className='upload-input' accept="image/jpg, image/jpeg, image/png" onChange={(e) => handleImageChange(e)} type="file" id='userprofile-profile-image' />
                        <span className='upload-button' onClick={uploadImage}>Choose Image</span>
                    </div>
                </div>
                <div className="userprofile-editview-content">
                    <div className="editview-input-items">
                        <div className="editview-input-item">
                            <label htmlFor="profile-username" data-required='*' >Username</label>
                            <input
                                type="text"
                                id='profile-username'
                                required
                                placeholder='Enter your username'
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div className="editview-input-item">
                            <label htmlFor="profile-email" data-required='*'>Email</label>
                            <input
                                type="text"
                                id='profile-email'
                                required
                                placeholder='Enter your email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="editview-input-item">
                            <label htmlFor="profile-phone" data-required='*'>Phone</label>
                            <input
                                type="number"
                                id='profile-phone'
                                placeholder='Enter your phone'
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="editview-button-items">
                        <button className="editview-button-item" onClick={(e) => setEditView(false)}>
                            <span className='label'>Cancel</span>
                        </button>
                        <button type='submit' className="editview-button-item button-save">
                            <span
                                className='icon'
                                dangerouslySetInnerHTML={{ __html: Icons.general.save }}
                            ></span>
                            <span className='label' >Save Changes</span>
                        </button>
                    </div>
                </div>
            </form>
        )
    }

    useEffect(() => {

        if (store.user.user) setUserDetials(store.user.user)

    }, [store])

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

            <div className='project-userprofile-main' id='project-userprofile-main'>
                <div className="userprofile-content">
                    <div className="userprofile-content-title">My Profile</div>

                    {!editView ? <ProfileShortView /> : null}
                    {!editView ? <SectionsItems /> : <ProfileEditView />}

                </div>
            </div>
        </>
    )
}

export default Profile;
