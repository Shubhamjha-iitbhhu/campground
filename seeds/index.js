const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const {places,descriptors} = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
const db = mongoose.connection;
db.on('error',console.error.bind(console,'Connection Error: '));
db.once('open',()=>{
    console.log("Database Connected");
});

const seedDb = async () => {
    await Campground.deleteMany({});
    for(let i=0;i<300;i++){
        const rand1000 = Math.floor(Math.random()*1000);
        const camp = new Campground({
             author : '605636dd060b68476cdc49ad',
             location : `${cities[rand1000].city}, ${cities[rand1000].state}`,
             title : `${descriptors[Math.floor(Math.random()*descriptors.length)]} ${places[Math.floor(Math.random()*places.length)]}`,
             geometry: { 
                 coordinates: [
                    cities[rand1000].longitude,
                    cities[rand1000].latitude
                 ],
                  type: 'Point' 
                },
             images : [
                {
                    url: 'https://res.cloudinary.com/du3wqb8f8/image/upload/v1616458708/YelpCamp_MrSKJ/dljujs11o8lfrb1uktrf.jpg',
                    filename: 'YelpCamp_MrSKJ/dljujs11o8lfrb1uktrf'
                  },
                  {
                    url: 'https://res.cloudinary.com/du3wqb8f8/image/upload/v1616458563/YelpCamp_MrSKJ/cjy33b2twpldqutxneek.jpg',
                    filename: 'YelpCamp_MrSKJ/cjy33b2twpldqutxneek'
                  }
             ],
             description : 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Impedit ea cupiditate magnam molestiae nemo hic perspiciatis quis. Praesentium architecto et ducimus modi. Repellat, delectus? Eum quibusdam neque praesentium nobis eligendi.',
             price : Math.floor(Math.random()*20) + 10
        });
        await camp.save();
    }
};
seedDb().then(()=> {
    mongoose.connection.close();
})