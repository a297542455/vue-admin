import request from '@/utils/request'

export function getlabelList(query) {
  return request({
    url: '/label/getlist',
    method: 'post',
    data: query
  })
}

export function getlist(query) {
  return request({
    url: '/label/getlist',
    method: 'post',
    data: query
  })
}

export function getConceptlist(query) {
  return request({
    url: '/concept/getPlist',
    method: 'post',
    data: query
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

