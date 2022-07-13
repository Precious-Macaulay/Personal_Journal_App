const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");

const mailchimp = require("@mailchimp/mailchimp_marketing");

mailchimp.setConfig({
  apiKey: "d00af0e5fe54a5dcc80fe6c378cdb12a-us8",
  server: "us8",
});

const addMember = async (member) => {
  const response = await mailchimp.lists.addListMember("74537f857c", member);
  console.log(response);
};

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

const app = express();

//connect database

mongoose.connect(
  "mongodb+srv://admin:h4tMY8bhg2B-Yg7@cluster0.xcdvxoj.mongodb.net/blogDB",
  { useNewUrlParser: true }
);

const postsSchema = {
  title: String,
  content: String,
};

const Post = mongoose.model("Post", postsSchema);

//Set express app to use body parser
app.use(bodyParser.urlencoded({ extended: true }));
//Load static files using express
app.use(express.static(path.join(__dirname, "public")));

//Set the view engine to EJS
app.set("view engine", "ejs");

//user
let user = "Macaulay";

//All get routes

app.get("/", (req, res) => {
  Post.find({}, (err, posts) => {
    if (!err) {
      res.render("pages/home", { user: user, posts: posts });
    } else {
      console.log(err);
    }
  });
});

app.get("/posts/:id", (req, res) => {
  const requestedPostId = req.params.id;

  Post.find({ _id: requestedPostId }, (err, posts) => {
    if (!err) {
      res.render("pages/post", {
        title: posts[0].title,
        content: posts[0].content,
      });
    } else {
      console.log(requestedPostId);
    }
  });
});

app.get("/about", (req, res) => {
  res.render("pages/about");
});
app.get("/contact", (req, res) => {
  res.render("pages/contact");
});
app.get("/compose", (req, res) => {
  res.render("pages/compose");
});

app.post("/add", (req, res) => {
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
  });

  post.save((err) => {
    if (!err) {
      res.redirect("/");
    }
  });
});

app.post("/subscribe", (req, res) => {
  console.log(req.body);

  let fname = req.body.fname;
  let lname = req.body.lname;
  let email = req.body.email;

  let member = {
    email_address: email,
    status: "subscribed",
    merge_fields: {
      FNAME: fname,
      LNAME: lname,
    },
  };

  addMember(member);

  res.render("/");
});

//Start server
app.listen(port, () =>
  console.log(`server is up and running!`)
);
