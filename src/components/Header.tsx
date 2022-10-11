import logo from '../logo.png';

function Header() {
    return (<nav>
        <ul>
            <a href="/">
                <img src={logo} className="logo" alt="logo" />
                <li><strong>{process.env.REACT_APP_WEBSITE_NAME}</strong></li>
            </a>
        </ul>
        <ul>
        </ul>
    </nav>);
}

export default Header;