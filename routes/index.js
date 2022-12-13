const router = require("express").Router();
const User = require("../models/User");
const Track = require("../models/Track");
const { isAuthenticated } = require("../middleware/jwt");
const imageUploader = require("../config/cloudinary.images.config");
const trackUploader = require("../config/cloudinary.tracks.config");
const { default: mongoose } = require("mongoose");

// Get all users
router.get("/users/all", isAuthenticated, (req, res, next) => {
    User.find()
    .populate("tracks")
    .populate("likes")
    .populate("following")
    .populate("followers")
    .then(users => {
        console.log(users);
        res.status(200).json(users);
    })
    .catch((err) => next(err));
})

// Get user by ID
router.get("/users/:id", isAuthenticated, (req, res, next) => {
    const id = req.params.id;

    if (id === "") {
        res.status(400).json({ message: "Please provide id" });
        return;
    }

    User.findById(id)
        .populate("tracks")
        .populate("likes")
        .populate("following")
        .populate("followers")
        .then((user) => {
            if (!user) {
                res.status(400).json({ message: "User not found." });
                return;
            }

            res.status(200).json(user);
        })
        .catch((err) => next(err));
});

// Get user by nameForUrl
router.get("/users", isAuthenticated, (req, res, next) => {
    const nameForUrl = req.query.nameForUrl;

    if (nameForUrl === "") {
        res.status(400).json({ message: "Please provide nameForUrl" });
        return;
    }

    User.findOne({nameForUrl: nameForUrl})
        .populate("tracks")
        .populate("likes")
        .populate("following")
        .populate("followers")
        .then((user) => {
            console.log(user);
            if (!user) {
                res.status(400).json({ message: "User not found." });
                return;
            }

            res.status(200).json(user);
        })
        .catch((err) => next(err));
});

// Add like to user array
router.patch("/users/:id/likes", isAuthenticated, (req, res, next) => {
    const userId = req.params.id;
    const { trackId } = req.body;

    if (userId === "" || trackId === undefined) {
        res.status(400).json({
            message: "Please provide user and trackId."
        });
        return;
    }

    User.findById(userId)
    .then(user => {
        const trackIdObjectId = mongoose.Types.ObjectId(trackId)

        if (user.likes.includes(trackIdObjectId)) {
            res.status(200);
            return;
        }

        user.likes.push(trackIdObjectId);

        User.findByIdAndUpdate(userId, user)
        .then(response => {
            res.status(200).json(response.data);
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
});

// Remove like from user array
router.patch("/users/:id/likes/remove", isAuthenticated, (req, res, next) => {
    const userId = req.params.id;
    const { trackId } = req.body;

    if (userId === "" || trackId === undefined) {
        res.status(400).json({
            message: "Please provide user and trackId."
        });
        return;
    }

    User.findById(userId)
    .then(user => {
        const trackIdObjectId = mongoose.Types.ObjectId(trackId)

        if (!user.likes.includes(trackIdObjectId)) {
            res.status(200);
            return;
        }

        const index = user.likes.indexOf(trackIdObjectId)
        user.likes.splice(index, 1);

        User.findByIdAndUpdate(userId, user)
        .then(response => {
            res.status(200).json(response.data);
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
});

// Update user following
router.patch("/users/:id/following", isAuthenticated, (req, res, next) => {
    const followingUserId = req.params.id;
    const { followedUserId } = req.body;

    if (followingUserId === "" || followedUserId === undefined) {
        res.status(400).json({
            message: "Please provide following and followed user."
        });
        return;
    }

    User.findById(followingUserId)
    .then(followingUser => {
        const followedUserObjectId = mongoose.Types.ObjectId(followedUserId);

        if (!followingUser.following.includes(followedUserObjectId)) {
            followingUser.following.push(followedUserObjectId);

            User.findByIdAndUpdate(followingUserId, followingUser)
            .then(response => {
                res.status(200).json(followingUser);
            })
            .catch((err) => next(err));
        }
        res.status(200);
    })
    .catch((err) => next(err));
})

// Delete user following
router.patch("/users/:id/following/delete", isAuthenticated, (req, res, next) => {
    const followingUserId = req.params.id;
    const { followedUserId } = req.body;

    if (followingUserId === "" || followedUserId === undefined) {
        res.status(400).json({
            message: "Please provide following and followed user."
        });
        return;
    }

    User.findById(followingUserId)
    .then(followingUser => {
        const followedUserObjectId = mongoose.Types.ObjectId(followedUserId);
        const indexOfItemToRemove = followingUser.following.indexOf(followedUserObjectId);        
        if (indexOfItemToRemove >= 0) {
            followingUser.following.splice(indexOfItemToRemove, 1);
            
            User.findByIdAndUpdate(followingUserId, followingUser)
            .then(response => {
                res.status(200).json(followingUser);
            })
            .catch((err) => next(err));
        }
        res.status(200);
    })
    .catch((err) => next(err));
})

// Update user followers
router.patch("/users/:id/followers", isAuthenticated, (req, res, next) => {
    const followedUserId = req.params.id;
    const { followingUserId } = req.body;

    if (followedUserId === "" || followingUserId === undefined) {
        res.status(400).json({
            message: "Please provide followed and following user."
        });
        return;
    }

    User.findById(followedUserId)
    .then(followedUser => {
        const followingUserObjectId = mongoose.Types.ObjectId(followingUserId);

        if (!followedUser.followers.includes(followingUserObjectId)) {
            followedUser.followers.push(followingUserObjectId);

            User.findByIdAndUpdate(followedUserId, followedUser)
            .then(response => {
                res.status(200).json(followedUser);
            })
            .catch((err) => next(err));
        }
        res.status(200);
    })
    .catch((err) => next(err));
})

// Delete user followers
router.patch("/users/:id/followers/delete", isAuthenticated, (req, res, next) => {
    const followedUserId = req.params.id;
    const { followingUserId } = req.body;

    if (followedUserId === "" || followingUserId === undefined) {
        res.status(400).json({
            message: "Please provide followed and following user."
        });
        return;
    }

    User.findById(followedUserId)
    .then(followedUser => {
        const followingUserObjectId = mongoose.Types.ObjectId(followingUserId);
        const indexOfItemToRemove = followedUser.followers.indexOf(followingUserObjectId);        
        if (indexOfItemToRemove >= 0) {
            followedUser.followers.splice(indexOfItemToRemove, 1);
            
            User.findByIdAndUpdate(followedUserId, followedUser)
            .then(response => {
                res.status(200).json(followedUser);
            })
            .catch((err) => next(err));
        }
        res.status(200);
    })
    .catch((err) => next(err));
})

// Update user tracks
router.patch("/users/:id/tracks", isAuthenticated, (req, res, next) => {
    console.log("Update user tracks called", req.body);
    const id = req.params.id;
    const { tracks } = req.body;

    if (id === "" || tracks === undefined) {
        res.status(400).json({
            message: "Please provide id and tracks to update."
        });

        return;
    }

    User.findByIdAndUpdate(id, { tracks })
    .then(response => {
        res.status(200).json(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    })
})

// Get user tracks
router.get("/users/:id/tracks", isAuthenticated, (req, res, next) => {
    const id = req.params.id;

    if (id === "") {
        res.status(400).json({
            message: "Please provide user id."
        });
        return;
    }

    Track.find()
    .populate("comments")
    .then(tracks => {
        console.log("TRACKS: ", tracks)
        const filteredTracks = tracks.slice().filter(track => {
            return String(track.user) === id;
        })
        
        res.status(200).json(filteredTracks);
    })
    .catch(err => {
        next(err);
    })
})

// Get all tracks by users followed by specified user
router.get("/users/:id/following/tracks", isAuthenticated, (req, res, next) => {
    const id = req.params.id;
  
    if (id === "") {
      res.status(400).json({ message: "Provide id" });
      return;
    }
  
    User.findById(id)
    .then(user => {
        Track.find()
        .populate("user")
        .populate("comments")
        .then(tracks => {
             const tracksByFollowedUsers = tracks.slice().filter(track => {
                return user.following.includes(track.user._id);
            });

            res.status(200).json(tracksByFollowedUsers);
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
  });

// Get track by ID
router.get("/tracks/:id", isAuthenticated, (req, res, next) => {
  const id = req.params.id;

  if (id === "") {
    res.status(400).json({ message: "Provide id" });
    return;
  }

  Track.findById(id)
    .then(track => {
      if (!track) {
        res.status(400).json({ message: "Track not found" });
        return;
      }

      res.status(200).json(track);
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    })
});

// Create track
router.post("/tracks", isAuthenticated, (req, res, next) => {
    console.log("Create track called", req.body);
    const { name, tag, description, imageUrl, trackUrl, user } = req.body;

    if (name === "" || trackUrl === "") {
        res.status(400).json({
            message: "Please provide name and track to upload.",
        });

        return;
    };

    return Track.create({
        name,
        tag,
        description,
        imageUrl,
        trackUrl,
        user
    })
    .then((createdTrack) => {
        const { name, tag, description, imageUrl, trackUrl, user, _id } = createdTrack;
        const track = { name, tag, description, imageUrl, trackUrl, user, _id };
        res.status(201).json({ track: track });
    })
    .catch((err) => {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    });
});

// Image upload on cloudinary
router.post("/imageUpload", isAuthenticated, imageUploader.single("imageUrl"), (req, res, next) => {
    console.log("Upload image called", req.body);
    if (!req.file) {
        next(new Error("Image upload failed."));
        return;
    }

    res.json({ imageUrl: req.file.path });
});

// Track upload on cloudinary
router.post("/trackUpload", isAuthenticated, trackUploader.single("trackUrl"), (req, res, next) => {
  if (!req.file) {
    next(new Error("Track upload failed."));
    return;
  }

  res.json({ trackUrl: req.file.path });
});

module.exports = router;
