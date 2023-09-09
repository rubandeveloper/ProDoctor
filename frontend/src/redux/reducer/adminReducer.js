

const initialState = {
    isAuthenticated: false,
    admin: {}
}


const Reducer = (state = initialState, action) => {

    let { type, payload } = action

    return {
        ...state,
        ...payload
    }

}

export default Reducer