import axiosInstance from '../utils/axiosInterceptor'
import { APIs } from '../utils/APIs'

// 이메일 중복 확인 및 유효성 검사를 수행하는 함수
export const validateEmail = async (email, telno) => {
  // 이메일 패턴을 정의
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // 이메일 형식이 올바른지 확인하는 함수
  const validateEmailPattern = () => {
    if (!emailPattern.test(email)) {
      return {
        isValid: false,
        message: '유효하지 않은 이메일 형식입니다. 확인해 주세요.',
      }
    }
    return { isValid: true, message: '' }
  }

  // 이메일 중복 여부를 확인하는 함수
  const checkDuplicateEmail = async () => {
    try {
      const response = await axiosInstance.post(APIs.GET_EMAIL_COUNT, {
        telno: telno,
        email: email,
      })
      let emailCount = response.data.email_count
      if (emailCount > 0) {
        return {
          isExisting: true,
          message: '등록된 이메일이 있습니다. 다시 입력해주세요.',
        }
      }
      return { isExisting: false, message: '사용 가능한 이메일입니다.' }
    } catch (error) {
      console.error('emailDupkey error :', error)
      return {
        isExisting: false,
        message: '이메일 확인 중 오류가 발생했습니다. ',
      }
    }
  }

  // 이메일 형식 검사를 실행
  const emailValidationResult = validateEmailPattern()
  if (!emailValidationResult.isValid) {
    return { success: false, message: emailValidationResult.message }
  }

  // 이메일 중복 여부 확인
  const duplicateCheckResult = await checkDuplicateEmail()
  if (duplicateCheckResult.isExisting) {
    return { success: false, message: duplicateCheckResult.message }
  }

  // 사용 가능한 이메일인 경우
  return { success: true, message: '사용 가능한 이메일입니다.' }
}
