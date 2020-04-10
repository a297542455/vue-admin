import request from '@/utils/request'

export function getId(data) {
  return request({
    url: '/public/getId',
    method: 'get',
    data
  })
}

