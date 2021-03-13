import { useState, useEffect } from "react";

function PostEditor(props) {
  //state values, mostly for form data, plus fetched tag data and toggle for displaying dropdown
  const [tags, setTags] = useState(null);
  const [tagsDropdown, setTagsDropdown] = useState(false);
  const [titleValue, setTitleValue] = useState(populateInputs("title"));
  const [bodyValue, setBodyValue] = useState(populateInputs("body"));
  const [currentDisplay, setCurrentDisplay] = useState("");
  const [tagsChecked, setTagsChecked] = useState([]);
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    //fetch tags
    if (!tags) {
      fetch("/tags")
        .then((res) => res.json())
        .then((jsonRes) => setTags(jsonRes));
    }
    //on individual post page, reset values when displayed or hidden
    if (props.editorStyle && props.editorStyle.display !== currentDisplay) {
      setTitleValue(populateInputs("title"));
      setBodyValue(populateInputs("body"));
      setCurrentDisplay(props.editorStyle.display);
      if (props.postObj) {
        setIsPublic(props.postObj.public);
        tags.forEach((tagText, index) => {
          tagsChecked[index] = props.postObj.tags.includes(tagText);
        });
      }
    }
  });
  //map tags after fetch
  function mapTags() {
    if (tags) {
      //if on individual post page figure out what tags are already checked
      if (props.postObj) {
        tags.forEach((tagText, index) => {
          tagsChecked[index] = props.postObj.tags.includes(tagText);
        });
      }
      //map tags to input with appropriate event handlers and a label
      return tags.map((tag, tagIndex) => {
        return (
          <div className="post-editor-tag-checkbox" key={tagIndex}>
            <input
              type="checkbox"
              name={tag[0].toLowerCase() + tag.slice(1).replace(" ", "")}
              id={tag[0].toLowerCase() + tag.slice(1).replace(" ", "")}
              value={tag}
              defaultChecked={tagsChecked[tagIndex]}
              onChange={() => (tagsChecked[tagIndex] = !tagsChecked[tagIndex])}
            />
            <label for={tag[0].toLowerCase() + tag.slice(1).replace(" ", "")}>
              {tag}
            </label>
          </div>
        );
      });
    } else {
      return "";
    }
  }
  //display toggle functions
  function tagsDisplay() {
    if (tagsDropdown) {
      return { display: "grid" };
    } else {
      return { display: "none" };
    }
  }

  function publicDisplay() {
    if (props.username === "Anonymous") {
      return { display: "none" };
    } else {
      return { display: "flex" };
    }
  }

  function headerDisplay() {
    if (props.postObj) {
      return { display: "none" };
    } else {
      return { display: "" };
    }
  }
  //fill form text based inputs with existing data
  function populateInputs(inputName) {
    if (props.postObj) {
      return props.postObj[inputName];
    } else {
      return "";
    }
  }
  //JSX with form and dropdowns
  return (
    <div id="post-editor" style={props.editorStyle}>
      <h3 id="post-editor-header" style={headerDisplay()}>Write a new post:</h3>
      <form
        method="POST"
        action={props.postObj ? `/update/${props.postObj._id}` : "/newPost"}
        id="post-editor-form"
      >
        <input
          type="text"
          name="title"
          id="post-editor-title"
          placeholder="Title"
          value={titleValue}
          onChange={(evt) => setTitleValue(evt.target.value)}
        />
        <textarea
          form="post-editor-form"
          name="body"
          id="post-editor-body"
          placeholder="Post Content"
          value={bodyValue}
          onChange={(evt) => setBodyValue(evt.target.value)}
        />
        <button
          id="post-editor-tags-toggle"
          onClick={(evt) => {
            evt.preventDefault();
            setTagsDropdown(!tagsDropdown);
          }}
        >
          Tags
        </button>
        <div id="post-editor-public-radio-buttons" style={publicDisplay()}>
          <label>
            <input
              type="radio"
              name="public"
              value={true}
              defaultChecked={isPublic}
              onChange={() => setIsPublic(true)}
            />{" "}
            Public
          </label>
          <label>
            <input
              type="radio"
              name="public"
              value={false}
              defaultChecked={!isPublic}
              onChange={() => setIsPublic(false)}
            />{" "}
            Private
          </label>
        </div>
        <input type="submit" value="Submit Post" id="post-editor-submit" />
        <div id="post-editor-tags-selector" style={tagsDisplay()}>
          {mapTags()}
        </div>
      </form>
      <h6>
        {props.username === "Anonymous"
          ? "Posts by Anonymous users are always public and can only be edited or deleted by an admin"
          : ""}
      </h6>
    </div>
  );
}

export default PostEditor;
