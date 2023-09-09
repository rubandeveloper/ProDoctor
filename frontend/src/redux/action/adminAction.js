

class AdminAction {
    constructor() { }

    updateState({ type, payload }) {
        return async (dispatch) => {
            dispatch({ type, payload })
        }
    }
}

export default AdminAction;
