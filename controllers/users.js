const User = require('../models/user');

module.exports.getRegisterForm = (req,res)=>{
    res.render('auth/register');
}

module.exports.registerUser = async(req,res,next)=>{
    try{
        const {email,password,username} = req.body;
        const user = new User({email,username});
        const newUser = await User.register(user,password);
        req.login(newUser, err => {
            if (err) return next(err);
            req.flash('success','Successfully SignedIn!');
            res.redirect('/campgrounds');
        })
    }catch(e){
        req.flash('error',e.message);
        res.redirect('/register');
    }
};

module.exports.getLoginForm = (req,res)=>{
    res.render('auth/login');
};

module.exports.loginUser = (req,res) => {
    req.flash('success','welcome Back!');
    const isUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(isUrl);
};


module.exports.logoutUser = (req,res) => {
    req.logout();
    req.flash('success','Successfully Logged Out!');
    res.redirect('/campgrounds');
};