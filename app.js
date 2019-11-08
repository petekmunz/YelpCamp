const express = require('express'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    methodOverride = require('method-override'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    flash = require('connect-flash'),
    User = require('./models/user'),
    seedDb = require('./seeds'),
    app = express();
const commentRoutes = require('./routes/comments'),
    campgroundRoutes = require('./routes/campgrounds'),
    indexRoutes = require('./routes/index');
const config = {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
};
const mongoUri = process.env.DATABASEURL || "mongodb://localhost/yelp_camp";
mongoose.connect(mongoUri, config);
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(flash());
//seedDb(); //Seed the DB

//Passport Configuration
app.use(require('express-session')({
    secret: "All hail the Llama King",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Add user object as middleware to every endpoint
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

//Set up express to use routes defined
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use(indexRoutes);

//Tell Express to listen for requests. Start Server
const port = process.env.PORT || 3000;
app.listen(port, process.env.IP, function () {
    console.log("Yelpcamp server has started at port: " + port);
});