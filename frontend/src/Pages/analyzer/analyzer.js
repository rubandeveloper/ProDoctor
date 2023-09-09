
import React, { useEffect, useState, useRef } from 'react'
import { Route, Routes, BrowserRouter, Link, useNavigate, useParams } from 'react-router-dom'
import ReactQuill from 'react-quill';
import { useSelector, useDispatch } from 'react-redux'


import Images from '../../assets/Images'
import Icons from '../../assets/Icons'
import Utils from '../../utils'

import { CostInput, TextInput, SelectInput, RadioInput } from '../../components/Inputs'
import WorkSheet from '../../components/worksheets/worksheets'
import AlertPopup from '../../components/AlertPopup'
import Loading from '../../components/Loading'

import Analyzer_Handler from '../../Handlers/Analyzer/Analyzer'


const Analyzer = () => {

    const [isLoading, setIsLoading] = useState(false)

    const [warningAlert, setWarningAlert] = useState(false)
    const [apiFailedMessage, setApiFailedMessage] = useState('Invalid Inputs, Please try again with vaild Inputs!')

    const analyzer_Handler = new Analyzer_Handler()

    const { hospitalID } = useParams();
    const navigate = useNavigate();

    const store = useSelector((store) => store)

    const [headers, setHeaders] = useState([

        {
            label: "Patient ID",
            id: "patient_id",
            isID: true,
            dropdown: true,
            isLeft: true,
            active: true,
        },
        {
            label: "Patient Name",
            id: "name",
            dropdown: true,
            isLeft: true,
            active: true,
        },
        {
            label: "Birth Date",
            id: "birthdate",
            active: true,
        },
        {
            label: "Status",
            id: "status",
            isBox: true,
            active: true,
        },

        {
            label: "Created",
            active: true,
            id: "created_at"
        },

        {
            label: "Last updated",
            active: true,
            id: "updated_at"
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

    const HandleWarningConfirm = (confirmation) => {

        setWarningAlert(false)
    }

    const Analyzer_Tools = [
        {
            id: 'brain_tumor',
            label: "Brain Tumor",
            image: Images.analyzer.Brain_tumor
        },
        {
            id: 'ecg',
            label: "ECG Analyzer",
            image: Images.analyzer.ECG
        },
        {
            id: 'skin_diseases',
            label: "Skin Diseases",
            image: Images.analyzer.Skin_diseases
        },
    ]


    const HandleUploadDocumentForm = ({ props }) => {

        const { tool } = props
        const [img_file, setImg_file] = useState('')
        const [img_url, setImg_url] = useState('')

        const [isLoading, setIsLoading] = useState(false)


        const [isAnalyzed, setIsAnalyzed] = useState(false)
        const [responseData, setResponseData] = useState({})

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

        const HandleDocumentAnalyse = async (e) => {

            let formData = new FormData()

            formData.append('file', img_file)

            setIsLoading(true)
            let response = {
                success: false
            }

            if (tool == 'brain_tumor') response = await analyzer_Handler.analyseBrainTumor(formData)
            else if (tool == 'ecg') response = await analyzer_Handler.analyseECH_HeartDiseases(formData)
            else if (tool == 'skin_diseases') response = await analyzer_Handler.analyseSkinDiseases(formData)

            setIsLoading(false)
            if (response.success) {

                let { data } = response
                setIsAnalyzed(true)
                setResponseData(data)
            }

        }

        const BrainTumor_Result = ({ props }) => {

            let { result } = props

            return (
                <div className="analysis-result-items">
                    <div className="result-item">
                        <div className="label">Has Brain Tumor:</div>
                        <div className="value">{result.hasDisesase ? 'Yes' : 'No'}</div>
                    </div>
                    <div className="result-item">
                        <div className="label">Report:</div>
                        <div className="value">{result.message}</div>
                    </div>
                    <div className="result-item">
                        <div className="label">Report Accuracy:</div>
                        <div className="value">{parseFloat(result.accuracy).toFixed(2)}%</div>
                    </div>
                </div>
            )
        }
        const SkinDiseases_Result = ({ props }) => {

            let { result } = props

            return (
                <div className="analysis-result-items">
                    <div className="result-item">
                        <div className="label">Report:</div>
                        <div className="value">{result.message}</div>
                    </div>
                    <div className="result-item">
                        <div className="label">Report Accuracy:</div>
                        <div className="value">{parseFloat(result.accuracy).toFixed(2)}%</div>
                    </div>
                </div>
            )
        }
        const ECG_Heart_Result = ({ props }) => {

            let { result } = props

            let { success, message, images } = result

            return (
                <div className="analysis-result-items">
                    <div className="result-item">
                        <div className="label">Report:</div>
                        <div className="value">{message}</div>
                    </div>
                    <div className="result-item">
                        <div className="label">Report Accuracy:</div>
                        <div className="value">{parseFloat(100).toFixed(2)}%</div>
                    </div>
                    <div className="result-title">Procedure for Analysis</div>
                    <div className="result-images">
                        {Object.keys(images).map((key, i) => (
                            <div key={`ecg_image_${key}`} id={`ecg_image_${key}`} className="result-image-item">
                                <div className="title">{key}</div>
                                <img src={`data:image/png;base64,${images[key]}`} alt="" />
                            </div>
                        ))}

                    </div>
                </div>
            )
        }

        return (
            <div className="popup-container-main popup-container-center">
                <div className="popup-block-ui"></div>

                {isLoading ?

                    <Loading
                        props={{
                            isMainLogo: false,
                            isLabel: true
                        }} />

                    : null}
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
                                navigate(`/app/hospital/${hospitalID}/analyzer`)
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
                                            onClick={(e) => HandleDocumentAnalyse(e)}
                                            id='save'
                                        >
                                            <div
                                                className="icon"
                                                dangerouslySetInnerHTML={{ __html: Icons.general.save }}
                                            ></div>
                                            <div className="label">Analyse</div>
                                        </div>
                                    </div>
                                    {isAnalyzed ?
                                        <div className="analysis-result-main">
                                            {tool == 'brain_tumor' ? <BrainTumor_Result props={{ result: responseData }} /> :
                                                tool == 'skin_diseases' ? <SkinDiseases_Result props={{ result: responseData }} />
                                                    : tool == 'ecg' ? <ECG_Heart_Result props={{ result: responseData }} />
                                                        : null}

                                        </div>
                                        : ''}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        )
    }

    const HandleOpenTool = (item) => {

        navigate(`/app/hospital/${hospitalID}/analyzer/${item.id}`)


    }

    return (
        <div className="project-pd_estimate-main">

            <Routes>
                <Route exact path={`/brain_tumor`} element={<HandleUploadDocumentForm props={{ tool: 'brain_tumor' }} />}></Route>
                <Route exact path={`/ecg`} element={<HandleUploadDocumentForm props={{ tool: 'ecg' }} />}></Route>
                <Route exact path={`/skin_diseases`} element={<HandleUploadDocumentForm props={{ tool: 'skin_diseases' }} />}></Route>
            </Routes>

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


            <div className="analyzer-tools-main">
                {
                    Analyzer_Tools.map((tool, i) => (
                        <div
                            id={tool.id}
                            key={tool.id}
                            className="tools-item"
                            onClick={(e) => HandleOpenTool(tool)}
                        >
                            <div className="img">
                                <img src={tool.image} alt="" />
                            </div>
                            <div className="label">{tool.label}</div>
                        </div>
                    ))
                }


            </div>

        </div>
    )
}
export default Analyzer;