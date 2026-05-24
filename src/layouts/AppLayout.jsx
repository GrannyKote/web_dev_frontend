import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'

function AppLayout() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const navLinkClass = ({ isActive }) =>
    isActive ? 'menu-link menu-link-active' : 'menu-link'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="page">
      <header className="top-menu">
        <div className="menu-left">
          <NavLink to="/" className={navLinkClass}>
            Каталог
          </NavLink>
          <NavLink to="/cart" className={navLinkClass}>
            Корзина
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/orders" className={navLinkClass}>
              Заказы
            </NavLink>
          )}
        </div>
        <div className="menu-right">
          {isAuthenticated ? (
            <>
              <span className="menu-user">{user?.username}</span>
              <button type="button" className="menu-link menu-logout" onClick={handleLogout}>
                Выйти
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Войти
              </NavLink>
              <NavLink to="/register" className={navLinkClass}>
                Регистрация
              </NavLink>
            </>
          )}
        </div>
      </header>
      <Outlet />
    </div>
  )
}

export default AppLayout
