
import Images from '../assets/Images'
import Icons from '../assets/Icons'

const Loading = ({ props }) => {

    const { isMainLogo, isLabel } = props

    return (
        <div className="popup-container-main popup-container-center">
            <div className="popup-block-ui"></div>
            <div className="loading-popup-container">
                {isMainLogo ? <div className="loading-logo">
                    <img src={Images.logo} />
                </div> : null}
                <div className="loading-spinner">
                    <svg class="loading-spinner-circle" height="200" width="200">
                        <circle cx="100" cy="100" r="50"></circle>
                    </svg>
                </div>
                {isLabel ? <div className="loading-label">Loading...</div> : null}
            </div>
        </div>
    )

}

export default Loading;