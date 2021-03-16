import { Link } from 'react-router-dom';

function Nav(props){
    //links to new post page, search list page, login/out page, and display current user
    return(
        <div id='nav-bar'>
            <Link className='nav-item' to='/' ><h4>Write Post</h4></Link>
            <Link className='nav-item' to='/facts' ><h4>Read Posts</h4></Link>
            <Link className='nav-item' to='/login' ><h4>{props.username.toLowerCase() !== 'anonymous' ? 'Logout' : 'Login'}</h4></Link>
            <div className='nav-item' id='nav-padding'>{/*Empty div for styling*/}</div>
            <div className='nav-item' id='nav-padding-2'>{/*Empty div for styling*/}</div>
            <div className='nav-item' id='nav-user-display'><h4>Browsing as: {props.username}</h4></div>
        </div>
    )
}

export default Nav;