const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const {isLoggedIn, isAuthor, validateCampground} = require('../mainMiddlewares');
const camp = require('../controllers/campgrounds');

const multer = require('multer');
const {storage} = require('../cloudinary');
const upload = multer({ storage }); //WILL BE CHANGED

const Campground = require('../models/campground');

router.route('/campgrounds')
    .get(catchAsync( camp.getIndex ))
    .post(isLoggedIn , upload.array('image'), validateCampground , catchAsync( camp.createCampground ));


router.get('/campgrounds/new',isLoggedIn, camp.getNewForm );


router.route('/campgrounds/:id')
    .get(catchAsync( camp.showCampground ))
    .put(isLoggedIn, isAuthor, upload.array('image'),  validateCampground ,  catchAsync( camp.editCampground ))
    .delete(isLoggedIn, catchAsync( camp.deleteCampground ));

    
router.get('/campgrounds/:id/edit',isLoggedIn, isAuthor,  catchAsync( camp.getEditForm ));



module.exports = router ;