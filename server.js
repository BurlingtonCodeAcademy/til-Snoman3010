//imports
require("dotenv").config();
const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 5000;
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
//mongoose setup - mongo atlas ver
mongoose.connect(
  `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASS}@cluster0.nxlww.mongodb.net/tilProjectData?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
//setup post model
const postSchema = new mongoose.Schema({
  title: String,
  author: String,
  date: Date,
  update: Date,
  body: String,
  tags: Array,
  public: Boolean,
});
//give post schema text indexes for content searching
postSchema.index({ title: "text", body: "text", tags: "text" });

const PostModel = new mongoose.model("posts", postSchema);
//setup user model
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  admin: Boolean,
});

const UserModel = new mongoose.model("users", userSchema);
//server setup and paths
//middleware
app.use(express.static("./client/build"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//get requests
//tags
app.get("/tags", (request, response) => {
  response.sendFile(path.resolve("./api/tags.json"));
});
//individual post
app.get("/posts/id/:postId", (request, response) => {
  console.log("get request @ /posts/id");
  PostModel.findOne({ _id: request.params.postId }, (err, result) => {
    if (err) {
      response.send("Invalid post id");
    } else {
      response.json(result);
    }
  });
});
//all public posts
app.get("/posts/all", async (request, response) => {
  console.log("get request @ /posts/all");
  //filter find by public
  let cursor = await PostModel.find({ public: true });
  let resultsArr = [];
  cursor.forEach((post) => {
    resultsArr.push(post._id);
  });
  response.send(resultsArr);
});
//search public posts
app.get("/posts/:searchType/:searchValue", async (request, response) => {
  console.log("get request @ /posts/search");
  //build object for filtering search based on search type and value
  let searchObj = {};
  if (request.params.searchType === "content") {
    //special text search for content
    searchObj = {
      $text: { $search: request.params.searchValue },
      public: true,
    };
  } else {
    searchObj[request.params.searchType] = request.params.searchValue;
    searchObj.public = true;
  }
  let cursor = await PostModel.find(searchObj);
  let resultsArr = [];
  cursor.forEach((post) => {
    resultsArr.push(post._id);
  });
  response.send(resultsArr);
});
//all posts by logged in user
app.get("/myPosts/all", async (request, response) => {
  console.log("get request @ /myPosts/all");
  //filter find by username from cookie
  let cursor = await PostModel.find({ author: request.cookies.user.name });
  let resultsArr = [];
  cursor.forEach((post) => {
    resultsArr.push(post._id);
  });
  response.send(resultsArr);
});
//search posts by logged in user
app.get("/myPosts/:searchType/:searchValue", async (request, response) => {
  console.log("get request @ /myPosts/search");
  let searchObj = {};
  if (request.params.searchType === "content") {
    searchObj = {
      $text: { $search: request.params.searchValue },
      author: request.cookies.user.name,
    };
  } else {
    searchObj[request.params.searchType] = request.params.searchValue;
    searchObj.author = request.cookies.user.name;
  }
  let cursor = await PostModel.find(searchObj);
  let resultsArr = [];
  cursor.forEach((post) => {
    resultsArr.push(post._id);
  });
  response.send(resultsArr);
});
//pass other gets to react
app.get("*", (request, response) => {
  response.sendFile(path.resolve("./client/build/index.html"));
});
//post requests
//new post
app.post("/newPost", (request, response) => {
  console.log("post request @ /newPost");
  //get username from cookie if it's there with Anonymous as default
  let currUser = "Anonymous";
  if (request.cookies && request.cookies.user) {
    currUser = request.cookies.user.name;
  }
  newPost(request.body, response, currUser);
});
//update post
app.post("/update/:postId", (request, response) => {
  console.log("post request @ /update");
  updatePost(request.body, response, request.params.postId);
});
//delete post
app.post("/delete/:postId", async (request, response) => {
  console.log("post request @ /delete");
  await PostModel.deleteOne({ _id: request.params.postId });
  response.redirect("/");
});
//login
app.post("/users/login", async (request, response) => {
  console.log("post @ /users/login");
  //make sure username and password have been entered and anonymous is not the username
  if (!request.body.username) {
    response.redirect(`/login/${encodeURIComponent("A username is required")}`);
  } else if (request.body.username.toLowerCase().trim() === "anonymous") {
    response.redirect(
      `/login/${encodeURIComponent("Cannot login as Anonymous")}`
    );
  } else if (!request.body.password) {
    response.redirect(`/login/${encodeURIComponent("A password is required")}`);
  } else {
    //find user based on username
    let userLogin = await UserModel.findOne({
      username: request.body.username.trim(),
    });
    if (request.body.createUser) {
      //if making new user, check if username is in use, if not hash password, make user, and login
      if (userLogin) {
        response.redirect(
          `/login/${encodeURIComponent("User already exists")}`
        );
      } else {
        let hashedPass = await bcrypt.hash(
          request.body.password,
          parseInt(process.env.SALT)
        );
        const addUser = new UserModel({
          username: request.body.username.trim(),
          password: hashedPass,
          admin: false, //new users are not admins
        });
        addUser.save((err, data) => {
          if (err) {
            response.redirect(
              `/login/${encodeURIComponent("Error adding user")}`
            );
          } else {
            //send cookie with 15 minute lifespan and login data
            response
              .cookie(
                "user",
                {
                  name: request.body.username.trim(),
                  expires: Date.now() + 900000,
                  admin: false,
                },
                { maxAge: 900000 }
              )
              .redirect(`/login`);
          }
        });
      }
    } else {
      //if not making new user, make sure user exists, test password, and login
      if (!userLogin) {
        response.redirect(`/login/${encodeURIComponent("User not found")}`);
      } else {
        if (await bcrypt.compare(request.body.password, userLogin.password)) {
          response
            .cookie(
              "user",
              {
                name: request.body.username.trim(),
                expires: Date.now() + 900000,
                admin: userLogin.admin,
              },
              { maxAge: 900000 }
            )
            .redirect(`/login`);
        } else {
          response.redirect(
            `/login/${encodeURIComponent("Incorrect password")}`
          );
        }
      }
    }
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

//helper functions
function newPost(formBody, res, author) {
  //make new post from form input
  console.log(formBody);
  //all extra keys are tags, put them in an array
  let tagsArr = [];
  for (let key in formBody) {
    if (key !== "title" && key !== "body" && key !== "public") {
      tagsArr.push(formBody[key]);
    }
  }
  //make post using form data, current date, tags array, and data passed to the function from the cookie
  const post = new PostModel({
    title: formBody.title,
    body: formBody.body,
    date: new Date(),
    tags: tagsArr,
    author: author,
    public: formBody.public,
  });
  post.save((err, data) => {
    if (err) {
      console.error(err);
    }
  });
  res.redirect("/");
}

async function updatePost(formBody, res, postId) {
  //update post
  console.log(formBody);
  //tags array
  let tagsArr = [];
  for (let key in formBody) {
    if (key !== "title" && key !== "body" && key !== "public") {
      tagsArr.push(formBody[key]);
    }
  }
  //find post, use form data to update. leave date alone, set update instead
  const post = await PostModel.findOne({ _id: postId });
  post.title = formBody.title;
  post.body = formBody.body;
  post.tags = tagsArr;
  post.update = new Date();
  post.public = formBody.public;
  post.save((err, data) => {
    if (err) {
      console.error(err);
    }
  });
  res.redirect(`/facts/${postId}`);
}
