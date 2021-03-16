import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';

function Post(props){
    //state and fetch request for post object
    const [postObj, setPostObj] = useState(null);

    useEffect(() => {
        if(!postObj || postObj._id !== props.postId){
            fetch(`/posts/id/${props.postId}`)
            .then(res => res.json())
            .then(jsonRes => {
                setPostObj(jsonRes)
                //pass post object to parent if requested
                if(props.giveParentPost){
                    props.giveParentPost(jsonRes)
                }
            })
        }
    })
    //Clickable title based on props
    function postTitle(){
        if(props.linked){
            return(
                <Link to={`/facts/${props.postId}`}><h2 className="post-title">{postObj.title}</h2></Link>
            )
        }else{
            return <h2 className="post-title">{postObj.title}</h2>
        }
    }
    //display time updated only if it exits
    function postUpdated(){
        if(postObj.update){
            return(
                <h6 className="post-update">Updated {new Date(postObj.update).toDateString()} {new Date(postObj.update).toLocaleTimeString()}</h6>
            )
        }else{
            return '';
        }
    }
    //assemble post but only after fetch is complete
    function postContent(){
        if(postObj){
            return(
                <div className="post">
                    {postTitle()}
                    <h4 className="post-author">{postObj.author}</h4>
                    <h6 className="post-date">Posted {new Date(postObj.date).toDateString()} {new Date(postObj.date).toLocaleTimeString()}</h6>
                    {postUpdated()}
                    <p className="post-body">{postObj.body}</p>
                </div>
            )
        }else{
            return '';
        }
    }
    return postContent()
}

export default Post;