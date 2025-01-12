<template>
  <q-card class="q-pa-md">
    <q-card-section>
      <div class="text-center">로그인</div>
    </q-card-section>

    <q-card-section>
      <q-form class="q-gutter-md">
        <q-input
          v-model="userData.query"
          label="전화번호"
          hint="전화번호 11자리"
          filled
          type="tel"
          maxlength="11"
          minlength="11"
          @update:model-value="revalidateUser"
        />
        <q-input
          v-model="userData.password"
          label="암호"
          type="password"
          hint="비밀번호를 입력하세요"
          filled
          @update:model-value="revalidateUser"
        />
      </q-form>
    </q-card-section>
    <q-btn @click="handleSubmit" type="submit" label="로그인" color="primary" />
    <q-card-section v-if="message">
      <q-banner type="warning">{{ message }}</q-banner>
    </q-card-section>

    <q-card-actions align="around">
      <q-btn
        label="비밀번호 찾기"
        @click="handleNavigate('changePassword', 1)"
        flat
        color="standard"
      />
      <q-btn label="비밀번호 변경" @click="handleNavigate('changePassword', 2)" flat />
      <q-btn v-if="!isRootUser" label="회원가입" @click="handleNavigate('registerUser')" flat />
    </q-card-actions>
  </q-card>
</template>

<script setup>
import { ref, onMounted, defineEmits } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios' //로그인에서는 항상 새로운 토큰을 가져오기 위해 axiosInterceptor를 사용하지 않음
import qs from 'qs'
import { APIs } from '../utils/APIs'
import { messageCommon } from '../utils/messageCommon'
import {
  getSessionContext,
  fetchSessionData,
  saveSessionData,
  clearSessionByContext,
} from '../utils/sessionFunctions'
import { navigate } from '../utils/navigate'

const router = useRouter()
const emit = defineEmits(['update-status'])

// 세션 관련 변수 선언
let sessionContext = ''
let localSessionData = ''

// 입력 및 상태 관련 변수
const requiredRole = 'admin' //현재 role이 admin인 경우에만 로그인 후 각종 메뉴 사용하도록...
const userData = ref({ query: '', password: '' })
const isRootUser = ref(false)
const message = ref('')

// 버튼 액션 핸들러
const handleNavigate = (action, tab) => {
  navigate(router, sessionContext, action, { tab })
}

// 로그인 요청, 현재 요구되는 role(requiredRole)과 사용자 DB의 role과 비교하여 권한 체크, 권한이 있는 경우 header에서 토큰 추출하여 local에 저장
const handleSubmit = async () => {
  if (!validateInput()) {
    return
  }
  try {
    const response = await axios.post(
      APIs.LOGIN,
      qs.stringify({
        username: userData.value.query, // spring security용 사용자 이름 (사용자 전화번호)
        password: userData.value.password, // spring security용 비밀번호
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // login, register는 urlencoded로 보냄
        },
        withCredentials: true, // 쿠키와 함께 요청
      },
    )

    const roleInDB = response.data.role
    console.log(
      `필요한 권한은(requiredRole) : ` +
        requiredRole +
        '입니다. 현재 사용자의 권한은(Role in DB) :' +
        roleInDB +
        '입니다.',
    )
    if (requiredRole === roleInDB) {
      // 응답에서 토큰 추출, 추출시에는 소문자로 추출함
      const newAccess = response.headers['authorization']?.replace('Bearer ', '')
      if (newAccess) {
        saveSessionData(sessionContext, {
          authToken: newAccess,
          telno: response.data.telno,
          role: response.data.role,
          username: response.data.username,
        })
      } else {
        message.value = '오류가 발생하였습니다. 관리자에게 문의하세요.(토큰 없음)'
        clearSessionByContext(sessionContext)
        return
      }
      emit('update-status', {
        isLoggedIn: true,
        hasSelectedMatch: false,
        username: response.data.username,
      })
      handleNavigate('selectVenue')
    } else {
      message.value = `현재 시스템에 권한이 없습니다. `
      clearSessionByContext(sessionContext)
      resetLoginStatus()
    }
  } catch (error) {
    handleError(error)
    resetLoginStatus()
  }
}

// 입력 값 유효성 검사
const validateInput = () => {
  if (!userData.value.query) {
    alert('전화번호를 입력해 주세요.')
    return false
  }
  if (!userData.value.query.trim()) {
    alert('전화번호를 입력해 주세요.')
    return false
  }
  if (!userData.value.password.trim()) {
    alert('비밀번호를 입력해 주세요.')
    return false
  }
  return true
}

// 세션 상태 초기화
const resetLoginStatus = () => {
  userData.value.query = localSessionData.telno
  userData.value.password = '...'
  emit('update-status', {
    isLoggedIn: false,
    hasSelectedMatch: false,
    username: ' ',
  })
}

// 로그인 된 상태
const setLoggedIn = () => {
  emit('update-status', {
    isLoggedIn: true,
    hasSelectedMatch: false,
    username: localSessionData.username,
  })
}

// 오류 메시지 출력
const handleError = (error) => {
  message.value = error.response
    ? error.response.data.message
    : error.request
      ? messageCommon.ERR_NETWORK
      : messageCommon.ERR_ETC
}

// 입력 변경 감지
const revalidateUser = () => {
  // 세션 데이터와 비교가 필요하면 여기에서 처리
}

//세션 데이터를 읽고 로그인 상태를 판단.
onMounted(async () => {
  sessionContext = getSessionContext()
  localSessionData = fetchSessionData(sessionContext, ['authToken', 'telno', 'username', 'venueCd'])
  if (localSessionData.telno) {
    userData.value.query = localSessionData.telno
    userData.value.password = ''
    if (localSessionData.authToken) {
      message.value = `${localSessionData.username}님은 로그인 되어 있습니다.`
      setLoggedIn()
    } else {
      resetLoginStatus()
      message.value = `토큰이 없습니다. 로그인 해주세요.`
    }
  } else {
    message.value = '로그인해 주세요.'
    resetLoginStatus()
  }
  isRootUser.value = false //모든 사용자 그룹이 회원가입 가능하도록
  // isRootUser.value = sessionContext === "admin"; // admin은 회원가입 메뉴 diable하고자 할 때
})
</script>

<style scoped>
.q-toolbar-title {
  flex-grow: 1;
}
</style>
