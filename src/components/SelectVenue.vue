<template>
  <q-page>
    <q-card v-if="!venueArray || venueArray.length === 0">
      <br />
      <br />
      <q-banner>현재 경기장 정보가 없습니다.</q-banner>
      <br />
      <br />
    </q-card>

    <q-card v-if="venueArray && venueArray.length > 0" class="columnflex-container">
      <h6>경기장을 선택하세요.</h6>
      <q-list>
        <q-item v-for="(venue, index) in venueArray" :key="venue.venue_cd" class="q-mb-md">
          <q-card @click="handleSelectVenue(index)" class="full-width">
            <q-card-section>
              <div class="text-h6">{{ venue.venue_name }}</div>
            </q-card-section>
            <!-- q-img사용시 이미지가 안떠  img tag사용 -->
            <img
              :src="getImageUrl(venue.venue_img_file)"
              :alt="venue.venue_name"
              class="venue-image"
              @click="handleSelectVenue(index)"
              ratio="16/9"
            />
          </q-card>
        </q-item>
      </q-list>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axiosInstance from '../utils/axiosInterceptor'
import { navigate } from '../utils/navigate'
import { getSessionContext, saveSessionData } from '../utils/sessionFunctions'
import { Dialog } from 'quasar'
import { APIs } from '../utils/APIs'
import { messageCommon } from '../utils/messageCommon'

const router = useRouter()

// 세션 관련 변수
const sessionContext = getSessionContext()

// 입력 및 상태 관련 변수
const venueArray = ref([])
const selectedVenueCd = ref('')
const message = ref('')

// 서버에서 경기장 데이터를 가져오는 함수
const fetchVenues = async () => {
  try {
    const response = await axiosInstance.get(APIs.GET_ALL_VENUES)
    venueArray.value = response.data
  } catch (error) {
    handleError(error)
  }
}

// 이미지 URL 생성 함수
const getImageUrl = (fileName) => {
  const url = new URL(`../bidserver/src/main/resources/images/uploads/${fileName}`, import.meta.url)
    .href
  return url
}

// 경기장 선택 처리
const handleSelectVenue = (index) => {
  const venue = venueArray.value[index]
  selectedVenueCd.value = venue.venue_cd
  saveSessionData(sessionContext, {
    venueCd: selectedVenueCd.value,
  })
  navigate(router, sessionContext, 'manageVenue')
}

//axios에러 처리 루틴
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
    navigate(router, sessionContext, 'login')
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

// 컴포넌트가 마운트될 때 실행
onMounted(async () => {
  fetchVenues()
})
</script>

<style scoped>
.venue-image {
  display: block;
  width: 100%;
  height: auto;
}
</style>
