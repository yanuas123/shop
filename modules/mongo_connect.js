var db = {
    // mongoose functions below must to get arguments:
    // model - mongoose model,
    // data - data for manipulate in mongoose,
    // args - object of arguments for using in callbacks
    //      must to contain property .res as engine for callbacks
    // res - for run callback from server
    // optional:
    // callbacks - object of callbacks

    prepareData: function(data) { // prepare data for improving in mongooose functions
        // you can pass data to mongoose in various forms, but there are any rules for parsing valid datas:
        // you get <= you pass:
        // {}                              <= "all"
        // 
        // { _id: string }                 <= string
        //                                 <= { _id: string }
        //                                 
        // { any: any [, ... ] }           <= { any: any [, ... ] }
        //                                 <= { _id: { any: any [, ... ] } }
        //                                 
        // { _id: { _id: string },         <= { _id: string,
        //   data: { any: any [, ... ] } }      data: { any: any [, ... ] },
        //                                      [...] }
        //                                 <= { _id: string,
        //                                      any: any [, ... ] }
        //   
        // { _id: { any: any [, ... ] },   <= { _id: { any: any [, ... ] },
        //   data: { any: any [, ... ] } }      data: { any: any [, ... ] },
        //                                      [...] }
        //                                 <= { _id: { any: any [, ... ] },
        //                                      any: any [, ... ] }

        // valid type of data is string or object
        // { _id: any, data: string } => data properties is false. Must be object

        if(typeof (data) != "object") {
            if(data == "all") return {};
            if(typeof (data) == "string") return {_id: data};
        }
        if(!data._id) return data;
        if(data.data) {
            if(typeof (data.data) != "object") return console.log("data error");
            if(typeof (data._id) == "object") return data;
            data._id = {_id: data._id};
            return data;
        }
        var count = 0;
        var d = {
            _id: null,
            data: {

            }
        };
        for(var key in data) {
            if(key == "_id") continue;
            d.data[key] = data[key];
            count++;
        }
        if(count < 1) {
            if(typeof (data._id) == "object") {
                return data._id;
            }
            return data;
        }
        if(typeof (data._id) == "object") {
            d._id = data._id;
            return d;
        }
        d._id = {
            _id: data._id
        };
        return d;
    },
    prepareCallback: function(callback, args) { // prepare callbacks for improving in mongooose functions
        // there is default callbacks functions to pass as callbeck
        // you can pass your own functions using third argument 'callbacks' as object with optional properties-functions:
        // err - if database return error, nul - if database return empty data-object or query to database returns object.ok=0, succ - if request is success
        // and you can pass arguments for using in this functions:
        //  1 - args - for using 'args' argument in callback function defined previously
        //  2 - res_data or err - for using query's result from database in callback function;
        var call_err = function(args, err) {
            console.log(err);
            args.res.send("database error");
            return;
        };
        var call_null = function(args, res_data) {
            if(Array.isArray(res_data) && !res_data.length) args.res.send(res_data);
            else {
                console.log("null database error");
                args.res.send("database error");
                return;
            }
        };
        var call_succ = function(args, res_data) {
            args.res.send(res_data);
        };
        if(callback) {
            call_err = callback.err || call_err;
            call_null = callback.nul || call_null;
            call_succ = callback.succ || call_succ;
        }
        return function(err, res_data) {
            if(err) call_err(args, err);
            else if((Array.isArray(res_data) && !res_data.length) || res_data.ok === 0) call_null(args, res_data);
            else call_succ(args, res_data);
        };
    },

    create: function(Model, data, args, callbacks) {
        // require data:object(with any properties to write in database)
        var data_res = this.prepareData(data);
        var callback = this.prepareCallback(callbacks, args);
        var new_record = new Model(data_res);
        new_record.save(callback);
    },
    update: function(Model, data, args, callbacks) {
        // require data:object with ._id:object(with ._id:str(mongo-id) or any properties to search in database) and .data:object(with any properties for change in database)
        var data_res = this.prepareData(data);
        var callback = this.prepareCallback(callbacks, args);
        Model.update(data_res._id, {$set: data_res.data}, callback);
    },
    delete: function(Model, data, args, callbacks) {
        // require data:object(with ._id:str(mongo-id) or any properties to search in database)
        // delete only one record
        var data_res = this.prepareData(data);
        var callback = this.prepareCallback(callbacks, args);
        Model.deleteOne(data_res, callback);
    },
    find: function(Model, data, args, callbacks) {
        // require data:object(with ._id:str(mongo-id) or {} for get all datas from model or any properties to search in database)
        var data_res = this.prepareData(data);
        var callback = this.prepareCallback(callbacks, args);
        Model.find(data_res, callback);
    }
};
module.exports = db;
