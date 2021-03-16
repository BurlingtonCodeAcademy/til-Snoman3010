function Login(props) {
  function loginForm() {
    //if statement to check if logged in
    if (props.username.toLowerCase() === "anonymous") {
      //if not logged in provide login form
      return (
        <form method="POST" action={"/users/login"} id="login">
          <h3>Login:</h3>
          <h4 id='login-err'>{props.err}</h4>
          <input type="text" name="username" placeholder="Username" />
          <input type="password" name="password" placeholder="Password" />
          <label>
            <input type="checkbox" name="createUser" /> <div>Create new user?</div>
          </label>
          <input type="submit" value="Login" />
          <h6>Login expires after 15 minutes</h6>
        </form>
      );
    } else {
      //if logged in display current user and logout button
      return (
        <div id="login">
          <h4>You are logged in as {props.username}</h4>
          <button onClick={() => props.removeCookie("user")}>Logout</button>
        </div>
      );
    }
  }

  return loginForm();
}

export default Login;
