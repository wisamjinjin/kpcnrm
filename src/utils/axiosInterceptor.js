/**
 * Axios 인스턴스를 설정 및 관리하는 파일
 * - 공통적인 요청/응답 처리 및 에러 핸들링을 정의
 * - `axios.interceptors`를 사용하여 요청 전/후의 작업을 수행
 */

import axios from 'axios'

import {
  getSessionContext,
  fetchSessionData,
  removeSessionData,
  saveSessionData,
} from '../utils/sessionFunctions'
const baseURL = 'http://localhost:9001' // 베이스 URL 설정
const axiosInstance = axios.create({
  timeout: 1000, // 요청 타임아웃 설정
  withCredentials: true,
})

// 요청 인터셉터 :헤더에 access token을 추가
axiosInstance.interceptors.request.use(
  async function (config) {
    // 로컬 스토리지에서 액세스 토큰 가져오기 (key:value로 return됨)
    const sessionContext = getSessionContext()
    const accessTokenObj = fetchSessionData(sessionContext, ['authToken'])
    const accessToken = accessTokenObj ? accessTokenObj.authToken : null

    // 토큰을 Authorization 헤더에 추가
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  function (error) {
    console.error('인터셉터 요청 중 오류 발생:', error.config?.url, error)
    return Promise.reject(error)
  },
)

// 응답 인터셉터: 상태 코드에 따라 처리
axiosInstance.interceptors.response.use(
  function (response) {
    // 응답 상태 코드가 200번대인 경우 그대로 반환
    if (response.status >= 200 && response.status < 300) {
      return response
    }
    return Promise.reject(
      new Error(`오류가 발생하였습니다. 정의되지 않은 상태 코드: ${response.status}`),
    )
  },
  async function (error) {
    if (error.response) {
      const { status, data, config } = error.response // 상태 코드와 응답 데이터, 원래 요청 가져옴

      if (status === 401) {
        const sessionContext = getSessionContext()
        // 에러 코드 확인
        const errorCode = data?.errorCode
        if (errorCode === 'ACCESS_EXPIRED' || errorCode === 'ACCESS_INVALID') {
          if (errorCode !== 'ACCESS_EXPIRED') {
            console.log(
              'In axios interceptor : Access 토큰이 존재하지 않습니다. 새로운 토큰을 요청합니다.',
            )
          }
          try {
            const noInterceptorAxios = axios.create() // 인터셉터 없는 새 axios 인스턴스 생성
            const response = await noInterceptorAxios.post(
              `${baseURL}/reissue-access-token`,
              { username: '', role: '' }, // 필요한 요청 데이터
              {
                headers: {
                  Authorization: `Bearer ${
                    fetchSessionData(sessionContext, ['authToken'])?.authToken
                  }`, // 기존 토큰 사용
                },
                withCredentials: true,
              },
            )

            const newAccessToken = response.headers['authorization']?.replace('Bearer ', '')

            if (newAccessToken) {
              saveSessionData(sessionContext, { authToken: newAccessToken })
              // 원래 요청에 새 토큰 적용
              config.headers.Authorization = `Bearer ${newAccessToken}`
              console.log(
                'In axios interceptor : 새로운 발급 토큰으로 원래 요청을 재시도합니다:',
                config.url,
              )

              // 원래 요청 재시도
              return axiosInstance(config)
            } else {
              console.log(
                'In axios interceptor : 새로운 액세스 토큰을 찾을 수 없습니다. 세션 데이터를 삭제합니다.',
              )
              removeSessionData(sessionContext, ['authToken', 'username'])
            }
          } catch (error) {
            const reissueErrorCode = error.response.data?.errorCode
            removeSessionData(sessionContext, ['authToken', 'username'])
            if (reissueErrorCode === 'REFRESH_INVALID') {
              console.log('In axios interceptor : 리프레쉬 토큰이 만료')
              return Promise.reject(error)
            }
          }
        } else {
          console.log(
            'In axios interceptor : 401 에러: 액세스 토큰/리프레쉬 이외의 401 에러가 발생하였습니다.',
          )
          removeSessionData(sessionContext, ['authToken', 'username'])
        }
      }

      return Promise.reject(error) // 에러를 그대로 반환
    }

    return Promise.reject(error)
  },
)

export default axiosInstance
