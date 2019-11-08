const express = require('express'),
    passport = require('passport'),
    User = require('../models/user'),
    router = express.Router();

//Root route
router.get("/", function (req, res) {
    res.render("landing");
});

//AUTH ROUTES
//show register form
router.get("/register", function (req, res) {
    res.render("register");
});

//Handle user registration
router.post("/register", function (req, res) {
    let newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            return res.render("register", {error: err.message});
        }
        passport.authenticate("local")(req, res, function () {
            req.flash("success", "Welcome to YelpCamp " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

//Show login form
router.get("/login", function (req, res) {
    res.render("login");
});

//Handle user login
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}), function (req, res) {
    if(req.is()){
        req.flash("success", "Welcome back " + req.user.username);
    }
});

//Logout Route
router.get("/logout", function (req, res) {
    req.logOut();
    req.flash("success", "Logged you out!");
    res.redirect("/campgrounds");
});

module.exports = router;