const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');
const {isLoggedIn,validateReview,isReviewAuthor } = require('../mainMiddlewares');
const revw = require('../controllers/reviews');



router.post('/campgrounds/:id/review',isLoggedIn, validateReview, catchAsync( revw.createReview ));

router.delete('/campgrounds/:id/reviews/:reviewId' ,isLoggedIn,isReviewAuthor, catchAsync( revw.deleteReview ));


module.exports = router;