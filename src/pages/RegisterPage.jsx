import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../utils/AuthContext'

function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register({
        username: username.trim(),
        password,
        email: email.trim() || null,
      })
      navigate('/')
    } catch (err) {
      setError(err.message || 'Не удалось зарегистрироваться')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <h2>Регистрация</h2>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label>
          <span>Логин (мин. 3 символа)</span>
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
          <span>Email (необязательно)</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <label>
          <span>Пароль (мин. 6 символов)</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            minLength={6}
          />
        </label>
        {error && <p className="auth-error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? 'Создаём...' : 'Зарегистрироваться'}
        </button>
      </form>
      <p className="auth-hint">
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </main>
  )
}

export default RegisterPage
