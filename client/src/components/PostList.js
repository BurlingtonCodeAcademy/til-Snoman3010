import Post from './Post';
import { useState, useEffect } from "react";

function PostList(props){
    //state for array of post ids and initial load boolean - can't test based on length of array or searches with no results query infinitely
    const [postsArr, setPostsArr] = useState([])
    const [firstLoad, setFirstLoad] = useState(true)
    useEffect(() => {
        //should update prop so parent can trigger reload with new search criteria
        if(firstLoad || props.shouldUpdate){
            setFirstLoad(false)
            props.setShouldUpdate(false)
            if(props.privatePosts){
                if(!props.searchValue){
                    fetch('/myPosts/all')
                    .then(res => res.json())
                    .then(jsonRes => setPostsArr(jsonRes))
                }else{
                    fetch(`/myPosts/${props.searchType}/${props.searchValue}`)
                    .then(res => res.json())
                    .then(jsonRes => {
                        setPostsArr(jsonRes)
                    })
                }
            }else{
                if(!props.searchValue){
                    fetch('/posts/all')
                    .then(res => res.json())
                    .then(jsonRes => setPostsArr(jsonRes))
                }else{
                    fetch(`/posts/${props.searchType}/${props.searchValue}`)
                    .then(res => res.json())
                    .then(jsonRes => {
                        setPostsArr(jsonRes)
                    })
                }
            }
        }
    })
    //map post ids to Post components with linked titles
    return(
        <div id="posts-list">
            {postsArr.map((postCode) => {
                return <Post key={postCode} postId={postCode} linked={true} />
            })}
        </div>
    )
}

export default PostList;