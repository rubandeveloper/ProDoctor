const MongoClient = require('mongodb').MongoClient

class Mongo {

    constructor(url, database) {

        this.url = url
        this.database = database
        // this.collection = collection

        this.insertOne = this.insertOne.bind(this)
        this.findOne = this.findOne.bind(this)
        this.find = this.find.bind(this)
        this.deleteOne = this.deleteOne.bind(this)
        this.updateOne = this.updateOne.bind(this)
        this.update = this.update.bind(this)
        this.aggregate = this.aggregate.bind(this)
        this.deleteMany = this.deleteMany.bind(this)
        this.findOneAndUpdate = this.findOneAndUpdate.bind(this)
        this.findAndLimits = this.findAndLimits.bind(this)
        this.updateMany = this.updateMany.bind(this)
        this.init = this.init.bind(this)

    }

    async init(callback) {
        this.mongoClient = new MongoClient(this.url, { useNewUrlParser: true, useUnifiedTopology: true })

        this.mongoClient.connect(function (err, data) {
            if (err) {
                callback(true, null)
            }

            callback(null, true)


        });
        this.client = this.mongoClient.db(this.database)

        console.log("Mongo connected successfully")


    }
    insertOneWithGeo(collection, data, index) {
        return new Promise(async (resolve, reject) => {

            try {

                await this.client.collection(collection).createIndex({ "location": "2dsphere" })

                await this.client.collection(collection).insertOne(data)


                return resolve(true)

            } catch (e) {

                return reject(e)

            }

        });

    }

    insertOne(collection, data, index) {

        return new Promise(async (resolve, reject) => {

            try {
                if (index != undefined) {
                    await this.client.collection(collection).createIndex(index)
                }

                await this.client.collection(collection).insertOne(data)

                return resolve(true)

            } catch (e) {

                return reject(e)

            }

        });

    }


    findOne(collection, filter) {

        return new Promise(async (resolve, reject) => {

            try {

                let result = await this.client.collection(collection).findOne(filter)

                return resolve(result)

            } catch (e) {

                return reject(e)

            }

        });


    }
    findOneAnProject(collection, filter, project) {

        return new Promise(async (resolve, reject) => {

            try {

                let result = await this.client.collection(collection).findOne(filter, project)

                return resolve(result)

            } catch (e) {

                return reject(e)

            }

        });


    }

    find(collection, filter) {

        return new Promise(async (resolve, reject) => {

            this.client.collection(collection).find(filter).toArray(function (err, result) {
                if (err) {
                    reject(err)
                }
                resolve(result)
            })

        });


    }

    findAndProject(collection, filter, project) {
        return new Promise(async (resolve, reject) => {

            this.client.collection(collection).find(filter).project(project).toArray(function (err, result) {
                if (err) {
                    reject(err)
                }
                resolve(result)
            })
        })
    }
    findAndLimits(collection, filter, skip = 0, limit = 5, sort = 1) {
        return new Promise(async (resolve, reject) => {

            this.client.collection(collection).find(filter).skip(skip).limit(limit).sort({ $natural: sort }).toArray(function (err, result) {
                if (err) {
                    reject(err)
                }
                resolve(result)
            })
        })
    }

    findOneAndUpdate(collection, filter, data, options) {

        return new Promise(async (resolve, reject) => {

            this.client.collection(collection).findOneAndUpdate(filter, data, options, function (err, result) {
                if (err) {
                    reject(err)
                }
                resolve(result)
            })
        })
    }

    deleteOne(collection, filter) {


        return new Promise(async (resolve, reject) => {

            try {

                let result = await this.client.collection(collection).findOneAndDelete(filter)


                return resolve(true)

            } catch (e) {

                return reject(e)

            }

        });


    }


    updateOne(collection, filter, data, options) {

        return new Promise(async (resolve, reject) => {

            try {

                await this.client.collection(collection).findOneAndUpdate(filter, data, options)



                return resolve(true)

            } catch (e) {

                return reject(e)

            }

        });

    }

    update(collection, filter, data) {

        return new Promise(async (resolve, reject) => {

            try {

                await this.client.collection(collection).update(filter, data)



                return resolve(true)

            } catch (e) {

                return reject(e)

            }

        });

    }

    updateMany(collection, filter, data) {

        return new Promise(async (resolve, reject) => {
            await this.client.collection(collection).updateMany(filter, data, (err, data) => {
                if (err) {
                    reject(err)
                }
                resolve(data)
            })

        })
    }

    aggregate(collection, agg) {

        return new Promise(async (resolve, reject) => {

            this.client.collection(collection).aggregate(agg).toArray(function (err, data) {
                if (err) {
                    reject(err)
                }
                resolve(data)
            })
        })
    }

    deleteMany(collection, filter) {
        return new Promise(async (resolve, reject) => {
            this.client.collection(collection).deleteMany(filter, function (err, data) {
                if (err) {
                    reject(err)
                }
                resolve(data)
            })
        })
    }

    insertMany(collection, data, index) {

        return new Promise(async (resolve, reject) => {

            try {
                if (index != undefined) {
                    await this.client.collection(collection).createIndex(index)
                }

                await this.client.collection(collection).insertMany(data)

                return resolve(true)

            } catch (e) {

                return reject(e)

            }

        });

    }

}

module.exports = Mongo;
