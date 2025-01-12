<template>
  <div class="common-container">
    <h5>새로운 사용자 등록</h5>
    <div class="input-box">
      <!-- 전화번호 입력 -->
      <label>
        전화번호:
        <input
          type="text"
          v-model="userData.telno"
          class="input"
          placeholder="전화번호를 입력하세요."
          minlength="10"
          maxlength="11"
          autocomplete="tel"
          @input="resetTelnoStatus"
          :disabled="isValidTelno"
        />
      </label>
      <button @click="handleValidateTelno" type="button" :disabled="isValidTelno">
        인증번호 발송
      </button>

      <!-- 인증번호 입력 -->
      <div v-if="authCodeInputMode" class="rowflex-container">
        <input
          type="text"
          v-model="userData.authNumber"
          class="input"
          style="font-size: 20px; margin-right: 10px"
          minlength="6"
          maxlength="6"
          placeholder="인증번호 6자리 입력"
          @input="checkAuthNumber"
        />
        <button @click="handleValidateTelno" type="button">재발송</button>
      </div>
      <!-- 메시지 박스 -->
      <q-banner v-if="message" class="message-box">{{ message }}</q-banner>
      <!-- 사용자 정보 입력 -->
      <div v-if="isValidTelno">
        <label>
          비밀번호:
          <input
            type="password"
            v-model="userData.password"
            class="input"
            placeholder="영문 숫자 6자리 이상입력"
            autocomplete="new-password"
          />
        </label>
        <label>
          비밀번호 확인:
          <input
            type="password"
            v-model="userData.password2"
            class="input"
            placeholder="비밀번호를 다시 입력하세요.(영문 숫자 6자리 이상)"
            autocomplete="new-password"
          />
        </label>

        <label>
          사용자 이름:
          <input
            type="text"
            v-model="userData.username"
            class="input"
            placeholder="이름을 입력하세요."
            autocomplete="name"
          />
        </label>
        <!-- @update:model-value="validatePassword" -->
        <label>
          이메일:
          <input
            type="email"
            v-model="userData.email"
            class="input"
            placeholder="이메일을 입력하세요."
            autocomplete="email"
            @input="resetEmailStatus"
          />
        </label>
        <!-- <q-btn @click="validateEmail" type="button"> 이메일 유효 확인 </q-btn> -->

        <label>
          우편번호:
          <input
            type="number"
            v-model="userData.postcode"
            class="input"
            placeholder="우편번호를 입력하세요."
            min="10000"
            max="99999"
            autocomplete="postal-code"
          />
        </label>

        <label>
          주소 1:
          <input
            type="text"
            v-model="userData.addr1"
            class="input"
            placeholder="주소를 입력하세요."
            autocomplete="address-line1"
          />
        </label>
        <label>
          주소 2:
          <input
            type="text"
            v-model="userData.addr2"
            class="input"
            placeholder="세부 주소를 입력하세요."
            autocomplete="address-line2"
          />
        </label>

        <!-- 제출 버튼 -->
        <br /><br />
        <q-btn @click="handleSubmit" color="primary">입력 내용 제출</q-btn>&nbsp;&nbsp;
        <q-btn @click="cancelSubmit" color="secondary">작업 취소</q-btn>
      </div>
    </div>
  </div>
</template>

<script setup>
import qs from 'qs'
import axiosInstance from '../utils/axiosInterceptor'
import { ref } from 'vue'
// import { getSessionContext } from '../utils/sessionFunctions'
import { validateNewPassword } from '../utils/validateNewPassword'
import { validateEmail } from '../utils/validateEmail'
import { validateTelno } from '../utils/validateTelno'
import { APIs } from '../utils/APIs'
import { messageCommon } from '../utils/messageCommon'
// let sessionContext = getSessionContext()
let role = 'admin'

// 사용자 데이터 초기화
const userData = ref({
  userid: '',
  password: '',
  password2: '',
  username: '',
  email: '',
  telno: '',
  postcode: '',
  addr1: '',
  addr2: '',
  role: '',
})
const isValidTelno = ref(false)
const authCodeInputMode = ref(false)
const message = ref('')

// 전화번호 중복을 확인하고 인증 번호를 보냄.
const handleValidateTelno = async () => {
  const result = await validateTelno(userData.value.telno)
  if (!result.success) {
    alert(result.message) // 검증 실패 메시지 출력
    return
  }

  userData.value.authNumber = ''
  authCodeInputMode.value = true

  try {
    const response = await axiosInstance.post(APIs.SEND_ONE_SMS, {
      ...userData.value,
    })
    if (response.status === 200) {
      message.value = response.data.message
    }
  } catch (error) {
    handleError(error)
  }
}

//전화번호를 변경한 경우
const resetTelnoStatus = () => {
  message.value = '전화번호가 변경되었습니다. 인증번호 발송을 눌러주세요.'
  isValidTelno.value = false
}

//인증번호가 입력된 경우
const checkAuthNumber = () => {
  if (userData.value.authNumber.length === 6) compareAuthNumber()
}

//입력된 인증번호를 서버에 요청하여 비교
const compareAuthNumber = async () => {
  try {
    const response = await axiosInstance.post(APIs.VERIFY_CODE, {
      ...userData.value,
    })
    if (response.status === 200) {
      message.value = '인증번호가 확인되었습니다.'
      isValidTelno.value = true
      authCodeInputMode.value = false
      userData.value.authNumber = ''
      resetUserData()
    }
  } catch (error) {
    handleError(error)
  }
}

//작업 취소
const cancelSubmit = async () => {
  isValidTelno.value = false
  message.value = ''
}

// 제출 함수
const handleSubmit = async () => {
  if (!validateInput()) return

  // 비밀번호 검증
  const passwordResult = validateNewPassword(userData.value.password)
  if (!passwordResult.isValid) {
    alert(passwordResult.message) // 검증 실패 메시지 출력
    return
  }

  // 이메일 검증
  const emailResult = await validateEmail(userData.value.email, userData.value.telno)
  if (!emailResult.success) {
    alert(emailResult.message) // 검증 실패 메시지 출력
    return
  }

  userData.value.role = role
  try {
    const response = await axiosInstance.post(
      APIs.REGISTER_USER,
      qs.stringify({
        ...userData.value,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    )
    if (response.status === 200) {
      message.value = '사용자가 성공적으로 등록되었습니다.'
      isValidTelno.value = false
    }
  } catch (error) {
    handleError(error)
  }
}

// 입력값 검증
const validateInput = () => {
  const { password, password2, username } = userData.value
  if (!password) {
    message.value = '비밀번호를 입력해 주세요. (영문과 숫자로 구성된 6자리 이상)'
    return false
  }
  if (!password2) {
    message.value = '확인 비밀번호를 입력해 주세요.'
    return false
  }
  if (password !== password2) {
    message.value = '비밀번호가 일치하지 않습니다.'
    return false
  }
  if (!username) return alert('사용자 이름을 입력해 주세요.') && false
  return true
}

// 입력 필드 리셋
function resetUserData() {
  const telno = userData.value.telno // 기존 전화번호 값 저장
  userData.value = {
    telno, // 기존 전화번호 유지
    password: '',
    password2: '',
    username: '',
    email: '',
    postcode: '',
    addr1: '',
    addr2: '',
    role: '',
  }
}

// axios 에러 처리 함수
const handleError = (error) => {
  message.value = error.response
    ? error.response.data.message
    : error.request
      ? messageCommon.ERR_NETWORK
      : messageCommon.ERR_ETC
}
</script>

<style scoped>
.common-container {
  padding: 20px;
}
.message-box {
  margin-top: 10px;
  color: red;
}
.input-box label {
  display: block;
  margin: 10px 0;
}
</style>
