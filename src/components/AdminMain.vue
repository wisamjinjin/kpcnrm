<template>
  <q-layout view="hHh lpR fFf" class="full-height">
    <q-header elevated>
      <q-toolbar>
        <!-- 햄버거 버튼 : tree menu의 open/close toggle용 -->
        <q-btn flat round dense icon="menu" @click="toggleDrawer" />
        <q-toolbar-title>
          선수 선발 및 훈련 관리 시스템
          <!-- 로그인된 경우 사용자 이름 표시 -->
          <span
            v-if="username && username.trim() !== ''"
            style="font-size: 14px; display: inline-block; margin-left: 8px"
            >- {{ username }}님</span
          >
        </q-toolbar-title>
        <q-btn-group spread>
          <q-btn flat round dense icon="home" @click="handleNavigate('home')" />
          <q-btn
            flat
            round
            dense
            label="로그인"
            v-if="!isLoggedIn"
            style="min-width: 80px; white-space: nowrap"
            @click="handleNavigate('login')"
          />
          <q-btn
            flat
            round
            dense
            label="로그아웃"
            icon="logout"
            style="min-width: 100px; white-space: nowrap"
            @click="handleNavigate('logout')"
            v-if="isLoggedIn"
          />
        </q-btn-group>
      </q-toolbar>
    </q-header>
    <q-banner></q-banner>
    <q-splitter v-model="splitterPosition" :limits="[10, 90]" vertical>
      <!-- 트리메뉴 컴포넌트 -->
      <template #before>
        <div class="full-height-tree" v-show="showTreeMenu">
          <TreeMenuAdmin
            :isLoggedIn="isLoggedIn"
            :hasSelectedMatch="hasSelectedMatch"
            :username="username"
            @link-action="handleNavigate"
          />
        </div>
      </template>
      <template #after>
        <q-page-container>
          <q-page>
            <!-- menu에서 선택한 router-view 표시 -->
            <router-view @update-status="handleUpdateStatus" />
          </q-page>
          <q-card-section v-if="message">
            <q-banner type="warning">{{ message }}</q-banner>
          </q-card-section>
        </q-page-container>
      </template>
    </q-splitter>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import { Dialog } from 'quasar'
import qs from 'qs'
import axios from 'axios' //로그아웃에서는 토큰 유효성 검사 및 재발급이 필요없으므로 axiosInterceptor를 사용하지 않음
import TreeMenuAdmin from './TreeMenuAdmin.vue' // 네비게이션 바 컴포넌트

import { navigate } from '../utils/navigate' // 페이지 이동 유틸리티 함수
import { APIs } from '../utils/APIs'
import {
  clearSessionByContext,
  fetchSessionData, //세션Context별로 저장된 local Storage data get
  saveSessionContext, //세션Context별로 local Storage에 data save
} from '../utils/sessionFunctions' // 세션 설정 유틸리티 함수
import { messageCommon } from '../utils/messageCommon'
const splitterPosition = ref(10) // 초기 수직 분할 위치 (%)

//vue-router 사용
const router = useRouter()

// sessionContext : navigation path & localStorate prefix 등에 사용함.
const sessionContext = 'kpcnrm'

// 로컬 세션 데이터 (Access Token, 사용자 이름, 전화번호, role, 세션에서 선택한 경기장, 경기번호를 저장)
let localSessionData = ''

// 상태 관리 - 메뉴 버튼 활성화 관리 용
const message = ref('')
const isLoggedIn = ref(false) // 로그인 상태 여부
const hasSelectedMatch = ref(false) // 경기 선택 여부
const username = ref('') //로그인 사용자 이름
const showTreeMenu = ref(true) // 사이드 메뉴 열림 및 닫힘 flag

// tree 메뉴를 show toggle
const toggleDrawer = () => {
  showTreeMenu.value = !showTreeMenu.value
}

// router-view에서 상태가 변경되었을때 업데이트 함수 (e.g. 로그인 실행, 경기 선택 등)
const handleUpdateStatus = (status) => {
  isLoggedIn.value = status.isLoggedIn // 로그인 상태 업데이트
  hasSelectedMatch.value = status.hasSelectedMatch // 경기 선택 상태 업데이트
  username.value = status.username //Tool바에 로그인 사용자 이름 업데이트
}

// 로그인 상태 초기화 (로그아웃 상태)
const resetLoginStatus = () => {
  isLoggedIn.value = false
  hasSelectedMatch.value = false
  username.value = ''
}

// 로그인 상태로 설정
const setLoggedIn = () => {
  isLoggedIn.value = true
  hasSelectedMatch.value = false
  username.value = localSessionData.username
}

// 로그아웃 처리 함수
const handleLogout = async () => {
  try {
    const response = await axios.post(
      APIs.LOGOUT,
      qs.stringify({
        username: '', // Spring Security용 사용자 이름 (전화번호, logout에서는 null로 전달)
        password: '', // Spring Security용 비밀번호 (logout에서는 null로 전달)
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // 요청 데이터 형식 지정
        },
        withCredentials: true, // 쿠키와 함께 요청 전송
      },
    )
    console.log('logout response :', response.data)
  } catch (error) {
    handleError(error)
  }
  clearSessionByContext(sessionContext)
  resetLoginStatus()
  Dialog.create({
    title: '알림',
    message: '로그아웃 되었습니다.',
    ok: {
      label: '확인',
      color: 'primary',
    },
    persistent: true,
  })
  handleNavigate('home')
}

//logout클릭시에는 logout수행하고(세션 데이터 삭제 등) 나머지는 이동
const handleNavigate = async (action) => {
  if (action === 'logout') {
    await handleLogout()
  } else {
    navigate(router, sessionContext, action)
  }
}

//axios error처리
const handleError = (error) => {
  if (error.response) {
    message.value = error.response.data.message
  } else if (error.request) {
    message.value = messageCommon.ERR_NETWORK
  } else {
    message.value = messageCommon.ERR_ETC
  }
}

//이후 사용할 sessionContext를 저장한다.
onBeforeMount(() => {
  saveSessionContext(sessionContext)
})

//sessionContext에 해당되는 세션데이터가 있는 경우 메뉴를 로그인 상태로 활성화, 세션 데이터가 없으면 홈화면 그대로.
onMounted(() => {
  localSessionData = fetchSessionData(sessionContext, ['authToken', 'telno', 'username', 'venueCd'])
  if (localSessionData.authToken) {
    setLoggedIn()
  } else {
    resetLoginStatus()
  }
  handleNavigate('home')
})
</script>
.full-height { height: 100%; width: 100%; } .full-height-tree { height: 100%; overflow: auto; /*
트리 메뉴가 길 경우 스크롤 허용 */ }
<style scoped></style>
