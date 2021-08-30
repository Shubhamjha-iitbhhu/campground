const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async(req,res,next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    const {rating,body} = req.body.review;
    const review = new Review({rating,body});
    review.author = req.user._id;
    campground.reviews.push(review);
    await campground.save();
    await review.save();
    req.flash('success','Added A New Review!');
    res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteReview = async(req,res,next) => {
    const {id,reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews : reviewId}});
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully Deleted Review!');
    res.redirect(`/campgrounds/${id}`);
};