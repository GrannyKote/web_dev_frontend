import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login({ username: username.trim(), password })
      navigate('/')
    } catch (err) {
      setError(err.message || 'Не удалось войти')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <h2>Вход</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          <span>Логин</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            minLength={3}
          />
        </label>
        <label>
          <span>Пароль</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            minLength={6}
          />
        </label>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Входим...' : 'Войти'}
        </button>
      </form>
      <p className="auth-hint">
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
    </main>
  )
}

export default LoginPage
