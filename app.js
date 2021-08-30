if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
// 
// console.log(process.env.c1);
// console.log(process.env.c2);
// console.log(process.env.c3);

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Campground = require('./models/campground');
const Review = require('./models/review');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const JOI = require('joi');
const {campgroundSchema, reviewSchema} = require('./schemas');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/user');
const session = require('express-session');
const flash = require('connect-flash');
const User = require('./models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo')(session);
// const dbUrl = process.env.DB_URL;
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
// console.log(dbUrl);
//'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
// .then(()=>{ console.log("Connected"); })
// .catch(e => { console.log("Failed, error : "); console.log(e); });
const db = mongoose.connection;
db.on('error',console.error.bind(console,'Connection Error: '));
db.once('open',()=>{
    console.log("Database Connected");
});

mongoose.set('useFindAndModify', false);

const app = express();


app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));


app.engine('ejs',ejsMate);

app.use(express.static(path.join(__dirname,'/public')));
app.use(methodOverride('_method'));
app.use(express.urlencoded({extended:true}));
app.use(mongoSanitize())

const secret = process.env.DB_URL || 'thisisabigsecret';
const store = new MongoStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});
store.on('error', function(e){
    console.log("Session Store Error",e);
})
const sessionConfig = {
    store,
    name: 'user_id',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie : {
        httpOnly: true,
        // secure : true,
        expires : Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
};
app.use(session(sessionConfig));

// console.log(store);
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
//This is the array that needs added to
const styleSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/du3wqb8f8/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);
 

//----------passport--------------
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//---------------------flash-------------------
app.use(flash());
// app.use(helmet({contentSecurityPolicy: false}));
app.use((req,res,next)=>{
    res.locals.currentUser = req.user;
    res.locals.message = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

//------------USER ROUTES------------
app.use('',userRoutes);

//----------CAMPGROUND ROUTES-----------
app.use('',campgroundRoutes);


//----------REVIEW ROUTES----------
app.use('',reviewRoutes);

//-------home page-------------
app.get('/',(req,res)=>{
    res.render('campgrounds/home');
})
//--------------REST ROUTES AND MIDDLEWARES------------
app.all('*',(req,res,next)=>{
    throw new ExpressError('Page Not Found',404);
});




app.use( (err,req,res,next) => {
    const {status=500} = err;
    if(!err.message) err.message = 'Something Went Wrong';
    res.status(status).render('error',{err});
});


const port = process.env.PORT || 3000 ;
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});