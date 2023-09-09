import React, { useEffect, useState, useRef } from 'react'
import { Route, Routes, BrowserRouter, Link, useNavigate, useParams, json } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import UserAction from '../../redux/action/userAction'
import StoreHandler from '../../redux/StoreHandler'
import ReactQuill from 'react-quill';

import Images from '../../assets/Images'
import Icons from '../../assets/Icons'
import Utils from '../../utils'
import { CostInput, DateTimeInput, TextInput, SelectInput, RadioInput } from '../../components/Inputs'
import WorkSheet from '../../components/worksheets/worksheets'
import Loading from '../../components/Loading'
import AlertPopup from '../../components/AlertPopup'

import HandFreeWhiteBoard from './HandFreeWhiteBoard'

import OpenText_Handler from '../../Handlers/OpenText/OpenText'
import Patients_Handler from '../../Handlers/Patients/Patients'

import FileViewer from './FileViewer'

const ViewEditAppointment = ({ props }) => {

    let { isEditView = false } = props
    const [isLoading, setIsLoading] = useState(false)
    const [warningAlert, setWarningAlert] = useState(false)
    const [apiFailedMessage, setApiFailedMessage] = useState('Invalid Inputs, Please try again with vaild Inputs!')
    const navigate = useNavigate();
    const { hospitalID, patientId, appointmentID } = useParams();

    const patients_Handler = new Patients_Handler()
    const openText_Handler = new OpenText_Handler()

    const [appointmentData, setAppointmentData] = useState({})
    const [appointmentId, setAppointmentId] = useState('')
    const [status, setStatus] = useState('')
    const [diagnosis, setDiagnosis] = useState('')
    const [temperature, setTemperature] = useState('')
    const [bloodPressure, setBloodPressure] = useState('')
    const [bloodSugar, setBloodSugar] = useState('')
    const [date, setDate] = useState('')
    const [description, setDescription] = useState('')
    const [additionalNotes, setAdditionalNotes] = useState(true);
    const [checkUpDetials, setCheckUpDetials] = useState(true);
    const [checkUpDocuments, setCheckUpDocuments] = useState(true);

    const [documents, setDocuments] = useState([])
    const [opentext_prescription_data, setOpentext_prescription_data] = useState(undefined)



    const [previewDocument, setPreviewDocument] = useState(undefined)
    const [uploadDocument, setUploadDocument] = useState(false)
    const [openPrescriptionBoard, setOpenPrescriptionBoard] = useState(false)
    const [prescriptionBoardImg, setPrescriptionBoardImg] = useState('')

    const [opentextImg, setOpenTextImg] = useState(undefined)

    const isFile = (variable) => {
        return variable !== null && typeof variable === 'object' && variable.constructor === File;
    }

    const ReadOnly = isEditView != true

    const LoadAppointment = async () => {

        let userdetials = JSON.parse(localStorage.getItem("userdetials"))

        let updated_data = {
            appointment_id: appointmentID,
            patient_id: patientId,
            user_id: userdetials.id,
            hospital_id: userdetials.hospital_id
        }
        setIsLoading(true)

        let response = await patients_Handler.getAppointmentsHandler(updated_data)

        if (response.success && response.data) {

            setIsLoading(false)

            if (!response.data) return

            if (Array.isArray(response.data) && response.data.length) {


                let data = response.data[0]

                if (data.opentext_prescription) setOpentext_prescription_data(data.opentext_prescription)
                setAppointmentData(data)
            }

        }
        else {
            setIsLoading(false)
            setWarningAlert(true)
            setApiFailedMessage(`${response.message}, Please try again!`)
        }

    }
    useEffect(() => {

        LoadAppointment()

    }, [])
    useEffect(() => {

        if (appointmentData && Object.keys(appointmentData).length) {

            setAppointmentId(appointmentData._id)
            setDiagnosis(appointmentData.diagnosis)
            setDate(appointmentData.date)
            setStatus(appointmentData.status)
            setDescription(appointmentData.description)
            setTemperature(appointmentData.temperature)
            setBloodPressure(appointmentData.bloodPressure)
            setBloodSugar(appointmentData.bloodSugar)


            if (Array.isArray(appointmentData.documents)) {

                let _documents = appointmentData.documents.map(doc => {

                    let { id, file, name } = doc

                    return {
                        id,
                        name,
                        file_url: `data:image/png;base64,${file}`,
                        file: Utils.dataURLtoFile(`data:image/png;base64,${file}`, name)
                    }

                })



                setDocuments(_documents)
            }


        }

    }, [appointmentData])


    const HandlePopupSubmit = async (e) => {
        e.preventDefault()

        let userdetials = JSON.parse(localStorage.getItem("userdetials"))

        const formData = new FormData();
        const openTextFormData = new FormData();
        const openTextRiskFormData = new FormData();

        let _documents = [...documents]

        if (prescriptionBoardImg) {

            let exist_index = _documents.findIndex(d => d.name == "Prescription")
            let file = Utils.dataURLtoFile(prescriptionBoardImg, "Prescription")

            if (exist_index != -1) {
                _documents[exist_index].file_url = prescriptionBoardImg
                _documents[exist_index].file = file
            } else {

                _documents.push({
                    id: Utils,
                    name: "Prescription",
                    file_url: prescriptionBoardImg,
                    file: file
                })

            }
            openTextFormData.append("name", file)
            openTextRiskFormData.append("File", file)

        }

        let file_names = _documents.map(doc => doc.name).join(',')

        _documents.forEach(async (doc) => {
            formData.append(doc.name, doc.file)
        })

        const uploadPrescriptionImg = await openText_Handler.UploadFile(openTextFormData)
        const checkPrescriptionImg = await openText_Handler.checkRish(openTextRiskFormData)

        if (uploadPrescriptionImg.success) {

            let { id, blobId, createDate, fileName, properties, providerId, _links } = uploadPrescriptionImg.data

            if (checkPrescriptionImg.success) {

                let TME_res = checkPrescriptionImg.data.results.tme.result

                if (TME_res) {

                    let { ncategorizer, nfinder } = TME_res.Results

                    let risks = ncategorizer.map(cat => {

                        return cat.KnowledgeBase.map(k => k.KBid).join('--')
                    }).join('-|-')

                    formData.append('opentext_prescription_risk', risks)
                }
            }

            formData.append('opentext_prescription_id', id)
            formData.append('opentext_prescription_blobId', blobId)
            formData.append('opentext_prescription_fileName', fileName)
            formData.append('opentext_prescription_providerId', providerId)
            formData.append('opentext_prescription_MD5', properties.MD5)
            formData.append('opentext_prescription_download_link', _links.download.href)
            formData.append('opentext_prescription_self_link', _links.self.href)
        }

        formData.append('file_names', file_names)
        formData.append('id', appointmentId)
        formData.append('date', date)
        formData.append('diagnosis', diagnosis)
        formData.append('description', description)
        formData.append('status', status)
        formData.append('temperature', temperature)
        formData.append('bloodPressure', bloodPressure)
        formData.append('bloodSugar', bloodSugar)

        formData.append('documents', _documents)
        formData.append('patient_id', patientId)

        formData.append('hospital_id', userdetials.hospital_id)
        formData.append('user_id', userdetials.id)

        setIsLoading(true)

        let response = await patients_Handler.updateAppointmentHandler(formData)

        if (response.success) {
            setIsLoading(false)

            navigate(`/app/hospital/${hospitalID}/patients/${patientId}/visits`)
        }
        else {
            setIsLoading(false)
            setWarningAlert(true)
            setApiFailedMessage(`${response.message}, Please try again!`)
        }

    }

    const Popup_Header = () => {

        return (
            <div className="side-popup-header">
                <div className="header-item-select">
                    <div className="header-item-select-content">
                        <span className="icon" dangerouslySetInnerHTML={{ __html: Icons.general.fee }}></span>
                        <div className="label">{isEditView ? 'Update' : 'View'} Appointment</div>

                    </div>
                </div>
                <div
                    className="header-item-close"
                    onClick={(e) => {
                        navigate(`/app/hospital/${hospitalID}/patients/${patientId}/visits`)
                    }}
                    dangerouslySetInnerHTML={{ __html: Icons.general.close }}
                ></div>
            </div>
        );
    };
    const Popup_Footer = () => {


        return (
            <div className="sidebar-popup-footer">
                <div className="footer-item action-items">
                    <div className="action-preview">
                    </div>
                    <button
                        className="action-btn"
                        type='submit'
                    >
                        <div className="icon" dangerouslySetInnerHTML={{ __html: isEditView ? Icons.general.save : Icons.general.add_btn }}></div>
                        <div className="label">{isEditView ? 'Save' : 'Add'} Appointment</div>
                    </button>
                </div>
            </div>
        );
    };


    const HandleDownloadDocument = (document) => {
        console.log(document, 'document');
    }

    const HandlePrescriptionView = async () => {

        if (opentext_prescription_data) {

            const response = await openText_Handler.downloadFile({ id: opentext_prescription_data.id })

            setOpenTextImg(response)
        }
    }
    const HandlePrescriptionBoard = () => {
        setOpenPrescriptionBoard(true)
    }
    const HandlePredicition = () => {
    }

    const HandleDocumentPreview = () => {

        const [img_url, setImg_url] = useState('')

        useEffect(() => {

            if (previewDocument) {

                const reader = new FileReader();
                reader.readAsDataURL(previewDocument);
                reader.onload = () => {
                    setImg_url(reader.result)
                };
            }
        }, [])

        return (
            <div className="side-popup-container">
                <div className="side-popup-header">
                    <div className="header-item-select">
                        <div className="header-item-select-content">
                            <span className="icon" dangerouslySetInnerHTML={{ __html: Icons.general.fee }}></span>
                            <div className="label">Document Preview</div>

                        </div>
                    </div>
                    <div
                        className="header-item-close"
                        onClick={(e) => {
                            setPreviewDocument(undefined)
                        }}
                        dangerouslySetInnerHTML={{ __html: Icons.general.close }}
                    ></div>
                </div>
                <div className="sidebar-popup-content">
                    <div className="content-section">
                        <div className="document-preview-main">
                            <img src={img_url || Images.UploadDoc_Default} />
                        </div>
                    </div>
                </div>

            </div>
        )
    }
    const HandleDocumentDownload = (document) => {
        console.log(document);
    }


    const HandleUploadDocumentForm = () => {

        const [file_name, setFile_name] = useState('')
        const [img_file, setImg_file] = useState('')
        const [img_url, setImg_url] = useState('')


        const HandleImageChange = (event) => {
            const file = event.target.files[0];

            if (!file) return

            setImg_file(file);

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setImg_url(reader.result)
            };

        };

        const HandleImageSave = (e) => {
            setUploadDocument(false)

            let _documents = [...documents]

            _documents.push({
                id: Utils.getUniqueId(),
                name: file_name,
                file: img_file,
                file_url: img_url
            })
            setDocuments(_documents)
        }

        return (
            <div className="side-popup-container">
                <div className="side-popup-header">
                    <div className="header-item-select">
                        <div className="header-item-select-content">
                            <span className="icon" dangerouslySetInnerHTML={{ __html: Icons.general.fee }}></span>
                            <div className="label">Upload Document</div>

                        </div>
                    </div>
                    <div
                        className="header-item-close"
                        onClick={(e) => {
                            setUploadDocument(false)
                        }}
                        dangerouslySetInnerHTML={{ __html: Icons.general.close }}
                    ></div>
                </div>
                <div className="sidebar-popup-content">
                    <div className="content-section">
                        <div className="document-preview-main">
                            <div className="document-preview-img">
                                <img src={img_url || Images.UploadDoc_Default} />
                            </div>
                            <div className="document-file-upload">
                                <input
                                    className='document-file'
                                    type="file"
                                    id='patient-document-file'
                                    accept="image/jpg, image/jpeg, image/png"
                                    onChange={(e) => HandleImageChange(e)}
                                />
                                <div className="content-item">
                                    <TextInput
                                        props={{
                                            id: "patient-document-filename",
                                            value: file_name,
                                            placeholder: '',
                                            setValue: (value) => setFile_name(value),
                                            isIcon: false,
                                            isLabel: true,
                                            isRequired: true,
                                            label: "Document Name",
                                        }}
                                    />
                                </div>
                                <div className="buttons">

                                    <div
                                        className='btn-upload'
                                        onClick={(e) => {
                                            let input = document.getElementById('patient-document-file')
                                            input.click()
                                        }}
                                        id='edit'
                                    >
                                        <div
                                            className="icon"
                                            dangerouslySetInnerHTML={{ __html: Icons.general.add_active }}
                                        ></div>
                                        <div className="label">Upload</div>
                                    </div>
                                    <div
                                        className='btn-upload'
                                        onClick={(e) => HandleImageSave(e)}
                                        id='save'
                                    >
                                        <div
                                            className="icon"
                                            dangerouslySetInnerHTML={{ __html: Icons.general.save }}
                                        ></div>
                                        <div className="label">Save</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        )
    }

    const HandleUploadDocument = () => {

        setUploadDocument(true)
    }
    const HandleUploadDocumentEdit = (doc, file, i) => {
        let _documents = [...documents]

        _documents[i].file = file

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {

            _documents[i].file_url = reader.result
            setDocuments(_documents)
        };
    }

    return (
        <div className="popup-container-main popup-container-center">
            <div className="popup-block-ui"></div>

            {previewDocument ?
                <HandleDocumentPreview />
                :
                opentextImg ?
                    <FileViewer
                        closeDialog={() => { setOpenTextImg(undefined) }}
                        publicationData={opentextImg}
                    />
                    :
                    uploadDocument ?
                        <HandleUploadDocumentForm />
                        :
                        openPrescriptionBoard ?
                            <HandFreeWhiteBoard props={{ saveCallback: setPrescriptionBoardImg, closeCallback: setOpenPrescriptionBoard }} />
                            :
                            <form className="side-popup-container sidebar-popup-appointment" onSubmit={(e) => {
                                HandlePopupSubmit(e)
                            }}>
                                <Popup_Header />

                                <div className="sidebar-popup-content">
                                    <div className="content-section">

                                        <div className="content-item">
                                            <TextInput
                                                props={{
                                                    id: "patient-visit-diagnosis",
                                                    value: appointmentID,
                                                    placeholder: '',
                                                    setValue: (value) => { },
                                                    isIcon: false,
                                                    isLabel: true,
                                                    readOnly: true,
                                                    isRequired: true,
                                                    label: "Appointment ID",
                                                }}
                                            />
                                        </div>
                                        <div className="content-item">
                                            <DateTimeInput
                                                props={{
                                                    id: "patient-visit-date",
                                                    value: date,
                                                    placeholder: '',
                                                    setValue: (value) => setDate(value),
                                                    isIcon: false,
                                                    isLabel: true,
                                                    readOnly: ReadOnly,
                                                    isRequired: true,
                                                    label: "Date",
                                                }}
                                            />
                                        </div>
                                        <div className="content-item">
                                            <TextInput
                                                props={{
                                                    id: "patient-visit-diagnosis",
                                                    value: diagnosis,
                                                    placeholder: '',
                                                    setValue: (value) => setDiagnosis(value),
                                                    isIcon: false,
                                                    isLabel: true,
                                                    isRequired: true,
                                                    readOnly: ReadOnly,
                                                    label: "Diagnosis",
                                                }}
                                            />
                                        </div>
                                        <div className="content-item">
                                            <SelectInput
                                                props={{
                                                    id: "addpatient-status",
                                                    value: status,
                                                    placeholder: '',
                                                    options: [
                                                        {
                                                            value: "waiting",
                                                            label: "Waiting"
                                                        },
                                                        {
                                                            value: "confirmed",
                                                            label: "Confirmed"
                                                        },
                                                        {
                                                            value: "in_hospital",
                                                            label: "InHospital"
                                                        },
                                                        {
                                                            value: "completed",
                                                            label: "Completed"
                                                        },
                                                    ],
                                                    setValue: (value, label) => {
                                                        setStatus(value)
                                                    },
                                                    isIcon: false,
                                                    isLabel: true,
                                                    readOnly: ReadOnly,
                                                    isRequired: false,
                                                    label: "Status",
                                                }}
                                            />
                                        </div>
                                        <div className="content-section">
                                            <div id="addcategory-description" className={`additional-item ${additionalNotes ? 'additional-item-active' : ''}`}>
                                                <div className="head" onClick={(e) => setAdditionalNotes(!additionalNotes)}>
                                                    <div className="icon" dangerouslySetInnerHTML={{ __html: Icons.general.description }}></div>
                                                    <div className="label">Description</div>
                                                </div>
                                                <div className="item-expanded">
                                                    <textarea
                                                        id=""
                                                        cols="30"
                                                        rows="10"
                                                        value={description}
                                                        readOnly={ReadOnly}
                                                        onChange={(value) => setDescription(value.target.value)}
                                                    ></textarea>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="content-section">
                                            <div id="addcategory-description" className={`additional-item ${checkUpDetials ? 'additional-item-active' : ''}`}>
                                                <div className="head" onClick={(e) => setCheckUpDetials(!checkUpDetials)}>
                                                    <div className="left">
                                                        <div className="icon" dangerouslySetInnerHTML={{ __html: Icons.general.cost_code }}></div>
                                                        <div className="label">Basic Checup Detials</div>
                                                    </div>
                                                </div>
                                                <div className="item-expanded content-items-spit">
                                                    <div className="content-item">
                                                        <TextInput
                                                            props={{
                                                                id: "patient-visit-temperature",
                                                                value: temperature,
                                                                placeholder: '',
                                                                setValue: (value) => setTemperature(value),
                                                                isIcon: false,
                                                                isLabel: true,
                                                                readOnly: ReadOnly,
                                                                isRequired: false,
                                                                label: "Temperature (°C)",
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="content-item">
                                                        <TextInput
                                                            props={{
                                                                id: "patient-visit-bp",
                                                                value: bloodPressure,
                                                                placeholder: '',
                                                                setValue: (value) => setBloodPressure(value),
                                                                isIcon: false,
                                                                isLabel: true,
                                                                isRequired: false,
                                                                readOnly: ReadOnly,
                                                                label: "BP (mmHg)",
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="content-item">
                                                        <TextInput
                                                            props={{
                                                                id: "patient-visit-bloodSugar",
                                                                value: bloodSugar,
                                                                placeholder: '',
                                                                setValue: (value) => setBloodSugar(value),
                                                                isIcon: false,
                                                                isLabel: true,
                                                                isRequired: false,
                                                                readOnly: ReadOnly,
                                                                label: "Blood Sugar (mg/dL)",
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="content-section">
                                            <div id="addcategory-description" className={`additional-item additional-item-active`}>
                                                <div className="head" >
                                                    <div className="left">
                                                        <div className="icon" dangerouslySetInnerHTML={{ __html: Icons.general.cost_code }}></div>
                                                        <div className="label">Prescription</div>
                                                    </div>
                                                    <div className="right-buttons" >
                                                        <div className="right" onClick={(e) => HandlePrescriptionView()}>
                                                            <div className="icon" dangerouslySetInnerHTML={{ __html: Icons.general.arrow_right_up }}></div>
                                                            <div className="label">Open Prescription</div>
                                                        </div>
                                                        {!ReadOnly ?
                                                            <div className="right" onClick={(e) => HandlePrescriptionBoard()}>
                                                                <div className="icon" dangerouslySetInnerHTML={{ __html: Icons.general.add_active }}></div>
                                                                <div className="label">WhiteBoard</div>
                                                            </div>
                                                            : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="content-section">
                                            <div id="addcategory-description" className={`additional-item ${checkUpDocuments ? 'additional-item-active' : ''}`}>
                                                <div className="head" >
                                                    <div className="left" onClick={(e) => setCheckUpDocuments(!checkUpDocuments)}>
                                                        <div className="icon" dangerouslySetInnerHTML={{ __html: Icons.general.cost_code }}></div>
                                                        <div className="label">Checup Documents</div>
                                                    </div>
                                                    <div className="right" onClick={(e) => HandleUploadDocument()}>
                                                        <div className="icon" dangerouslySetInnerHTML={{ __html: Icons.general.add_active }}></div>
                                                        <div className="label">Upload</div>
                                                    </div>
                                                </div>
                                                <div className="item-expanded content-items-spit">
                                                    {/* {documents.filter(doc => doc.name != "Prescription").map((doc, i) => ( */}
                                                    {documents.map((doc, i) => (
                                                        <div id={doc.id} key={doc.id} className="section-itm-document">
                                                            {doc.name == 'Prescription' && opentext_prescription_data && opentext_prescription_data.risk ?
                                                                <span className='section-itm-document-risk'>Risk File</span>
                                                                : ''}
                                                            <input
                                                                type="file"
                                                                id='patient-documents-file'
                                                                accept="image/jpg, image/jpeg, image/png"
                                                                readOnly={ReadOnly}
                                                                onChange={(e) => {
                                                                    if (!ReadOnly) HandleUploadDocumentEdit(doc, e.target.files[0], i)
                                                                }}
                                                            />
                                                            <div className='document-preview' >
                                                                <span className='label'>{doc.name}</span>
                                                                <div className='img'>
                                                                    <img src={doc.file_url || Images.UploadDoc_Default} alt="" />
                                                                </div>
                                                                <div className='buttons'>
                                                                    {!ReadOnly ?
                                                                        <span
                                                                            className='btn edit'
                                                                            onClick={(e) => {
                                                                                let input = document.getElementById('patient-documents-file')
                                                                                input.click()
                                                                            }}
                                                                            id='edit'
                                                                        >Edit</span>
                                                                        : ''}
                                                                    <span
                                                                        className='btn preview'
                                                                        onClick={(e) => { setPreviewDocument(doc.file) }}
                                                                        id='preview'
                                                                    >Preview</span>
                                                                    <span
                                                                        className='btn download'
                                                                        onClick={(e) => { HandleDownloadDocument(doc.file) }}
                                                                        id='download'
                                                                    >Download</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                </div>
                                            </div>
                                        </div>
                                        {ReadOnly ?
                                            <div className="content-section">
                                                <div className="predict-buttons">
                                                    <div
                                                        className="predict-btn"
                                                        onClick={(e) => HandlePredicition()}
                                                    >
                                                        <div
                                                            className="icon"
                                                            dangerouslySetInnerHTML={{ __html: Icons.general.allowance }}
                                                        ></div>
                                                        <div className="label">Start Prediction</div>
                                                    </div>
                                                </div>
                                            </div>
                                            : null}
                                    </div>

                                </div>

                                {isEditView ? <Popup_Footer /> : null}
                            </form>
            }
        </div>
    )

}
export default ViewEditAppointment;