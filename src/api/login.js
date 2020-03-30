import request from '@/utils/request'

export function loginByUsername(username, password) {
  const data = {
    username: username,
    password: password
  }
  return request({
    url: '/login/doLogin',
    method: 'post',
    params: data
  })
}

export function getUserInfo() {
  return request({
    url: '/user/getLonginUser',
    method: 'get'
  })
}

