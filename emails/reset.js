const keys = require('../keys')

module.exports = function(email, token) {
  return {
    to: email,
    from: keys.EMAIL_FROM,
    subject: 'Password reset',
    html: `
      <h1>You dont remember passwor?</h1>
      <p>If yet ignored this mail</p>
      <p>
        <a href="${keys.BASE_URL}/auth/password/${token}">Restore password<a>
      </p>
      <hr />
      <a href="${keys.BASE_URL}">Магазин курсов</a>
    `
  }
}