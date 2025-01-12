<template>
  <q-page padding>
    <!-- 탭 선택 -->
    <q-tabs v-model="activeTab" class="text-teal" align="justify" dense>
      <q-tab name="resetPassword" label="비밀번호 재설정" />
      <q-tab name="changePassword" label="비밀번호 변경" />
    </q-tabs>

    <!-- 탭 패널 -->
    <q-tab-panels v-model="activeTab" animated>
      <!-- 비밀번호 재설정 탭 -->
      <q-tab-panel name="resetPassword">
        <q-card-section>
          <h5>비밀번호 재설정</h5>
          <q-input v-model="userData.telno" label="전화번호" readonly outlined />
          <q-btn @click="handleTelnoCheck" label="인증번호 발송" color="primary" />
          <!-- 인증번호 입력 -->
          <div v-if="codeInputMode" class="q-mt-md">
            <q-input
              v-model="userData.authNumber"
              label="인증번호"
              mask="######"
              outlined
              @update:model-value="checkAuthNumber"
            />
            <q-btn @click="handleTelnoCheck" label="재발송" color="primary" class="q-ml-md" />
          </div>
        </q-card-section>
      </q-tab-panel>

      <!-- 비밀번호 변경 탭 -->
      <q-tab-panel name="changePassword">
        <q-card-section>
          <h5>비밀번호 변경</h5>
          <q-input v-model="id" label="전화번호" readonly outlined />
          <q-input
            v-model="currentPassword"
            label="현재 비밀번호"
            type="password"
            outlined
            :readonly="isValidUser"
          />
          <q-btn @click="handleValidateUser" label="확인" color="primary" class="q-mt-md" />
        </q-card-section>
      </q-tab-panel>
    </q-tab-panels>

    <!-- 비밀번호 변경 입력 -->
    <div v-if="isValidUser || isValidTelno">
      <!-- 숨겨진 필드로 newPassword에 자동 완성이 안되도록 유도 -->
      <input type="password" name="fakepassword" style="display: none" />
      <q-input v-model="newPassword" label="새 비밀번호 입력" type="password" outlined />
      <q-input v-model="confirmPassword" label="새 비밀번호 확인" type="password" outlined />
      <q-btn @click="changePassword" label="변경" color="primary" class="q-mt-md" />&nbsp;&nbsp;
      <q-btn @click="cancelChange" label="작업 취소" color="negative" class="q-mt-md" />
    </div>

    <q-banner v-if="message">
      {{ message }}
    </q-banner>
  </q-page>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Dialog } from 'quasar'
import axiosInstance from '../utils/axiosInterceptor'
import { APIs } from '../utils/APIs'
import { messageCommon } from '../utils/messageCommon'
import { getSessionContext, fetchSessionData } from '../utils/sessionFunctions'
import { navigate } from '../utils/navigate'
const router = useRouter()
const route = useRoute()

//세션 관련 변수
const sessionContext = getSessionContext()
const localSessionData = fetchSessionData(sessionContext, ['telno'])

// 입력 및 상태 관련 변수
const activeTab = ref('')
const id = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isValidTelno = ref(false)
const isValidUser = ref(false)
const userData = ref({ telno: '', authNumber: '' })
const codeInputMode = ref(false)
const message = ref('')

// 전화번호 인증 요청
const handleTelnoCheck = async () => {
  userData.value.authNumber = ''
  if (!userData.value.telno) {
    alert('전화번호를 입력해 주세요.')
    return false
  }
  const telnoPattern = /^\d{11}$/
  if (!telnoPattern.test(userData.value.telno)) {
    alert('전화번호는 11자리 숫자여야 합니다.')
    return false
  }
  try {
    const response = await axiosInstance.post(APIs.SEND_ONE_SMS, userData.value)

    if (response.status === 200) {
      message.value = response.data.message
      codeInputMode.value = true
    }
  } catch (error) {
    message.value = error.response.data.message
    codeInputMode.value = true //test에서
  }
}

// 인증번호 비교
const checkAuthNumber = async () => {
  try {
    const response = await axiosInstance.post(APIs.VERIFY_CODE, userData.value)

    if (response.status === 200) {
      message.value = response.data.message
      isValidTelno.value = true
      codeInputMode.value = false
      userData.value.authNumber = ''
    }
  } catch (error) {
    message.value = error.response.data.message
  }
}

// 사용자와 비밀번호 검증
const handleValidateUser = async () => {
  if (!id.value || !currentPassword.value) {
    message.value = '전화번호와 현재 비밀번호를 입력해 주세요.'
    return
  }
  try {
    const response = await axiosInstance.post(APIs.GET_USER_WITH_PASSWORD, {
      query: id.value,
      queryType: 'telno',
      password: currentPassword.value,
    })

    if (response.status === 200) {
      isValidUser.value = true
      message.value = ''
    }
  } catch (error) {
    handleError(error)
  }
}

// 비밀번호 변경 취소
const cancelChange = async () => {
  isValidUser.value = false
  isValidTelno.value = false
  message.value = ''
}

// 비밀번호 변경
const changePassword = async () => {
  if (!newPassword.value || !confirmPassword.value) {
    message.value = '새 비밀번호와 비밀번호 확인을 입력해 주세요.'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    message.value = '새 비밀번호와 비밀번호 확인이 일치하지 않습니다.'
    return
  }

  try {
    const paramId = isValidTelno.value ? userData.value.telno : id.value
    const response = await axiosInstance.post(APIs.CHANGE_USER_PASSWORD, {
      telno: paramId,
      password: newPassword.value,
    })

    if (response.status === 200) {
      message.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
      alert('비밀번호가 성공적으로 변경되었습니다.')
    }
    isValidTelno.value = false
    isValidUser.value = false
  } catch (error) {
    handleError(error)
  }
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

//tab 1,2에 따라 필요한 초기화 및 메시지
watch(activeTab, (newTab) => {
  if (newTab === 'resetPassword') {
    userData.value.telno = localSessionData.telno
    message.value = '인증번호 발송 버튼을 눌러주세요.'
    isValidTelno.value = false
  } else if (newTab === 'changePassword') {
    id.value = localSessionData.telno
    currentPassword.value = '...'
    message.value = '현재 비밀번호를 다시 입력하세요.'
  }
})

// 컴포넌트가 마운트될 때 실행
onMounted(() => {
  const tabQuery = route.query.tab
  activeTab.value = tabQuery === '2' ? 'changePassword' : 'resetPassword'
})
</script>

<style scoped>
.tabs {
  margin-bottom: 20px;
}

.q-btn {
  margin-top: 10px;
}

.q-banner {
  margin-top: 20px;
}
</style>
