//imports
import "./App.css";
import PostEditor from "./components/PostEditor";
import { BrowserRouter, Route } from "react-router-dom";
import Search from "./components/Search";
import SoloPost from "./components/SoloPost";
import Login from "./components/Login";
import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import Nav from "./components/Nav";
//App component
function App() {
  //state for username and cookie hook
  const [username, setUsername] = useState("Anonymous");
  const [cookies, setCookie, removeCookie] = useCookies(["user"]);
  //pulled useEffect callback out to call recursively with setTimeout to handle cookie expiration
  useEffect(effectFunction);

  function effectFunction() {
    //check user cookie exists, hasn't expired, and is different from username
    if (
      cookies.user &&
      cookies.user.expires > Date.now() &&
      cookies.user.name !== username
    ) {
      setUsername(cookies.user.name);
      setTimeout(effectFunction, cookies.user.expires - Date.now() + 5);
      //check if username is not anonymous and if user has logged out or cookie has expired
    } else if (
      username !== "Anonymous" &&
      (!cookies.user || cookies.user.expires <= Date.now())
    ) {
      setUsername("Anonymous");
      //if timeout ended early make sure it will run near cookie expiration
    } else if (username !== "Anonymous" && cookies.user) {
      setTimeout(effectFunction, cookies.user.expires - Date.now() + 5);
    }
  }

  return (
    //Routing
    //always have nav bar
    //otherwise 4 pages:
    //New Post (PostEditor), Display Searchable List of Posts (Search)
    //Individual Post Page (SoloPost), Login Page (Login)
    //Login page has second path for sending error messages on login failure
    <BrowserRouter>
      <div id="app">
        <Nav username={username} />
        <div id="main-content">
          <Route
            exact
            path="/"
            component={() => {
              return <PostEditor username={username} />;
            }}
          />
          <Route
            exact
            path="/facts"
            component={() => {
              return <Search username={username} />;
            }}
          />
          <Route
            exact
            path="/facts/:id"
            component={({ match }) => {
              return (
                <SoloPost
                  postId={match.params.id}
                  username={username}
                  admin={cookies.user ? cookies.user.admin : false}
                />
              );
            }}
          />
          <Route
            exact
            path="/login"
            component={({ match }) => {
              return (
                <Login username={username} err="" removeCookie={removeCookie} />
              );
            }}
          />
          <Route
            exact
            path="/login/:err"
            component={({ match }) => {
              return (
                <Login
                  username={username}
                  err={match.params.err}
                  removeCookie={removeCookie}
                />
              );
            }}
          />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
