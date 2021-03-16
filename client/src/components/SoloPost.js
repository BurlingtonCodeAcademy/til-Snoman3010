import { useState } from "react";
import Post from "./Post";
import PostEditor from "./PostEditor";

function SoloPost(props) {
  //state for display toggles and post data
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [postObj, setPostObj] = useState(null);
  //display toggle functions
  function editorDisplay() {
    if (editing) {
      return { display: "" };
    } else {
      return { display: "none" };
    }
  }

  function deleteDisplay() {
    if (deleting) {
      return { display: "" };
    } else {
      return { display: "none" };
    }
  }
  //JSX, starts with post, lets post component fetch post data and retrieves it through props
  //Post editor display gets toggled by edit button, same for delete confirmation
  //edit and delete buttons are only enabled for logged in author or admin
  return (
    <div id="solo-post">
      <Post postId={props.postId} linked={false} giveParentPost={setPostObj} />
      <PostEditor postObj={postObj} editorStyle={editorDisplay()} username={props.username}/>
      <button onClick={() => setEditing(!editing)} disabled={!props.admin && (!postObj || props.username !== postObj.author || props.username === 'Anonymous')}>
        {editing ? "Cancel Editing" : "Edit Post"}
      </button>
      <button onClick={() => setDeleting(!deleting)} disabled={!props.admin && (!postObj || props.username !== postObj.author || props.username === 'Anonymous')}>Delete Post</button>
      <form
        method="POST"
        action={`/delete/${props.postId}`}
        style={deleteDisplay()}
      >
        <h2>Are you sure you want to delete this post?</h2>
        <input type="submit" value="Yes" />
        <button
          onClick={(evt) => {
            evt.preventDefault();
            setDeleting(!deleting);
          }}
        >
          No
        </button>
      </form>
    </div>
  );
}

export default SoloPost;
