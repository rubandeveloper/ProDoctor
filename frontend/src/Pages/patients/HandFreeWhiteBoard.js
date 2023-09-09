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


const HandFreeWhiteBoard = ({ props }) => {

    let { closeCallback, saveCallback } = props

    const canvasRef = useRef(null)
    const colorRef = useRef(null)

    const [cursorState, setCursorState] = useState('pen')
    const [canvasImg, setCanvasImg] = useState('')

    const HandleToolClick = (type) => {
        setCursorState(type)
    }

    const HandleMouseCursor = () => {

        // let whiteboard_main = document.querySelector('#whiteboard-workspace-main')

        // whiteboard_main.addEventListener('mouseover', (e) => {
        //     whiteboard_main.style.cursor = `url(${Images.drawing.pen}) 10 10, auto`
        // })
        // whiteboard_main.addEventListener('mouseout', (e) => { })

    }

    const HandleCanvas = () => {

        const canvas = canvasRef.current

        if (cursorState != 'pen') return
        if (!canvas) return

        const context = canvas.getContext('2d')
        const color_input = document.querySelector('#input-whiteboard-color')


        const current = {
            color: '#000'
        }

        color_input.addEventListener('change', (e) => {

            current.color = e.target.value
        })

        const drawLine = (x0, y0, x1, y1, color) => {

            x0 = x0
            y0 = y0 - 35
            x1 = x1
            y1 = y1 - 35

            context.beginPath()
            context.moveTo(x0, y0)
            context.lineTo(x1, y1)
            context.strokeStyle = color
            context.lineWidth = 2
            context.stroke()
            context.closePath()
            context.save()

        }

        let dataURL = ""
        let drawing = false

        const onMouseDown = (e) => {

            console.log(e.clientX, 'clientX');

            drawing = true
            current.x = (e.clientX || e.touches[0].clientX)
            current.y = (e.clientY || e.touches[0].clientY)
        }

        const onMouseMove = (e) => {


            if (!drawing) return

            let x = (e.clientX || e.touches[0].clientX)
            let y = (e.clientY || e.touches[0].clientY)

            drawLine(current.x, current.y, x, y, current.color)
            current.x = x
            current.y = y
        }
        const onMouseUp = (e) => {

            drawing = false

            setCanvasImg(canvasRef.current.toDataURL('image/png'))

            // let x = e.clientX || e.touches[0].clientX
            // let y = e.clientY || e.touches[0].clientY

            // console.log(x, y, 'sdfjhdsjf');


            // drawLine(current.x, current.y, x, y, current.color)

            // current.x = x
            // current.y = y
        }

        canvas.addEventListener('mousedown', onMouseDown, false)
        canvas.addEventListener('mouseup', onMouseUp, false)
        canvas.addEventListener('mouseout', onMouseUp, false)
        canvas.addEventListener('mousemove', onMouseMove, false)

        canvas.addEventListener('touchstart', onMouseDown, false)
        canvas.addEventListener('touchend', onMouseUp, false)
        canvas.addEventListener('touchcancel', onMouseUp, false)
        canvas.addEventListener('touchmove', onMouseMove, false)

        const onResize = () => {

            const _canvas_dom = document.querySelector('#whiteboard-workspace-main')

            console.log(_canvas_dom.width, '_canvas_dom');


            canvas.width = _canvas_dom.offsetWidth
            canvas.height = _canvas_dom.offsetHeight

            let img = document.createElement('img')
            img.src = dataURL
            context.drawImage(img, 0, 0)
            context.restore()
        }
        window.addEventListener('resize', onResize, false)
        onResize()

        const onDrawingEvent = (data) => {
            const w = canvas.width
            const h = canvas.height
            drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color)
        }
    }

    const HandleSaveBtn = (e) => {

        if (canvasImg) saveCallback(canvasImg)

        closeCallback(false)

    }
    useEffect(() => {


        HandleCanvas()

    }, [])

    return (
        <div className="popup-container-main popup-container-center project-whiteboard-main">
            <div className="popup-block-ui"></div>
            <div className="side-popup-container">
                <div className="side-popup-header">
                    <div className="header-item-select">
                        <div className="header-item-select-content">
                            <span className="icon" dangerouslySetInnerHTML={{ __html: Icons.general.fee }}></span>
                            <div className="label">Prescription Board</div>

                        </div>
                    </div>
                    <div
                        className="header-item-close"
                        onClick={(e) => {
                            closeCallback(false)
                        }}
                        dangerouslySetInnerHTML={{ __html: Icons.general.close }}
                    ></div>
                </div>
                <div className="sidebar-popup-content">
                    <div className="whiteboard-content-main">
                        <div className="whiteboard-tools-main">
                            <div
                                className={`whiteboard-tool-item ${cursorState == 'pen' ? 'whiteboard-tool-item-active' : ''}`}
                                onClick={(e) => HandleToolClick('pen')}
                            >
                                <img src={Images.drawing.pen} alt="" />
                            </div>
                            <div
                                className={`whiteboard-tool-item ${cursorState == 'eraser' ? 'whiteboard-tool-item-active' : ''}`}
                                onClick={(e) => HandleToolClick('eraser')}
                            >
                                <img src={Images.drawing.eraser} alt="" />
                            </div>
                            <div className="whiteboard-tool-item">
                                <input
                                    className='input-whiteboard-color'
                                    type="color"
                                    id='input-whiteboard-color'
                                    ref={colorRef}
                                />
                            </div>
                            <div
                                className={`whiteboard-save-button`}
                                onClick={(e) => HandleSaveBtn(e)}
                            >
                                <div
                                    className="icon"
                                    dangerouslySetInnerHTML={{ __html: Icons.general.save }}
                                ></div>
                                <div className="label">Save Prescription</div>
                            </div>
                        </div>
                        <canvas ref={canvasRef} className="whiteboard-workspace-main" id='whiteboard-workspace-main' />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HandFreeWhiteBoard;