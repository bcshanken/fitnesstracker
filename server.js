const express = require("express");
const mongoose = require("mongoose");
const logger = require("morgan");
const Workout = require("./models/workout");
const path = require("path");


const PORT =3000;
const app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/FitnessDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

app.get("/stats", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/stats.html"));
});



app.get("/exercise", (req, res) => {
  res.sendFile(path.join(__dirname, "./public/exercise.html"));
});
app.post("/api/workouts", (req, res) => {
  Workout.create({}).then(function (allWorkouts) {
    res.json(allWorkouts);
  });
});

app.get("/api/workouts", (req, res) => {
  Workout.aggregate([
    {
      $addFields: {
        totalDuration: {
          $sum: "$exercises.duration",
        },
      },
    },
  ]).then(function (allWorkouts) {
    res.json(allWorkouts);
  });
});

app.get("/api/workouts/range", (req, res) => {
  Workout.aggregate([
    {
      $addFields: {
        totalDuration: {
          $sum: "$exercises.duration",
        },
      },
    },
  ])
    .sort({ _id: -1 })
    .limit(7)
    .then(function (allWorkouts) {
      res.json(allWorkouts);
    });
});

app.put("/api/workouts/:id", ({ body, params }, res) => {
  Workout.findByIdAndUpdate(
    params.id,
    { $push: { exercises: body } },
    { new: true, runValidators: true }
  ).then(function (allWorkouts) {
    res.json(allWorkouts);
  });
});

app.listen(PORT, () => {
  console.log(`App running on ${PORT} !`);
});
