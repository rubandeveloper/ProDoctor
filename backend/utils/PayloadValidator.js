const Joi = require('joi')

class PayloadValidator {
  constructor() { }

  /* User Validation*/

  async signup(payload) {

    // Fields: username, hospital_name, email, password

    const schema = Joi.object({
      username: Joi.string().required(),
      hospital_name: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
      password: Joi.string().required(),
    })

    const { error } = schema.validate(payload)

    if (error) return false

    return true

  }
  async signin(payload) {

    // Fields: email, password

    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    })

    const { error } = schema.validate(payload)

    if (error) return false

    return true

  }
  async forgetPassword(payload) {

    // Fields: email

    const schema = Joi.object({
      email: Joi.string().email().required(),
    })

    const { error } = schema.validate(payload)

    if (error) return false

    return true

  }
  async verifyResetCode(payload) {

    // Fields: code, email

    const schema = Joi.object({
      code: Joi.string().required(),
      email: Joi.string().email().required(),
    })

    const { error } = schema.validate(payload)

    if (error) return false

    return true

  }
  async resendResetCode(payload) {

    // Fields:  email

    const schema = Joi.object({
      email: Joi.string().email().required(),
    })

    const { error } = schema.validate(payload)

    if (error) return false

    return true

  }
  async resetPassword(payload) {

    // Fields:  code, email, password

    const schema = Joi.object({
      code: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    })

    const { error } = schema.validate(payload)

    if (error) return false

    return true

  }
  async updateProfile(payload) {

    // Fields:  username, email, work_email, phone, profile_img

    const schema = Joi.object({
      username: Joi.string().required(),
      email: Joi.string().email().required(),
      work_email: Joi.string().email().required(),
      phone: Joi.string().required(),
      profile_img: Joi.string(),
    })

    const { error } = schema.validate(payload)

    if (error) return false

    return true

  }
  async updateOnBoarding(payload) {

    // Fields:  hospital_type, demo_select, user_id, hospital_id

    const schema = Joi.object({
      hospital_type: Joi.string().required(),
      demo_select: Joi.string().required(),
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
    })

    const { error } = schema.validate(payload)

    if (error) return false

    return true

  }
  async updateCustomerFeedback(payload) {

    // Fields:  rating, category, message, user_id, hospital_id

    const schema = Joi.object({
      rating: Joi.string().required(),
      category: Joi.string().required(),
      message: Joi.string().required(),
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
    })

    const { error } = schema.validate(payload)

    if (error) return false

    return true

  }
  async getProfile(payload) {

    // Fields:  user_id

    const schema = Joi.object({
      user_id: Joi.string().required()
    })

    const { error } = schema.validate(payload)

    if (error) return false

    return true

  }

  /* EndUser Validation*/

  /* hospital Validation*/
  async updatehospital(payload) {

    // Fields: name, email, phone, address, website, timezone, socialLinks, user_id, hospital_id

    const schema = Joi.object({
      name: Joi.string().required(),
      phone: Joi.number().required(),
      address: Joi.string().allow('', null),
      website: Joi.string().allow('', null),
      timezone: Joi.string().allow('', null),
      socialLinks: Joi.string(),
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
      email: Joi.string().email().required(),
      logo_img: Joi.string(),
    })

    const { error } = schema.validate(payload)

    if (error) return false

    return true

  }
  async gethospital(payload) {

    // Fields:  user_id, hospital_id

    const schema = Joi.object({
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
    })

    const { error } = schema.validate(payload)

    if (error) return false

    return true

  }
  async updateSystemConfig(payload) {

    // Fields:   ui_theme, temperature_format, date_format, currency, language, hospital_id, user_id

    const schema = Joi.object({
      ui_theme: Joi.string().required(),
      temperature_format: Joi.string().required(),
      date_format: Joi.string().required(),
      currency: Joi.string().required(),
      language: Joi.string(),
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
    })

    const { error } = schema.validate(payload)

    if (error) return false

    return true

  }
  async updateFieldSettings(payload) {

    // Fields: units, projectStatus, projectTypes, paymentMethods, selectionCategories, selectionLocations, hospital_id, user_id

    const schema = Joi.object({
      units: Joi.array(),
      projectStatus: Joi.array(),
      projectTypes: Joi.array(),
      paymentMethods: Joi.array(),
      selectionCategories: Joi.array(),
      selectionLocations: Joi.array(),
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
    })

    const { error } = schema.validate(payload)

    if (error) return false

    return true

  }
  async updateFinanceSettings(payload) {

    // Fields: taxes, insurances, markups, overHeads, hospital_id, user_id

    const schema = Joi.object({
      taxes: Joi.array(),
      insurances: Joi.array(),
      markups: Joi.array(),
      overHeads: Joi.array(),
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
    })

    const { error } = schema.validate(payload)

    if (error) return false

    return true

  }
  async addSORCategory(payload) {

    // Fields: id, name, head, description, hospital_id, user_id

    const schema = Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      description: Joi.string().allow('', null),
      head: Joi.object({
        id: Joi.string().required(),
        label: Joi.string().required(),
      }),
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
    })

    const { error } = schema.validate(payload)

    if (error) return false

    return true

  }
  async updateSORCategory(payload) {

    // Fields: id, name, head, description, hospital_id, user_id

    const schema = Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      description: Joi.string().allow('', null),
      head: Joi.object({
        id: Joi.string().required(),
        label: Joi.string().required(),
      }),
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
    })

    const { error } = schema.validate(payload)
    if (error) return false

    return true

  }
  async addSORItem(payload) {

    // Fields: id, name, head, head_id, category, category_id, unit, unitrate, description, hospital_id, user_id

    const schema = Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      head: Joi.object({
        id: Joi.string().required(),
        label: Joi.string().required(),
      }),
      category: Joi.object({
        id: Joi.string().required(),
        label: Joi.string().required(),
      }),
      unit: Joi.string().required(),
      unitrate: Joi.string().required(),
      description: Joi.string().allow('', null),
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
    })

    const { error } = schema.validate(payload)

    if (error) return false

    return true

  }
  async updateSORItem(payload) {

    // Fields: id, name, head, category, unit, unitrate, description, hospital_id, user_id

    console.log(payload, 'payload');

    const schema = Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      head: Joi.object({
        id: Joi.string().required(),
        label: Joi.string().required(),
      }),
      category: Joi.object({
        id: Joi.string().required(),
        label: Joi.string().required(),
      }),
      unit: Joi.string().required(),
      unitrate: Joi.string().required(),
      description: Joi.string().allow('', null),
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
    })

    const { value, error } = schema.validate(payload)
    if (error) return false

    return true

  }
  async deleteSORItem(payload) {

    // Fields: id, type, hospital_id, user_id

    const schema = Joi.object({
      id: Joi.string().required(),
      type: Joi.string(),
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
    })

    const { error } = schema.validate(payload)

    if (error) return false

    return true

  }
  async addAWRItem(payload) {

    // Fields:id, name, workcode, quantity, unit, final_amount, items_involved, description, hospital_id, user_id

    const schema = Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      workcode: Joi.string().required(),
      quantity: Joi.string().required(),
      final_amount: Joi.number().required(),
      unit: Joi.string().required(),
      items_involved: Joi.array().required(),
      description: Joi.string().allow('', null),
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
    })

    const { error } = schema.validate(payload)

    if (error) return false

    return true

  }
  async updateAWRItem(payload) {

    // Fields:id, name, workcode, quantity, unit, final_amount, items_involved, description, hospital_id, user_id

    const schema = Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      workcode: Joi.string().required(),
      quantity: Joi.string().required(),
      final_amount: Joi.number().required(),
      unit: Joi.string().required(),
      items_involved: Joi.array().required(),
      description: Joi.string().allow('', null),
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
    })

    const { error } = schema.validate(payload)

    console.log(error, 'error');


    if (error) return false

    return true

  }
  async updateAWRItems(payload) {

    // Fields:id, name, workcode, quantity, unit, final_amount, items_involved, description, hospital_id, user_id

    const schema = Joi.array().required()

    const { error } = schema.validate(payload)

    console.log(error, 'error');


    if (error) return false

    return true

  }
  async deleteAWRItem(payload) {

    // Fields:id, hospital_id, user_id

    const schema = Joi.object({
      id: Joi.string().required(),
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
    })

    const { error } = schema.validate(payload)

    if (error) return false

    return true

  }
  async addClient(payload) {

    // Fields: id, name, email, phone, hospital_id, user_id 

    const schema = Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
    })

    const { error } = schema.validate(payload)

    if (error) return false

    return true

  }
  async updateClient(payload) {

    // Fields: id, name, email, phone, hospital_id, user_id 

    const schema = Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
    })

    const { error } = schema.validate(payload)

    if (error) return false

    return true

  }
  async deleteClient(payload) {

    // Fields: id, hospital_id, user_id 

    const schema = Joi.object({
      id: Joi.string().required(),
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
    })

    const { error } = schema.validate(payload)

    if (error) return false

    return true

  }
  async getNextWorkCode(payload) {

    // Fields: user_id, hospital_id

    const schema = Joi.object({
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
    })
    const { error } = schema.validate(payload)

    if (error) return false

    return true
  }
  /* End hospital Validation*/

  /* hospital Validation*/


  async getNexthospitalID(payload) {

    // Fields: user_id, hospital_id

    const schema = Joi.object({
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
    })
    const { error } = schema.validate(payload)

    if (error) return false

    return true
  }
  /* End Project Validation*/

  /* Patient Validation*/
  async getPatients(payload) {

    // Fields: patientid, user_id, hospital_id

    const schema = Joi.object({
      id: Joi.any().allow('', null),
      patientid: Joi.any().allow('', null),
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
    })
    const { error } = schema.validate(payload)
    if (error) return false

    return true
  }
  async createPatient(payload) {

    // Fields:  username, email, work_email, phone, profile_img

    const schema = Joi.object({
      patientID: Joi.string().required(),
      name: Joi.string().required(),
      status: Joi.string().allow('', null),
      address: Joi.string().allow('', null),
      description: Joi.string().allow('', null),
      phone: Joi.string().required(),
      email: Joi.string().required(),
      bloodgroup: Joi.string().required(),
      city: Joi.string().allow('', null),
      state: Joi.string().allow('', null),
      pincode: Joi.string().allow('', null),
      weight: Joi.string().allow('', null),
      height: Joi.string().allow('', null),
      birthdate: Joi.string().allow('', null),
      age: Joi.string().allow('', null),
      gender: Joi.string().allow('', null),
      ecg_doc: Joi.string().allow('', null),
      bp_doc: Joi.string().allow('', null),
      hospital_id: Joi.string().required(),
      user_id: Joi.string().required(),
    })

    const { error } = schema.validate(payload)

    console.log(error, 'error');

    if (error) return false

    return true

  }
  async updatePatient(payload) {

    // Fields:  username, email, work_email, phone, profile_img

    const schema = Joi.object({
      id: Joi.string().required(),
      patientID: Joi.string().required(),
      name: Joi.string().required(),
      status: Joi.string().allow('', null),
      address: Joi.string().allow('', null),
      description: Joi.string().allow('', null),
      phone: Joi.string().required(),
      email: Joi.string().required(),
      bloodgroup: Joi.string().required(),
      city: Joi.string().allow('', null),
      state: Joi.string().allow('', null),
      pincode: Joi.string().allow('', null),
      weight: Joi.string().allow('', null),
      height: Joi.string().allow('', null),
      birthdate: Joi.string().allow('', null),
      age: Joi.string().allow('', null),
      gender: Joi.string().allow('', null),
      ecg_doc: Joi.string().allow('', null),
      bp_doc: Joi.string().allow('', null),
      hospital_id: Joi.string().required(),
      user_id: Joi.string().required(),
    })

    const { error } = schema.validate(payload)

    if (error) return false

    return true

  }
  async getNextPatientID(payload) {

    // Fields:  user_id, hospital_id

    const schema = Joi.object({
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
    })
    const { error } = schema.validate(payload)

    if (error) return false

    return true
  }
  async deletePatient(payload) {

    // Fields: id, user_id, hospital_id

    const schema = Joi.object({
      id: Joi.string().required(),
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
    })
    const { error } = schema.validate(payload)

    if (error) return false

    return true
  }
  /* End Patient Validation*/

  /* Appointment Validation*/
  async getNextAppointmentID(payload) {

    // Fields:  user_id, hospital_id

    const schema = Joi.object({
      patient_id: Joi.string().required(),
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
    })
    const { error } = schema.validate(payload)

    if (error) return false

    return true
  }
  async getAppointments(payload) {

    // Fields: id, user_id, hospital_id

    const schema = Joi.object({
      id: Joi.any().allow('', null),
      patient_id: Joi.any().allow('', null),
      appointment_id: Joi.any().allow('', null),
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
    })
    const { error } = schema.validate(payload)
    if (error) return false

    return true
  }
  async createAppointment(payload) {

    // Fields:  date, diagnosis,patient_id, user_id, hospital_id

    const schema = Joi.object({
      date: Joi.string().required(),
      diagnosis: Joi.string().required(),
      description: Joi.string().allow('', null),
      patient_id: Joi.string().required(),
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
    })

    const { error } = schema.validate(payload)

    console.log(error, 'error');

    if (error) return false

    return true

  }
  async updateAppointment(payload) {

    // Fields:  date, diagnosis,patient_id, user_id, hospital_id

    const schema = Joi.object({
      id: Joi.string().required(),
      date: Joi.string().required(),
      diagnosis: Joi.string().required(),
      description: Joi.string().required(),
      status: Joi.string().allow('', null),
      temperature: Joi.string().allow('', null),
      bloodPressure: Joi.string().allow('', null),
      bloodSugar: Joi.string().allow('', null),
      patient_id: Joi.string().allow('', null),
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
      documents: Joi.any(),
    })

    const { error } = schema.validate(payload)

    console.log(error, 'error');

    if (error) return false

    return true

  }
  async deleteAppointmentHandler(payload) {

    // Fields: id, user_id, hospital_id

    const schema = Joi.object({
      id: Joi.string().required(),
      patient_id: Joi.string().required(),
      user_id: Joi.string().required(),
      hospital_id: Joi.string().required(),
    })
    const { error } = schema.validate(payload)

    if (error) return false

    return true
  }
  /* End Appointment Validation*/
}





module.exports = PayloadValidator;