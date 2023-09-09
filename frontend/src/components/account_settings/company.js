import React, { useEffect, useState, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import UserAction from '../../redux/action/userAction'
import StoreHandler from '../../redux/StoreHandler'


import Images from '../../assets/Images'
import Icons from '../../assets/Icons'
import Utils from '../../utils'
import Loading from '../Loading'

import hospital_Handler from '../../Handlers/hospital/hospital'
import AlertPopup from '../AlertPopup'

const hospital = () => {

    const [isLoading, setIsLoading] = useState(false)

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




    const [changesMade, setChangesMade] = useState(false)
    const [discardChanges, setDiscardChanges] = useState(false)
    const [warningAlert, setWarningAlert] = useState(false)
    const [apiFailedMessage, setApiFailedMessage] = useState('Invalid Inputs, Please try again with vaild Inputs!')


    const hospitalProfile = store.user.hospital || undefined
    const ishospital = store.user.hospital ? Object.keys(store.user.hospital).length : false

    const EditView = () => {

        const exits_profile_img = ishospital ? hospitalProfile.logo_img ? Utils.dataURLtoFile(`data:image/png;base64,${hospitalProfile.logo_img}`, hospitalProfile.name) : '' : ''

        const [name, setName] = useState(ishospital ? hospitalProfile.name || "" : "")
        const [email, setEmail] = useState(ishospital ? hospitalProfile.email || "" : "")
        const [phone, setPhone] = useState(ishospital ? hospitalProfile.phone || "" : "")
        const [address, setAdress] = useState(ishospital ? hospitalProfile.address || "" : "")
        const [website, setWebsite] = useState(ishospital ? hospitalProfile.website || "" : "")
        const [timezone, setTimezone] = useState(ishospital ? hospitalProfile.timezone || "" : "")
        const [profileImg, setProfileImg] = useState(exits_profile_img || {})

        const [profileImgURL, setProfileImgURL] = useState(ishospital && hospitalProfile.logo_img ? `data:image/png;base64,${hospitalProfile.logo_img}` : '')

        const [inputChanged, setInputChanged] = useState(false)

        const [socialLinks, setSocialLinks] = useState(ishospital && hospitalProfile.social_links ? hospitalProfile.social_links : {
            facebook: '',
            instagram: '',
            linkedin: '',
            twitter: '',
            googlebusiness: '',
        })

        const saveEvent = async (e) => {
            e.preventDefault()

            if (!inputChanged) {
                console.log('No Chnages made');
                return
            }

            const formData = new FormData();

            let userdetials = JSON.parse(localStorage.getItem("userdetials"))

            formData.append('name', name)
            formData.append('email', email)
            formData.append('phone', phone)
            formData.append('address', address)
            formData.append('website', website)
            formData.append('timezone', timezone)
            formData.append('socialLinks', socialLinks)
            formData.append('logo_img', profileImg)
            formData.append('user_id', userdetials.id)
            formData.append('hospital_id', userdetials.hospital_id)

            setIsLoading(true)

            let response = await hospital_Handler.updatehospitalHandler(formData)

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
        const handleImageChange = (event) => {

            const file = event.target.files[0];

            if (!file) return

            setProfileImg(file);

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setProfileImgURL(reader.result)
            };
        };
        const uploadImage = (event) => {

            let input = document.getElementById('settingsContent-profile-image')
            input.click()
        };

        const SetSocialLink = (type, value) => {
            setSocialLinks((prevSocialLinks) => ({
                ...prevSocialLinks,
                [type]: value,
            }));
        }

        useEffect(() => {

            const parentContainer = document.querySelector('#settingsContent-hospital-main')
            const inputs = parentContainer.querySelectorAll('input')


            const handleInputChange = (e) => {

                let isValid = false

                inputs.forEach(inpt => {
                    if (inpt.value.length > 0) isValid = true
                })

                // setChangesMade(isValid)

            };

            inputs.forEach((input) => {
                input.addEventListener('input', handleInputChange);
            });

        }, [])

        useEffect(() => {

            let isChanged = false

            if (name != hospitalProfile.name) isChanged = true
            if (email != hospitalProfile.email) isChanged = true
            if (phone != hospitalProfile.phone) isChanged = true
            if (address != hospitalProfile.address) isChanged = true
            if (website != hospitalProfile.website) isChanged = true
            if (timezone != hospitalProfile.timezone) isChanged = true
            if (profileImg != hospitalProfile.logo_img) isChanged = true

            console.log(isChanged, 'isChanged');

            setInputChanged(isChanged)

        }, [name, email, phone, address, website, timezone, profileImg])

        const handleDiscardChanges = () => {

            setName(hospitalProfile.name || "")
            setEmail(hospitalProfile.email || "")
            setPhone(hospitalProfile.phone || "")
            setAdress(hospitalProfile.address || "")
            setWebsite(hospitalProfile.website || "")
            setTimezone(hospitalProfile.timezone || "")

        }
        const isFile = (variable) => {
            return variable !== null && typeof variable === 'object' && variable.constructor === File;
        }

        useEffect(() => {

            let loadImg = () => {

                if (!isFile(profileImg)) return

                let input = document.getElementById('settingsContent-profile-image')
                const fileList = new DataTransfer();
                fileList.items.add(profileImg);

                input.files = fileList.files;
            }

            loadImg()

        }, [profileImg])

        return (
            <form className="settingsContent-editview-main" id='settingsContent-hospital-main' onSubmit={saveEvent}>


                <div className="settingsContent-content-title">hospital settings</div>

                <div className="settingsContent-editview-content">
                    <div className="editview-input-items">
                        <div className="editview-input-item">
                            <label htmlFor="profile-name" data-required='*'>Hospital name</label>
                            <input
                                type="text"
                                id='profile-name'
                                required
                                placeholder='Enter your Hospital name'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="editview-input-item">
                            <label htmlFor="profile-email" data-required='*'>hospital Email</label>
                            <input
                                type="text"
                                id='profile-email'
                                required
                                placeholder='Enter your hospital email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="editview-input-item">
                            <label htmlFor="profile-phone" data-required='*' >hospital Phone Number</label>
                            <input
                                type="number"
                                required
                                id='profile-phone'
                                placeholder='Enter your hospital phone number'
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>
                        <div className="editview-input-item">
                            <label htmlFor="profile-address" data-required='*' >hospital Address</label>
                            <input
                                type="text"
                                required
                                id='profile-address'
                                placeholder='Enter your hospital address'
                                value={address}
                                onChange={(e) => setAdress(e.target.value)}
                            />
                        </div>
                        <div className="editview-input-item">
                            <label htmlFor="profile-website" >hospital Website</label>
                            <input
                                type="text"
                                id='profile-website'
                                placeholder='Enter your hospital website'
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                            />
                        </div>
                        <div className="editview-input-item">
                            <label htmlFor="profile-timezone" >Time zone</label>
                            <select
                                id='profile-timezone'
                                value={timezone}
                                onInput={(e) => setTimezone(e.target.value)}
                            >
                                <option value="(GMT+05:30) Asia/Calcutta">(GMT+05:30) Asia/Calcutta</option>
                                <option value="(GMT+05:30) Asia/Calcutta">(GMT+05:30) Asia/Calcutta</option>

                            </select>
                        </div>
                    </div>

                    <div className='settings-section-title'>hospital logo</div>
                    <div className="editview-image-main">
                        <div className="editview-image">
                            <img src={profileImgURL || Images.User} />
                        </div>
                        <div className="editview-image-btn">

                            <span className='label'>Upload hospital logo</span>
                            <span className='sm-label'>PNG or JPG (max 1MB)</span>
                            <input className='upload-input' accept="image/jpg, image/jpeg, image/png" onChange={(e) => handleImageChange(e)} type="file" id='settingsContent-profile-image' />
                            <span className='upload-button' onClick={uploadImage}>Choose Image</span>
                        </div>
                    </div>

                    <div className='settings-section-title'>Social media</div>
                    <div className="editview-input-items">
                        <div className="editview-input-item">
                            <label htmlFor="profile-social-fb" >Facebook</label>
                            <input
                                type="text"
                                id='profile-social-fb'
                                placeholder='Enter Facebook URL'
                                value={socialLinks.facebook}
                                onChange={(e) => SetSocialLink('facebook', e.target.value)}
                            />
                        </div>
                        <div className="editview-input-item">
                            <label htmlFor="profile-social-linkedin">Linkedin</label>
                            <input
                                type="text"
                                id='profile-social-linkedin'
                                placeholder='Enter Linkedin URL'
                                value={socialLinks.linkedin}
                                onChange={(e) => SetSocialLink('linkedin', e.target.value)}
                            />
                        </div>
                        <div className="editview-input-item">
                            <label htmlFor="profile-social-twitter" >Twitter</label>
                            <input
                                type="text"
                                id='profile-social-twitter'
                                placeholder='Enter Twitter URL'
                                value={socialLinks.twitter}
                                onChange={(e) => SetSocialLink('twitter', e.target.value)}
                            />
                        </div>
                        <div className="editview-input-item">
                            <label htmlFor="profile-social-insta" >Instagram</label>
                            <input
                                type="text"
                                id='profile-social-insta'
                                placeholder='Enter Instagram URL'
                                value={socialLinks.instagram}
                                onChange={(e) => SetSocialLink('instagram', e.target.value)}
                            />
                        </div>
                        <div className="editview-input-item">
                            <label htmlFor="profile-social-gbusiness" >Google my business</label>
                            <input
                                type="text"
                                id='profile-social-gbusiness'
                                placeholder='Enter Google Business URL'
                                value={socialLinks.googlebusiness}
                                onChange={(e) => SetSocialLink('googlebusiness', e.target.value)}
                            />
                        </div>

                    </div>

                </div>
                <div className={`editview-button-items ${inputChanged ? '' : 'editview-button-items-disabled'}`}>
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

export default hospital;
