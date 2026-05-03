import { NavLink, Outlet } from 'react-router-dom'

function AppLayout() {
  const navLinkClass = ({ isActive }) =>
    isActive ? 'menu-link menu-link-active' : 'menu-link'

  return (
    <div className="page">
      <header className="top-menu">
        <NavLink to="/" className={navLinkClass}>
          Каталог
        </NavLink>
        <NavLink to="/cart" className={navLinkClass}>
          Корзина
        </NavLink>
        <NavLink to="/login" className={navLinkClass}>
          Войти
        </NavLink>
      </header>
      <Outlet />
    </div>
  )
}

export default AppLayout
