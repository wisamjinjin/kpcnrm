<template>
  <!-- <q-page class="common-container q-pa-md"> -->
  <q-card>
    <h6>사용자 조회 및 수정</h6>

    <!-- 사용자 조회 폼 -->
    <q-form @submit.prevent="handleSearch">
      <q-input v-model="searchQuery" label="전화번호" outlined readonly class="q-mb-md" />

      <q-input
        v-model="password"
        label="비밀번호"
        placeholder="비밀번호 입력"
        type="password"
        outlined
        :readonly="updateMode"
        class="q-mb-md"
      />

      <q-btn type="submit" label="조회" color="primary" class="full-width" />
    </q-form>
    <q-banner v-if="message" type="info">{{ message }}</q-banner>
    <br />
    <!-- 사용자 정보 수정 폼 -->
    <q-card v-if="updateMode && userData" class="q-mt-lg">
      <q-form @submit.prevent="handleUpdate">
        <q-input
          v-model="userData.username"
          label="사용자 이름"
          placeholder="사용자 이름 수정"
          outlined
          class="q-mb-md"
        />

        <q-input
          v-model="userData.email"
          label="이메일"
          placeholder="이메일 수정"
          outlined
          type="email"
          class="q-mb-md"
          @change="handleEmailChange"
        />
        <!-- <q-btn
          label="이메일 유효 확인"
          color="primary"
          @click="validateEmail"
          class="q-mb-md"
        /> -->

        <q-input
          v-model="userData.postcode"
          label="우편번호"
          placeholder="우편번호 수정"
          outlined
          minlength="5"
          maxlength="5"
          class="q-mb-md"
        />

        <q-input
          v-model="userData.addr1"
          label="주소"
          placeholder="주소 수정"
          outlined
          class="q-mb-md"
        />

        <q-input
          v-model="userData.addr2"
          label="상세 주소"
          placeholder="상세 주소 수정"
          outlined
          class="q-mb-md"
        />

        <button push color="white" text-color="blue-grey-14" type="submit">수정 내용 제출</button>
        <button type="reset" @click="handleReset">취소</button>
      </q-form>
    </q-card>
  </q-card>
  <!-- </q-page> -->
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axiosInstance from '../utils/axiosInterceptor'
import { Dialog } from 'quasar'
import { getSessionContext, fetchSessionData } from '../utils/sessionFunctions'
import { APIs } from '../utils/APIs'
import { validateEmail } from '../utils/validateEmail'
import { messageCommon } from '../utils/messageCommon'
import { navigate } from '../utils/navigate'

// 세션 관련 변수 선언
let sessionContext = getSessionContext()
const localSessionData = fetchSessionData(sessionContext, ['telno'])

// 입력 및 상태 관련 변수
const router = useRouter()
const searchQuery = ref('') // 검색어 (사용자 ID 또는 전화번호)
const password = ref('') // 비밀번호
const updateMode = ref(false)
const isValidEmail = ref(false)
const userData = ref(null) // 조회된 사용자 정보
const passwordMsg = ref('') // 비밀번호 관련 메시지
const message = ref('') // 상태 메시지

// 사용자 정보 조회
const handleSearch = async () => {
  try {
    const response = await axiosInstance.post(APIs.GET_USER_WITH_PASSWORD, {
      query: searchQuery.value,
      password: password.value,
      queryType: 'telno',
    })

    if (response.status === 200 && response.data) {
      userData.value = response.data
      passwordMsg.value = ''
      updateMode.value = true
    }
  } catch (error) {
    handleError(error)
    return
  }
}

// 사용자 정보 수정
const handleUpdate = async () => {
  const emailValidateionResult = await validateInput(userData)
  if (!emailValidateionResult) {
    return
  }

  try {
    const response = await axiosInstance.post(APIs.UPDATE_USER, {
      ...userData.value,
    })

    if (response.status === 200) {
      message.value = '사용자 정보가 성공적으로 수정되었습니다.'
      updateMode.value = false
    }
  } catch (error) {
    handleError(error)
  }
}

// 이메일 유효 확인 및 수정 처리
const handleEmailChange = async () => {
  isValidEmail.value = false
}

// 입력값 검증
const validateInput = async (userData) => {
  const { username, email, postcode } = userData.value

  if (!username || username.trim() === '') {
    alert('사용자 이름을 입력해 주세요.')
    return false
  }

  if (!email || email.trim() === '') {
    alert('이메일을 입력해 주세요.')
    return false
  }

  const result = await validateEmail(userData.value.email, userData.value.telno)

  if (!result.success) {
    alert(result.message)
    return false
  }

  if (postcode && postcode.trim() !== '') {
    const postcodePattern = /^\d{5}$/
    if (!postcodePattern.test(postcode)) {
      alert('우편번호는 5자리 숫자여야 합니다.')
      return false
    }
  }
  return true
}

// Axios 에러 처리
const handleError = (error) => {
  //refresh expired인 경우 401발생
  if (error.response?.status === 403 || error.response?.status === 401) {
    Dialog.create({
      title: '오류',
      message: '세션이 만료되었거나 권한이 없습니다. \n다시 로그인해 주세요.',
      ok: {
        label: '확인',
        color: 'primary',
      },
      persistent: true,
    })
    navigate(router, sessionContext, 'login') // 로그인 화면으로 이동
  } else {
    if (error.response) {
      message.value = error.response.data.message
    } else if (error.request) {
      message.value = messageCommon.ERR_NETWORK
    } else {
      message.value = messageCommon.ERR_ETC
    }
  }
}

// flag초기화 함수
const handleReset = () => {
  updateMode.value = false
  message.value = ''
}

// mount시 세션데이터를 가져와 화면 입력 초기값으로
onMounted(async () => {
  if (localSessionData.telno) {
    searchQuery.value = localSessionData.telno
  }
  password.value = '   '
  message.value = '정보 수정을 위해 비밀번호를 다시한번 입력해주세요.'
})
</script>

<style scoped></style>
