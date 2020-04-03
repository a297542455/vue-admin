import request from '@/utils/request'

export function getlist(query) {
  return request({
    url: '/label/getlist',
    method: 'post',
    data: query
  })
}

export function getInfo(id) {
  return request({
    url: '/label/getInfo',
    method: 'get',
    params: { id }
  })
}

export function del(id) {
  return request({
    url: '/label/delete',
    method: 'get',
    params: { id }
  })
}

export function save(data) {
  return request({
    url: '/label/save',
    method: 'post',
    data
  })
}

export function change(id, field, value) {
  const data = {
    val: id,
    field: field,
    value: value
  }
  return request({
    url: '/admin/rules/change',
    method: 'post',
    data
  })
}

export function delAll(data) {
  return request({
    url: '/admin/rules/delall',
    method: 'post',
    data
  })
}

export function changeAll(data) {
  return request({
    url: '/admin/rules/changeall',
    method: 'post',
    data
  })
}

