const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

module.exports.getIndex = async(req,res,next)=>{
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds});
};

module.exports.getNewForm = (req,res)=>{
    // console.log('loggggggggggg');
    res.render('campgrounds/new');
};

module.exports.showCampground =  async(req,res,next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
   // console.log(campground.reviews[3].author.username);
    if(!campground){
        req.flash('error','Campground Not Found');
        return res.redirect('/campgrounds');
    }
    // console.log(campground.images);
    res.render('campgrounds/show',{campground}); 
};

module.exports.getEditForm = async (req,res,next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error',"Campground Not Found so can't edit");
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit',{campground});
};

module.exports.createCampground = async (req,res,next)=>{
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(file => ({url: file.path, filename: file.filename}));
    campground.author = req.user._id;
    await campground.save();
    // console.log(campground);
    req.flash('success','Successfully created a new Campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};


module.exports.editCampground = async (req,res,next)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground},{runValidators: true, new: true});
    const imgs = req.files.map(file => ({url: file.path, filename: file.filename}));
    campground.images.push(...imgs);
    await campground.save();
    // console.log(campground.geometry);
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: {images: {filename: {$in: req.body.deleteImages} } } });
    }
    req.flash('success','Successfully updated Campground!');
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async(req,res,next)=>{
    const {id} = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash('success','Successfully Deleted Campground');
    res.redirect(`/campgrounds`);
}