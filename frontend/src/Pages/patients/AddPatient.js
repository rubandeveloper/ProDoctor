import React, { useEffect, useState, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
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


const CreateNewProject = ({ props }) => {

    const [isLoading, setIsLoading] = useState(false)
    const [warningAlert, setWarningAlert] = useState(false)
    const [apiFailedMessage, setApiFailedMessage] = useState('Invalid Inputs, Please try again with vaild Inputs!')

    const patients_Handler = new Patients_Handler()

    const { hospitalID, patientId } = useParams();

    const { menuType = 'create', isEditView = false, patient_data } = props

    const navigate = useNavigate();

    const store = useSelector((store) => store)

    const dispatch = useDispatch()
    const { updateState } = new UserAction

    const storeHandler = new StoreHandler({
        dataStack: ['projects'],
        dispatch: dispatch,
        updateState: updateState,
    })

    const [patientData, setPatientData] = useState(patient_data || {})
    const company_clients = store.user.company ? store.user.company.clients || [] : undefined
    const field_settings = store.user.company ? store.user.company.field_settings : undefined
    const CompanySettingsProfile = store.user.company ? store.user.company.settings : undefined
    const currency_type = CompanySettingsProfile ? CompanySettingsProfile.currency || "₹" : "₹"

    const [id, setId] = useState('')
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [pincode, setPincode] = useState('')
    const [bloodgroup, setBloodgroup] = useState('')
    const [weight, setWeight] = useState('')
    const [height, setHeight] = useState('')
    const [patientID, setPatientID] = useState('')
    const [gender, setGender] = useState('')
    const [status, setStatus] = useState('')
    const [address, setAddress] = useState('')
    const [birthdate, setBirthdate] = useState('')
    const [age, setAge] = useState('')
    const [description, setDescription] = useState('')

    const [profileImg, setProfileImg] = useState({})
    const [profileImg_url, setProfileImg_url] = useState('')

    const [ECGDoc, setECGDoc] = useState({})
    const [isECGUpload, setIsECGUpload] = useState(false)

    const [BP_Doc, setBP_Doc] = useState({})
    const [isBPUpload, setIsBPUpload] = useState(false)

    const HandleProfileImageChange = (event) => {
        const file = event.target.files[0];

        if (!file) return

        setProfileImg(file);

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setProfileImg_url(reader.result)
        };


    };


    useEffect(() => {

        let loadData = async () => {

            setIsLoading(true)
            let userdetials = JSON.parse(localStorage.getItem("userdetials"))

            let update_data = {
                patientid: patientId,
                hospital_id: userdetials.hospital_id,
                user_id: userdetials.id,
            }

            let response = await patients_Handler.getPatientsHandler(update_data)


            if (response.success && response.data) {

                setIsLoading(false)

                if (!response.data || !Array.isArray(response.data) || !response.data.length) return

                setPatientData(response.data[0])
            }
            else {
                setIsLoading(false)
                setWarningAlert(true)
                setApiFailedMessage(`${response.message}, Please try again!`)
            }
        }

        loadData()

    }, [])

    useEffect(() => {

        if (birthdate) setAge(Utils.calculateAge(birthdate))
    }, [birthdate])

    const isFile = (variable) => {
        return variable !== null && typeof variable === 'object' && variable.constructor === File;
    }

    useEffect(() => {

        let loadImg = () => {

            if (!isFile(profileImg)) return

            let input = document.getElementById('patient-profile-img')
            const fileList = new DataTransfer();
            fileList.items.add(profileImg);

            input.files = fileList.files;
        }

        loadImg()

    }, [profileImg])

    const getNextProjectId = async () => {

        let userdetials = JSON.parse(localStorage.getItem("userdetials"))

        let update_data = {
            hospital_id: userdetials.hospital_id,
            user_id: userdetials.id,
        }
        setIsLoading(true)

        let response = await patients_Handler.getNextPatientIDHandler(update_data)

        if (response.success) {

            setIsLoading(false)

            let { patientID } = response.data

            setPatientID(patientID || '')
        }
        else {
            setIsLoading(false)
            setWarningAlert(true)
            setApiFailedMessage(`${response.message}, Please try again!`)
        }
    }
    const HandleBackBtn = (e) => {

        if (isEditView) navigate(`/app/hospital/${hospitalID}/patients/${patientId}/profile`)
        else navigate(`/app/hospital/${hospitalID}/patients`)
    }

    const HandleSaveBtn = async (e) => {
        e.preventDefault()

        let userdetials = JSON.parse(localStorage.getItem("userdetials"))

        const formData = new FormData();

        formData.append('patientID', patientID)
        formData.append('name', name)
        formData.append('profile_img', profileImg)
        formData.append('phone', phone)
        formData.append('email', email)
        formData.append('bloodgroup', bloodgroup)
        formData.append('city', city)
        formData.append('state', state)
        formData.append('pincode', pincode)
        formData.append('status', status)
        formData.append('age', age)
        formData.append('gender', gender)
        formData.append('address', address)
        formData.append('description', description)
        formData.append('weight', weight)
        formData.append('height', height)
        formData.append('birthdate', birthdate)
        formData.append('hospital_id', userdetials.hospital_id)
        formData.append('user_id', userdetials.id)

        if (isEditView) {


            formData.append('id', id)

            setIsLoading(true)
            let response = await patients_Handler.updatePatientHandler(formData)

            if (response.success) {

                setIsLoading(false)
                // setEditView(false)
                HandleBackBtn()
            }
            else {

                setIsLoading(false)
                setWarningAlert(true)
                setApiFailedMessage(`${response.message}, Please try again!`)
            }
        }
        else {

            setIsLoading(true)
            let response = await patients_Handler.createPatientHandler(formData)

            if (response.success) {
                setIsLoading(false)
                navigate(`/app/hospital/${hospitalID}/patients`)
            }
            else {
                setIsLoading(false)
                setWarningAlert(true)
                setApiFailedMessage(`${response.message}, Please try again!`)
            }
        }

    }

    useEffect(() => {

        if (!isEditView) getNextProjectId()

        if (isEditView && Object.keys(patientData).length) {

            setId(patientData._id || '')
            setName(patientData.name || '')
            setPatientID(patientData.patientID || '')
            setStatus(patientData.status || '')
            setBloodgroup(patientData.bloodgroup || '')
            setProfileImg(Utils.dataURLtoFile(`data:image/png;base64,${patientData.profile_img}`, patientData.name))
            setProfileImg_url(patientData.profile_img ? `data:image/png;base64,${patientData.profile_img}` : '')
            setAddress(patientData.address || '')
            setCity(patientData.city || '')
            setState(patientData.state || '')
            setPincode(patientData.pincode || '')
            setDescription(patientData.description || '')
            setAge(patientData.age || '')
            setGender(patientData.gender || '')
            setPhone(patientData.phone || '')
            setEmail(patientData.email || '')
            setWeight(patientData.weight || '')
            setHeight(patientData.height || '')
            setBirthdate(patientData.birthdate || '')
        }

    }, [patientData])

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

            <div className="project-addpatient-main">
                <form className="addpatient-content" onSubmit={HandleSaveBtn}>
                    <div className="addpatient-header">
                        <div className="header-left">
                            <div className="header-item" >
                                <div
                                    onClick={(e) => HandleBackBtn(e)}
                                    className="header-back-btn"
                                    dangerouslySetInnerHTML={{ __html: Icons.general.back_arrow }}
                                ></div>
                            </div>
                            <div className="header-item header-title">{menuType == 'create' ? 'Add' : 'Edit'} Patient</div>
                        </div>
                        <div className="header-right">
                        </div>
                    </div>
                    <div className="addpatient-sections" >
                        <div className="addpatient-section">
                            <div className="section-profile-img">
                                <input
                                    type="file"
                                    id='patient-profile-img'
                                    accept="image/jpg, image/jpeg, image/png"
                                    onChange={(e) => HandleProfileImageChange(e)}
                                />
                                <label htmlFor="patient-profile-img">
                                    <div className="left">
                                        <img src={profileImg_url || Images.User} alt="" />
                                    </div>
                                    <div className="right">
                                        <span className='label'>Profile Image</span>
                                        <span className='button'>Upload</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                        <div className="addpatient-section">
                            <div className="section-title">GENERAL INFO</div>
                            <div className="section-items">
                                <div className="section-itm">
                                    <TextInput
                                        props={{
                                            id: "addpatient-name",
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
                                <div className="section-itm">
                                    <TextInput
                                        props={{
                                            id: "addpatient-projectid",
                                            value: patientID,
                                            readOnly: true,
                                            placeholder: '',
                                            setValue: (value) => setPatientID(value),
                                            isIcon: false,
                                            isLabel: true,
                                            isRequired: true,
                                            label: "Project ID",
                                        }}
                                    />
                                </div>

                                <div className="section-itm">
                                    <SelectInput
                                        props={{
                                            id: "addpatient-gender",
                                            value: gender,
                                            placeholder: '',
                                            options: [
                                                {
                                                    value: "male",
                                                    label: "Male"
                                                },
                                                {
                                                    value: "female",
                                                    label: "Female"
                                                },
                                                {
                                                    value: "transgender",
                                                    label: "Transgender"
                                                },
                                            ],
                                            setValue: (value, label) => {
                                                setGender(value)
                                            },
                                            isIcon: false,
                                            isLabel: true,
                                            isRequired: false,
                                            label: "Gender",
                                        }}
                                    />
                                </div>
                                <div className="section-itm">
                                    <SelectInput
                                        props={{
                                            id: "addpatient-status",
                                            value: status,
                                            placeholder: '',
                                            options: [
                                                {
                                                    value: "general",
                                                    label: "General"
                                                },
                                                {
                                                    value: "emergency",
                                                    label: "Emergency"
                                                },
                                            ],
                                            setValue: (value, label) => {
                                                setStatus(value)
                                            },
                                            isIcon: false,
                                            isLabel: true,
                                            isRequired: false,
                                            label: "Status",
                                        }}
                                    />
                                </div>
                                <div className="section-itm">
                                    <TextInput
                                        props={{
                                            id: "addpatient-bloodgroup",
                                            value: bloodgroup,
                                            readOnly: false,
                                            placeholder: '',
                                            setValue: (value) => setBloodgroup(value),
                                            isIcon: false,
                                            isLabel: true,
                                            isRequired: true,
                                            label: "Blood Group.",
                                        }}
                                    />
                                </div>
                                <div className="section-itm">
                                    <TextInput
                                        props={{
                                            id: "addpatient-phone",
                                            value: phone,
                                            readOnly: false,
                                            placeholder: '',
                                            setValue: (value) => setPhone(value),
                                            isIcon: false,
                                            isLabel: true,
                                            isRequired: true,
                                            label: "Phone No.",
                                        }}
                                    />
                                </div>
                                <div className="section-itm">
                                    <DateTimeInput
                                        props={{
                                            id: "addpatient-birthdate",
                                            value: birthdate,
                                            placeholder: '',
                                            setValue: (value) => setBirthdate(value),
                                            isIcon: false,
                                            isLabel: true,
                                            icon: Icons.general.schedule,
                                            isRequired: true,
                                            label: "Birth Date",
                                        }}
                                    />
                                </div>
                                <div className="section-itm">
                                    <TextInput
                                        props={{
                                            id: "addpatient-weight",
                                            value: weight,
                                            readOnly: false,
                                            placeholder: '',
                                            setValue: (value) => setWeight(value),
                                            isIcon: false,
                                            isLabel: true,
                                            isRequired: false,
                                            label: "Weight (Kg)",
                                        }}
                                    />
                                </div>
                                <div className="section-itm">
                                    <TextInput
                                        props={{
                                            id: "addpatient-height",
                                            value: height,
                                            readOnly: false,
                                            placeholder: '',
                                            setValue: (value) => setHeight(value),
                                            isIcon: false,
                                            isLabel: true,
                                            isRequired: false,
                                            label: "Heigh (Cm)",
                                        }}
                                    />
                                </div>
                                <div className="section-itm">
                                    <TextInput
                                        props={{
                                            id: "addpatient-email",
                                            value: email,
                                            readOnly: false,
                                            placeholder: '',
                                            setValue: (value) => setEmail(value),
                                            isIcon: false,
                                            isLabel: true,
                                            isRequired: false,
                                            label: "Email Address.",
                                        }}
                                    />
                                </div>
                                <div className="section-itm">
                                    <TextInput
                                        props={{
                                            id: "addpatient-city",
                                            value: city,
                                            readOnly: false,
                                            placeholder: '',
                                            setValue: (value) => setCity(value),
                                            isIcon: false,
                                            isLabel: true,
                                            isRequired: false,
                                            label: "City",
                                        }}
                                    />
                                </div>
                                <div className="section-itm">
                                    <TextInput
                                        props={{
                                            id: "addpatient-state",
                                            value: state,
                                            readOnly: false,
                                            placeholder: '',
                                            setValue: (value) => setState(value),
                                            isIcon: false,
                                            isLabel: true,
                                            isRequired: false,
                                            label: "State",
                                        }}
                                    />
                                </div>
                                <div className="section-itm">
                                    <TextInput
                                        props={{
                                            id: "addpatient-pincode",
                                            value: pincode,
                                            readOnly: false,
                                            placeholder: '',
                                            setValue: (value) => setPincode(value),
                                            isIcon: false,
                                            isLabel: true,
                                            isRequired: false,
                                            label: "Pincode",
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="section-full-itm">
                                <div className="head">
                                    <div className="icon" dangerouslySetInnerHTML={{ __html: Icons.general.description }}></div>
                                    <div className="label">Address</div>
                                </div>
                                <div className="item-expanded">
                                    <textarea
                                        id=""
                                        cols="30"
                                        rows="10"
                                        value={address}
                                        onChange={(value) => setAddress(value.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                            <div className="section-full-itm">
                                <div className="head">
                                    <div className="icon" dangerouslySetInnerHTML={{ __html: Icons.general.description }}></div>
                                    <div className="label">Description</div>
                                </div>
                                <div className="item-expanded">
                                    <textarea
                                        id=""
                                        cols="30"
                                        rows="10"
                                        value={description}
                                        onChange={(value) => setDescription(value.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="addpatient-section" style={{ display: 'none' }}>
                            <div className="section-title">DOCUMENT</div>
                            <div className="section-items">
                                <div className="section-itm-document">
                                    <input
                                        type="file"
                                        id='patient-document-ecg'
                                        onChange={(e) => {
                                            setECGDoc(e.target.files[0])
                                            setIsECGUpload(true)
                                        }}
                                    />
                                    <label className='document-preview' htmlFor="patient-document-ecg">
                                        <span className='label'> ECR Report (PDF)</span>
                                        <div className='img'>
                                            <img src={isECGUpload ? Images.ECG_Default : Images.UploadDoc_Default} alt="" />
                                        </div>
                                    </label>
                                </div>
                                <div className="section-itm-document">
                                    <input
                                        type="file"
                                        id='patient-document-bp'
                                        onChange={(e) => {
                                            setBP_Doc(e.target.files[0])
                                            setIsBPUpload(true)
                                        }}
                                    />
                                    <label className='document-preview' htmlFor="patient-document-bp">
                                        <span className='label'> ECR Report (PDF)</span>
                                        <div className='img'>
                                            <img src={isBPUpload ? Images.BP_Default : Images.UploadDoc_Default} alt="" />
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="addpatient-footer">
                        <div
                            className="footer-itm button-item"
                            onClick={(e) => HandleBackBtn(e)}
                        >
                            <div className="label">Cancel</div>
                        </div>
                        <button
                            className="footer-itm button-item button-save"
                            type='submit'
                        >

                            <div
                                className="icon"
                                dangerouslySetInnerHTML={{ __html: Icons.general.save }}
                            ></div>
                            <div className="label">Save</div>
                        </button>
                    </div>
                </form>
            </div>
        </>
    )
}

export default CreateNewProject;