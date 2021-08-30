const Campground = require("./models/campground");
const Review = require("./models/review");
const {campgroundSchema, reviewSchema} = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');

module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()){
        req.session.returnTo = req.originalUrl;
        req.flash('error','User must be logged in first!');
        return res.redirect('/login');
    }
    next();
};

module.exports.isAuthor = async (req,res,next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error','You dont have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};

module.exports.validateCampground = (req,res,next) => {
    const result = campgroundSchema.validate(req.body);
    const {error}= result;
    if(error){
        const msg = error.details.map(e => e.message).join(',')
        throw new ExpressError(msg,400);
    }else{
        next();
    }
}


module.exports.isReviewAuthor= async (req,res,next) => {
    const {id,reviewId} = req.params;
    // const campground = await Campground.findById(id);
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error','You dont have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};


module.exports.validateReview = (req,res,next) => {
    const result = reviewSchema.validate(req.body);
    const {error}= result;
    if(error){
        const msg = error.details.map(e => e.message).join(',');
        throw new ExpressError(msg,500);
    }else{
        next();
    }
}