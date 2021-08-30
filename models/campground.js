const { text } = require('express');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');
const User = require('./user');
const {cloudinary} = require('../cloudinary');

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: {virtuals: true}};

const campgroundSchema = new Schema({
    title: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    images : [ImageSchema],
    description: String,
    location: String,
    author: {
        type : Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : 'Review'
        }
    ]
},opts);

campgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `<a href="/campgrounds/${this._id}">${this.title}</a>`
});

campgroundSchema.post('findOneAndDelete',async function(campground){
    if(campground){
        // for(let f of campground.images.filename){
        //     await cloudinary.uploader.destroy(f);
        // }
        await Review.deleteMany({ _id: {$in: campground.reviews}});
    }
});

module.exports = mongoose.model('Campground', campgroundSchema);
