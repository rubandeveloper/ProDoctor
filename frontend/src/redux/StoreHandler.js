import User_Handler from '../Handlers/Users/User'

class StoreHandler {

    constructor({ dataStack, dispatch, updateState }) {

        this.dataStack = dataStack || []
        this.dispatch = dispatch
        this.updateState = updateState

        this.user_Handler = new User_Handler()

        // this.init()
    }

    async init() {

        return new Promise((resolve, reject) => {


            this.dataStack.forEach(async (item, i) => {

                if (item == 'user') return resolve(await this.loadUserData())

            })

        })


    }

    async loadUserData() {

        let userdetials = JSON.parse(localStorage.getItem("userdetials"))

        let response = await this.user_Handler.getProfileHandler({ user_id: userdetials.id })

        if (response && response.success) {

            this.dispatch(this.updateState({
                type: "SET_USER",
                payload: { user: response.data }
            }))

        }

        return true
    }

}

export default StoreHandler;