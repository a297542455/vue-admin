import request from '@/utils/request'

export function getlistRelation(data) {
  return request({
    url: '/relation/getPlist',
    method: 'post',
    data
  })
}

export function delRelation(id) {
  return request({
    url: '/relation/delete',
    method: 'get',
    params: { id }
  })
}

export function saveRelation(data) {
  return request({
    url: '/relation/save',
    method: 'post',
    data
  })
}
