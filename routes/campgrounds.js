const express = require('express'),
    Campground = require('../models/campground'),
    Comment = require('../models/comment'),
    middleware = require('../middleware'),
    router = express.Router();
//INDEX - Show all campgrounds
router.get("/", function (req, res) {
    //Get all campgrounds from DB
    Campground.find({}, function (error, allCampgrounds) {
        if (error) {
            req.flash("error", "There was an error retrieving data");
            res.redirect("../landing");
        } else {
            res.render("campgrounds/index", { campgroundVar: allCampgrounds });
        }
    })
});

//NEW - Display a form to create new campground
router.get("/new", middleware.isLoggedIn, function (req, res) {
    res.render("campgrounds/new");
});

//CREATE - Add new campground to database
router.post("/", middleware.isLoggedIn, function (req, res) {
    //Get Data from form
    let campName = req.body.campName;
    let campPrice = req.body.campPrice;
    let campImage = req.body.campImage;
    let campDesc = req.body.campDescription;
    let author = {
        id: req.user._id,
        username: req.user.username
    }
    //Create a new Campground & save to DB
    Campground.create({
        name: campName,
        price: campPrice,
        image: campImage,
        description: campDesc,
        author: author
    }, function (error, newCampground) {
        if (error) {
            req.flash("There was an error creating a new Campground");
            res.redirect("/campgrounds");
        } else {
            //Redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    })
});

//SHOW - shows more info about one campground
router.get("/:id", function (req, res) {
    //Find campground with provided id
    Campground.findById(req.params.id).populate("comments").exec(function (error, foundCampground) {
        if (error || !foundCampground) {
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else {
            //Render show template with that campground
            res.render("campgrounds/show", { campground: foundCampground });
        }
    });

});

//Edit Campground Route
//show edit form
router.get("/:id/edit", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        if(err || !foundCampground){
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else{
            res.render("campgrounds/edit", { campground: foundCampground });
        }
    });
});

//Update Campground Route
router.put("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    //Find and update relevant campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, updatedCampground) {
        if (err) {
            req.flash("error", "There was an error updating the Campground");
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//Destroy Campground Route
router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        if (err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            Comment.deleteMany({
                _id: {
                    $in: foundCampground.comments
                  }
            }, function(err){
                if(err){
                    console.log(err);
                    res.redirect("/campgrounds");
                } else{
                    Campground.deleteOne({_id: foundCampground._id}, function(err){
                        if(err){
                            console.log(err);
                            res.redirect("/campgrounds");
                        } else{
                            res.redirect("/campgrounds");
                        }
                    })
                }
            });
        }
    });
});

module.exports = router;