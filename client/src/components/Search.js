import { useState } from "react";
import PostList from "./PostList";

function Search(props) {
  //state for search types and value, dropdown toggle, and prop for triggering update of post list
  const [shouldUpdate, setShouldUpdate] = useState(false);
  const [searchType, setSearchType] = useState("tags");
  const [searchValue, setSearchValue] = useState("");
  const [privatePosts, setPrivatePosts] = useState(false);
  const [typeDropdown, setTypeDropdown] = useState(false);
  //display toggles
  function typeDisplay() {
    if (typeDropdown) {
      return { display: "" };
    } else {
      return { display: "none" };
    }
  }

  function publicDisplay() {
    if (props.username === "Anonymous") {
      return { display: "none" };
    } else {
      return { display: "" };
    }
  }
  //author search is only available when searching public posts,
  //if only displaying user's posts author search is redundant
  function authorSearch() {
    if (!privatePosts) {
      return (
        <label id="type-radio-author">
          <input
            type="radio"
            name="type"
            defaultChecked={searchType === "author"}
            onChange={() => setSearchType("author")}
          />{" "}
          Search by Author
        </label>
      );
    } else {
      return "";
    }
  }
  //JSX with search form at top - though most inputs aren't actually in it,
  //dropdowns for search type and user posts/public posts toggle,
  //submit event has default behavior blocked and just triggers update of list,
  //post list component is last and get fed lots of props for search types, value and updater state with setter
  return (
    <div id="search">
      <h3>Search Posts</h3>
      <div id="display-public-radio-buttons" style={publicDisplay()}>
        <label>
          <input
            type="radio"
            name="private"
            defaultChecked={!privatePosts}
            onChange={() => setPrivatePosts(false)}
          />
          <div>Display public posts only</div>
        </label>
        <label>
          <input
            type="radio"
            name="private"
            defaultChecked={privatePosts}
            onChange={() => {
              setPrivatePosts(true);
              if (searchType === "author") {
                setSearchType("tags");
              }
            }}
          />
          <div>Display your posts only</div>
        </label>
      </div>
      <div id="type-button-and-value-form">
        <button
          onClick={(evt) => {
            evt.preventDefault();
            setTypeDropdown(!typeDropdown);
          }}
        >
          Search by {searchType[0].toUpperCase() + searchType.slice(1)}
        </button>
        <form
          onSubmit={(evt) => {
            evt.preventDefault();
            setShouldUpdate(true);
          }}
        >
          <input
            type="text"
            value={searchValue}
            onChange={(evt) => {
              setSearchValue(evt.target.value);
            }}
            placeholder={"\u2315"}
          />
          <input type="submit" value="Search" />
        </form>
      </div>
      <div id="type-dropdown" style={typeDisplay()}>
        <label id="type-radio-tags">
          <input
            type="radio"
            name="type"
            defaultChecked={searchType === "tags"}
            onChange={() => setSearchType("tags")}
          />{" "}
          Search by Tags
        </label>
        <label id="type-radio-title">
          <input
            type="radio"
            name="type"
            defaultChecked={searchType === "title"}
            onChange={() => setSearchType("title")}
          />{" "}
          Search by Title
        </label>
        <label id="type-radio-content">
          <input
            type="radio"
            name="type"
            defaultChecked={searchType === "content"}
            onChange={() => setSearchType("content")}
          />{" "}
          Search by Content
        </label>
        {authorSearch()}
      </div>
      <PostList
        shouldUpdate={shouldUpdate}
        setShouldUpdate={setShouldUpdate}
        searchType={searchType}
        searchValue={searchValue}
        privatePosts={privatePosts}
      />
    </div>
  );
}

export default Search;
