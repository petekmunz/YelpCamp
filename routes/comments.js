const express = require('express'),
    Campground = require('../models/campground'),
    Comment = require('../models/comment'),
    middleware = require('../middleware'),
    router = express.Router({ mergeParams: true });

//Show new comment form
router.get("/new", middleware.isLoggedIn, function (req, res) {
    //find campground by id
    Campground.findById(req.params.id, function (err, foundCampground) {
        if (err || !foundCampground) {
            req.flash("error", "Campground not found");
        } else {
            res.render("comments/new", { campground: foundCampground });
        }
    });

});

//Create a comment
router.post("/", middleware.isLoggedIn, function (req, res) {
    //Look-up campground using id
    Campground.findById(req.params.id, function (err, foundCampground) {
        if (err || !foundCampground) {
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else {
            //Create new comment
            Comment.create(req.body.comment, function (err, foundComment) {
                if (err || !foundComment) {
                    req.flash("error", "Comment not found");
                } else {
                    //Add username and id to comment
                    foundComment.author.id = req.user._id;
                    foundComment.author.username = req.user.username
                    //Save the comment
                    foundComment.save();
                    //Connect new comment to campground
                    foundCampground.comments.push(foundComment);
                    foundCampground.save();
                    //Redirect to show page
                    req.flash("success", "Comment added successfully");
                    res.redirect("/campgrounds/" + foundCampground._id);
                }
            });
        }
    });
});

//Comments Edit Route
//show form
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        if (err || !foundCampground) {
            req.flash("error", "Campground not found");
            res.redirect("back");
        } else {
            Comment.findById(req.params.comment_id, function (err, foundComment) {
                if (err || !foundComment) {
                    req.flash("error", "Comment not found");
                    res.redirect("back");
                } else {
                    res.render("comments/edit", { campground_id: req.params.id, comment: foundComment });
                }
            });
        }
    });
});

//Comments Update Route
router.put("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    //Find and update relevant campground
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err) {
            req.flash("error", "There was an error updating the comment");
            res.redirect("back");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

//Comments Destroy Route
router.delete("/:comment_id", middleware.checkCommentOwnership, function (req, res) {
    Comment.findByIdAndDelete(req.params.comment_id, function (err) {
        if (err) {
            req.flash("error", "There was an error deleting the comment");
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});

module.exports = router;