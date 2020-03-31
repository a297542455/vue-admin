import request from '@/utils/request'
import qs from 'qs'

export function getList(query) {
  return request({
    url: '/user/getPlist',
    method: 'post',
    data: query
  })
}

export function getinfo(id) {
  return request({
    url: '/user/getInfo',
    method: 'get',
    params: { id }
  })
}

export function modify(data) {
  return request({
    url: '/user/modify',
    method: 'post',
    data
  })
}

export function save(data) {
  return request({
    url: '/user/save',
    method: 'post',
    data
  })
}

export function del(id) {
  return request({
    url: '/user/delete',
    method: 'get',
    params: { id }
  })
}

export function change(id, field, value) {
  const data = {
    val: id,
    field: field,
    value: value
  }
  return request({
    url: '/admin/admin/change',
    method: 'post',
    data
  })
}

export function delAll(data) {
  return request({
    url: '/admin/admin/delall',
    method: 'post',
    data
  })
}

export function changeAll(data) {
  return request({
    url: '/admin/admin/changeall',
    method: 'post',
    data
  })
}
