
export function saveAuth(token, user){
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
}
export function getToken(){ return localStorage.getItem('token') }
export function getUser(){
  try { return JSON.parse(localStorage.getItem('user') || 'null') } catch { return null }
}
export function logout(){
  localStorage.removeItem('token'); localStorage.removeItem('user')
}
