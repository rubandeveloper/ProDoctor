import Image from '../assets/Images'
import Icons from '../assets/Icons'


class SystemNotification {

    constructor() {

        this.mapContainer = document.querySelector("#project-login-main")

        this.init()
    }
    init() {
        this.makeContainer()
        this.addEvents()
    }
    makeContainer() {
        let container = document.createElement('div')
        container.classList.add('system-notification-container')

        container.innerHTML = `
            <div class="content">
                <span class="icon">${Icons.general.warning_red}</span>
                <span class="message">Are you sure to make change? </span>
                <span class='btn-cancel'>
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="rgba(0,0,0,0.7)"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>
                </span>
            </div>
            <div class="timer">
                <div class='timer-remains' id='timer-remains'></div>
            </div>
        `
        this.container = container

    }

    timerRemainder(time = 2000) {

        let timeRemainder = this.container.querySelector('.timer-remains')
        let cancelBtn = this.container.querySelector('.btn-cancel')

        const timerRemainderAnimate = [
            {
                width: '0%',
            },
            {
                width: '100%',
            }
        ];

        const timerRemainderAnimateOptions = {
            duration: time,
            iterations: 1,
        }


        timeRemainder.animate(timerRemainderAnimate, timerRemainderAnimateOptions);

        setTimeout(() => {
            const containerAnimate = [
                {
                    transform: ' translateX(0)'
                },
                {
                    transform: 'translateX(100%)'
                }
            ];

            const containerAnimateOption = {
                duration: 200,
                iterations: 1,
            }

            this.container.animate(containerAnimate, containerAnimateOption)

        }, time)

        setTimeout(() => this.hide(), time + 200)
    }
    addEvents() {

        let cancelBtn = this.container.querySelector('.btn-cancel')

        cancelBtn.addEventListener('click', () => {
            this.hide()
        })


    }
    show(message = undefined, time = 4000) {

        if (message) {
            let msg = this.container.querySelector('.message')
            msg.innerHTML = message;
        }
        this.mapContainer.appendChild(this.container)

        this.timerRemainder(time)
    }

    hide() {
        if (this.mapContainer.querySelector('.system-notification-container')) this.mapContainer.removeChild(this.container)
    }

}

export default SystemNotification;