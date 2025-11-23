const constants = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
}

export function setToken(value: string) {
  localStorage.setItem(constants.TOKEN, value || '')
}

export function getToken() {
  return localStorage.getItem(constants.TOKEN) || ''
}

export function setRefreshToken(value: string) {
  localStorage.setItem(constants.REFRESH_TOKEN, value || '')
}

export function getRefreshToken() {
  return localStorage.getItem(constants.REFRESH_TOKEN) || ''
}
