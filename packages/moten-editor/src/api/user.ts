import { get, post } from '../composable/use-request'

export const userLoginAsync = (params: { username: string; password: string }) => {
  return post('/rest/v1/user/login', params)
}

export const userRegisterAsync = (params: { username: string; password: string }) => {
  return post('/rest/v1/user/register', params)
}



