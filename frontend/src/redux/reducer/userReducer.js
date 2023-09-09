

const initialState = {
    isAuthenticated: false,
    user: {},
    hospital: {},
    projects: [],
    system_settings: {},
    settings: {
        sys_settings: {},
        certificates: [],
        payment_schedules: [],
        fiel_settings: [],
        finance_settings: [],
        database: {
            sor_settings: [],
            awr_settings: []
        }
    },
    roles_permissions: [],
    clients: [],
    vendors: [],
    employees: []
}


const Reducer = (state = initialState, action) => {

    let { type, payload } = action

    return {
        ...state,
        ...payload
    }

}

export default Reducer