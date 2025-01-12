// 비밀번호 검증 함수
export const validateNewPassword = (value) => {
  // 최소 6자리인지 확인
  if (!value || value.length < 6) {
    return {
      isValid: false,
      message: "비밀번호는 6자리 이상이어야 합니다.",
    };
  }

  // 영문자 포함 여부 확인
  const hasLetter = /[A-Za-z]/.test(value);
  if (!hasLetter) {
    return {
      isValid: false,
      message: "비밀번호에는 최소 하나 이상의 영문자가 포함되어야 합니다.",
    };
  }

  // 숫자 포함 여부 확인
  const hasNumber = /\d/.test(value);
  if (!hasNumber) {
    return {
      isValid: false,
      message: "비밀번호에는 최소 하나 이상의 숫자가 포함되어야 합니다.",
    };
  }

  // 모든 조건 만족
  return {
    isValid: true,
    message: "비밀번호가 유효합니다.",
  };
};
