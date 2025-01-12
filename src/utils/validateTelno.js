import axiosInstance from './axiosInterceptor'
import { APIs } from './APIs'

// 전화번호 중복 확인 및 유효성 검사를 수행하는 함수
export const validateTelno = async (telno) => {
  // 전화번호 형식을 확인하는 함수
  const validateTelnoFormat = () => {
    const telnoPattern = /^\d{10,11}$/ // 전화번호는 10~11자리 숫자
    if (!telnoPattern.test(telno)) {
      return {
        success: false,
        message: '유효하지 않은 전화번호 형식입니다. 확인해 주세요.',
      }
    }
    return { success: true, message: '' }
  }

  // 전화번호 중복 여부를 확인하는 함수
  const checkDuplicateTelno = async () => {
    try {
      const response = await axiosInstance.post(APIs.GET_TELNO_COUNT, {
        telno: telno,
      })
      let telnoCount = response.data.telno_count
      if (telnoCount > 0) {
        return {
          success: false,
          message: '중복된 전화번호가 있습니다. 다시 입력해주세요.',
        }
      } else {
        return { success: true, message: '사용 가능한 전화번호입니다.' }
      }
    } catch (error) {
      console.error('telno dup check error :', error)
      return {
        success: false,
        message: '전화번호 확인 중 오류가 발생했습니다.',
      }
    }
  }

  // 전화번호 형식 검사를 실행
  const formatResult = validateTelnoFormat()
  if (!formatResult.success) {
    return formatResult // 형식이 잘못된 경우 즉시 반환
  }

  // 전화번호 중복 여부를 확인
  const duplicateResult = await checkDuplicateTelno()
  return duplicateResult
}
