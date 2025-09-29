const constants = {
  TOKEN: 'token',
}

export function setToken(value: string) {
  localStorage.setItem(constants.TOKEN, value || '')
}

export function getToken() {
  return localStorage.getItem(constants.TOKEN) || ''
}
