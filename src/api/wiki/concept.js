import request from '@/utils/request'

export function getlabellist(data) {
  return request({
    url: '/label/getlist',
    method: 'post',
    data
  })
}

export function getlist(data) {
  return request({
    url: '/label/getlist',
    method: 'post',
    data
  })
}

export function getConceptlist(data) {
  return request({
    url: '/concept/getPlist',
    method: 'post',
    data
  })
}

export function getInfo(id) {
  return request({
    url: '/concept/getInfo',
    method: 'get',
    params: { id }
  })
}

export function del(id) {
  return request({
    url: '/concept/delete',
    method: 'get',
    params: { id }
  })
}

export function save(data) {
  return request({
    url: '/concept/save',
    method: 'post',
    data
  })
}

