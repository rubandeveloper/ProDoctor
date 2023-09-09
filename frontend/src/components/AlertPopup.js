
import Images from '../assets/Images'
import Icons from '../assets/Icons'

const AlertPopup = ({ props }) => {

    const { type, actionBtnOption, message, heading, callback } = props

    const HandleCancel = async (e) => {
        callback(false)
    }
    const HandlePopupSubmit = async (e) => {

        callback(true)

    }

    const Popup_Header = () => {

        const { icon, label } = actionBtnOption
        return (
            <div className="side-popup-header">
                <div className="header-item-select">
                    <div className="header-item-select-content">
                        <div className="label">{heading}</div>
                    </div>
                </div>
                <div
                    className="header-item-close"
                    onClick={(e) => HandleCancel(e)}
                    dangerouslySetInnerHTML={{ __html: Icons.general.close }}
                ></div>
            </div>
        );
    };
    const Popup_Footer = () => {

        const { icon, label } = actionBtnOption

        return (
            <div className="sidebar-popup-footer">
                <div className="footer-item action-items">
                    <div className="action-preview">
                    </div>
                    <div className='action-btns'>
                        <div className="action-cancel" onClick={(e) => HandleCancel(e)}>
                            Cancel
                        </div>
                        <div
                            className={`action-btn action-${type}`}
                            onClick={(e) => {
                                HandlePopupSubmit(e)
                            }}
                        >
                            <div className="icon" dangerouslySetInnerHTML={{ __html: icon }}></div>
                            <div className="label">{label}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="popup-container-main popup-container-center">
            <div className="popup-block-ui"></div>
            <div className="side-popup-container">
                <Popup_Header />
                <div className="sidebar-popup-content">
                    <div className="content-section">
                        <div className="popup-content-message">{message}</div>
                    </div>

                </div>
                <Popup_Footer />
            </div>
        </div>
    )

}

export default AlertPopup;