import logoMark from '../../design-system/assets/logo-mark.svg';

export default function NavBar() {
  return (
    <nav className="nav" aria-label="MetaToe">
      <a className="nav-logo" href="/" aria-label="MetaToe home">
        <img src={logoMark} alt="" width={44} height={44} />
      </a>
      <span className="nav-spacer" />
      <div className="nav-status">
        <span className="dot" aria-hidden="true" />
        Pass &amp; play
      </div>
    </nav>
  );
}
