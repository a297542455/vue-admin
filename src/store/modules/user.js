import { loginByUsername, getUserInfo } from '@/api/login'
import { getToken, setToken, removeToken } from '@/utils/auth'

const user = {
  state: {
    token: getToken(),
    name: '',
    avatar: '',
    status: '',
    realName: '',
    phone: '',
    email: '',
    roles: 0,
    group: ''
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_REALNAME: (state, realName) => {
      state.realName = realName
    },
    SET_EMAIL: (state, email) => {
      state.email = email
    },
    SET_PHONE: (state, phone) => {
      state.phone = phone
    },
    SET_STATUS: (state, status) => {
      state.status = status
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    },
    SET_GROUP: (state, group) => {
      state.group = group
    }
  },

  actions: {
    // 用户名登录
    LoginByUsername({ commit }, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        loginByUsername(username, userInfo.password).then(response => {
          const data = response.data
          commit('SET_TOKEN', data.token)
          setToken(response.data.token)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetUserInfo({ commit, state }) {
      return new Promise((resolve, reject) => {
        getUserInfo().then(response => {
          if (!response.data) { // 由于mockjs 不支持自定义状态码只能这样hack
            reject('error')
          }
          const data = response.data
          const { access, groupId, userName, img, email, phone, realName } = data
          if (access && groupId) {
            commit('SET_ROLES', groupId)
          } else {
            reject('拉取用户权限失败')
          }
          commit('SET_NAME', userName)
          commit('SET_AVATAR', img)
          commit('SET_REALNAME', realName)
          commit('SET_PHONE', phone)
          commit('SET_EMAIL', email)
          commit('SET_GROUP', groupId)
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        commit('SET_ROLES', 0)
        removeToken()
        resolve()
      })
    },

    // 动态修改权限
    ChangeRoles({ commit, dispatch }) {
      return new Promise(resolve => {
        getUserInfo().then(response => {
          const data = response.data
          commit('SET_ROLES', data.roles)
          commit('SET_NAME', data.name)
          commit('SET_AVATAR', data.avatar)
          commit('SET_INTRODUCTION', data.introduction)
          dispatch('GenerateRoutes', data) // 动态修改权限后 重绘侧边菜单
          resolve()
        })
      })
    }
  }
}

export default user
