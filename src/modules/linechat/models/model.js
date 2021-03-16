'use strict';
// use model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var LinechatSchema = new Schema({
    name: {
        type: String,
        required: 'Please fill a Linechat name',
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date
    },
    createby: {
        _id: {
            type: String
        },
        username: {
            type: String
        },
        displayname: {
            type: String
        }
    },
    updateby: {
        _id: {
            type: String
        },
        username: {
            type: String
        },
        displayname: {
            type: String
        }
    }
});
LinechatSchema.pre('save', function(next){
    let Linechat = this;
    const model = mongoose.model("Linechat", LinechatSchema);
    if (Linechat.isNew) {
        // create
        next();
    }else{
        // update
        Linechat.updated = new Date();
        next();
    }
    
    
})
mongoose.model("Linechat", LinechatSchema);