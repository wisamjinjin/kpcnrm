<template>
  <q-page class="common-container">
    <q-card class="q-pa-md q-mb-lg" flat bordered>
      <q-card-section>
        <q-card v-if="!venueArray || venueArray.length === 0">
          <br />
          <br />
          <br />
          <q-banner>현재 경기장 정보가 없습니다.</q-banner>
          <br />
          <br />
          <br />
        </q-card>
        <q-card v-else>
          <!-- Ag-Grid 사용 -->
          <ag-grid-vue
            class="ag-theme-alpine"
            :rowData="venueArray"
            :columnDefs="columnDefs"
            :gridOptions="gridOptions"
            style="width: 100%; height: 350px"
            @grid-ready="onGridReady"
            @rowClicked="onRowClick"
            @cellClicked="onCellClicked"
          ></ag-grid-vue>
        </q-card>
        <!-- 신규 경기장 추가 -->
        <q-btn
          @click="openDialog('insert')"
          label="신규 경기장 추가"
          color="primary"
          class="q-mt-md"
        />&nbsp;&nbsp;
        <q-btn
          @click="handleSaveToExcel"
          label="Excel로 저장"
          class="q-mt-md"
          color="secondary"
        />&nbsp;&nbsp;
        <q-btn @click="handleSaveToPdf" label="PDF로 저장" class="q-mt-md" color="secondary" />
      </q-card-section>
    </q-card>
    <q-banner v-if="message" type="info" class="q-mt-md">{{ message }}</q-banner>
    <!-- 다이얼로그 컴포넌트는 기존 로직 유지 -->
    <q-dialog v-model="dialogVisible" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            {{ dialogTitle }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-form>
            <q-input
              v-model="venueData.venueCd"
              label="경기장 코드(숫자 3자리)"
              :disable="dialogMode !== 'insert'"
              maxlength="3"
              class="q-mb-md"
            />
            <q-input
              v-model="venueData.venueName"
              label="경기장 이름"
              :disable="dialogMode === 'delete'"
              class="q-mb-md"
            />
            <q-input
              v-model="venueData.venuePlaceInfo"
              label="경기장 위치 정보"
              :disable="dialogMode === 'delete'"
              class="q-mb-md"
            />
            <q-input
              v-model="venueData.venueGeneralInfo"
              label="경기장 일반 정보"
              :disable="dialogMode === 'delete'"
              class="q-mb-md"
            />
            <!-- 업로드 파일 선택을 위해 input tag사용함 -->
            <div class="columnflex-container" v-if="dialogMode !== 'delete'">
              <p>업로드 파일 선택</p>
              <input id="fileInput" type="file" @change="onFileSelected" class="col-12 col-md-6" />
            </div>
            <q-input
              v-model="venueData.venueImageFileName"
              label="화일명"
              :disable="dialogMode === 'delete'"
              class="q-mb-md"
            />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="취소" color="negative" @click="closeDialog" />&nbsp;&nbsp;
          <q-btn flat label="확인" color="primary" @click="handleDialogSubmit" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axiosInstance from '../utils/axiosInterceptor'
import { Dialog } from 'quasar'
import { AgGridVue } from 'ag-grid-vue3'
import 'ag-grid-community/styles/ag-grid.css' // ag-grid 기본 스타일
import 'ag-grid-community/styles/ag-theme-alpine.css' // ag-grid 테마
// import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import batangFont from '../assets/fonts/Batang-01.ttf'
import { APIs } from '../utils/APIs'
import { getSessionContext } from '../utils/sessionFunctions'
import { messageCommon } from '../utils/messageCommon'
import { navigate } from '../utils/navigate'

const router = useRouter()

//세션 관련 변수
const sessionContext = getSessionContext()

//ag gid데이터터
const gridApi = ref(null)

// 입력 및 상태 관련 변수
const message = ref('')
const dialogVisible = ref(false)
const dialogMode = ref('') // "insert", "update", "delete"
let newFileSelected = false //새로운 upload화일 선택 여부
let oldFileName = '' //화일size초과 등 화일upload실패시 새로선택한 화일명 대신 기존 파일이름을 유지하는 용도.

//경기장 데이터 배열
const venueArray = ref([])

//선택된 데이터
const venueData = ref({
  venueCd: '',
  venueName: '',
  venuePlaceInfo: '',
  venueGeneralInfo: '',
  venueImage: '',
  venueImageFileName: '',
})

// Ag-Grid 컬럼 정의
const columnDefs = [
  { headerName: '경기장 코드', field: 'venue_cd', sortable: true, filter: true },
  { headerName: '경기장 이름', field: 'venue_name', sortable: true, filter: true },
  { headerName: '위치 정보', field: 'venue_place_info', sortable: true, filter: true },
  { headerName: '일반 정보', field: 'venue_general_info', sortable: true, filter: true },
  { headerName: '첨부 화일 정보', field: 'venue_img_file', sortable: true, filter: true },
  {
    headerName: '첨부',
    field: 'download',
    cellRenderer: (params) =>
      `<button class="btn-download" data-id="${params.data.venue_cd}">보기</button>`,
    flex: 1,
    sortable: false,
  },
  {
    headerName: '수정',
    field: 'edit',
    cellRenderer: (params) =>
      `<button class="btn-edit" data-id="${params.data.venue_cd}">수정</button>`,
    flex: 1,
    sortable: false,
  },
  {
    headerName: '삭제',
    field: 'delete',
    cellRenderer: (params) =>
      `<button class="btn-delete" data-id="${params.data.venue_cd}">삭제</button>`,
    flex: 1,
    sortable: false,
  },
]

// ag-grid 옵션
const gridOptions = {
  defaultColDef: {
    resizable: true, // 열 크기 조정 가능
  },
  pagination: true, // 페이지네이션 활성화
  paginationPageSize: 10, // 페이지당 행 수
  paginationPageSizeSelector: [10, 20, 50, 100],
  rowHeight: 40, // 행 높이 설정
  selection: {
    mode: 'single', // 행 선택 모드 (single 또는 multiple)
  },
}

// Ag-Grid 초기화
const onGridReady = (params) => {
  gridApi.value = params.api
  params.api.sizeColumnsToFit()
}

//Dialog 타이틀
const dialogTitle = computed(() => {
  switch (dialogMode.value) {
    case 'insert':
      return `경기장 추가`
    case 'update':
      return '경기장 수정'
    case 'delete':
      return '경기장 삭제'
    default:
      return ''
  }
})

// 다이얼로그 열기
const openDialog = (mode, row = null) => {
  dialogMode.value = mode
  dialogVisible.value = true

  if (mode === 'update' || mode === 'delete') {
    setNewVenueData(row)
  } else {
    resetForm()
  }
}

// 다이얼로그 닫기
const closeDialog = () => {
  dialogVisible.value = false
  resetForm()
}

// 행 클릭 이벤트 - 현재 action은 없고 console에 logging만
const onRowClick = (event) => {
  console.log('Row clicked:', event.data)
}

// 버튼 클릭 이벤트 처리(첨부보기, 수정, 삭제)
const onCellClicked = (params) => {
  const target = params.event.target // 클릭한 요소

  if (target.classList.contains('btn-edit')) {
    openDialog('update', params.data) // 수정 모드
  } else if (target.classList.contains('btn-delete')) {
    openDialog('delete', params.data) // 삭제 모드
  } else if (target.classList.contains('btn-download')) {
    downloadFile(params.data) // 다운로드
  }
}

// 다이얼로그 확인 버튼 처리
const handleDialogSubmit = async () => {
  //입력,수정인 경우에는 입력값 validate
  if (dialogMode.value !== 'delete' && !validateInput()) return

  // 새로운 이미지 화일이 선택된 경우 upload
  if ((dialogMode.value === 'insert' || dialogMode.value === 'update') && newFileSelected) {
    await uploadFile()
    newFileSelected = false
  }

  try {
    let response
    if (dialogMode.value === 'insert') {
      response = await axiosInstance.post(APIs.ADD_VENUE, venueData.value)
    } else if (dialogMode.value === 'update') {
      response = await axiosInstance.post(APIs.UPDATE_VENUE, venueData.value)
    } else if (dialogMode.value === 'delete') {
      // 데이터 삭제 로직
      response = await axiosInstance.post(APIs.DELETE_VENUE, venueData.value)
    }
    message.value = response.data.message
    fetchVenues()
    closeDialog()
  } catch (error) {
    closeDialog()
    handleError(error)
  }
}

//화일 다운로드
const downloadFile = async (venue) => {
  const fileName = venue.venue_img_file
  if (!fileName) {
    message.value = '첨부화일이 없습니다.'
    return
  }
  try {
    const response = await axiosInstance.get(APIs.DOWNLOAD_VENUE_IMAGE, {
      params: { fileName },
      responseType: 'blob', // 파일 데이터(이진 데이터) 응답
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    handleError(error)
  }
}

// 화일 upload
const uploadFile = async () => {
  const formData = new FormData()

  // FormData에 파일 추가 (세 번째 인수로 파일명을 지정)
  formData.append('file', venueData.value.file, venueData.value.venueImageFileName)

  try {
    // 서버로 파일 업로드
    await axiosInstance.post(APIs.UPLOAD_MATCHINFO, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // 파일 업로드에 적합한 헤더 설정
      },
    })
    Dialog.create({
      title: '알림',
      message: `첨부화일이 업로드되었습니다.`,
      ok: {
        label: '확인',
        color: 'primary',
      },
      persistent: true,
    })
  } catch (error) {
    const errorMessage = error.response.data.message
    Dialog.create({
      title: '알림',
      message: errorMessage,
      ok: {
        label: '확인',
        color: 'primary',
      },
      persistent: true,
    })
    venueData.value.venueImageFileName = oldFileName //오류가 발생하면 새로 선택한 파일명을 update하지 않는다.
    console.error('file upload error : ', error)
  }
}

// csv로 저장하는 함수
const handleSaveToExcel = () => {
  gridApi.value.exportDataAsCsv({
    fileName: 'data.csv', // 저장할 파일 이름
    columnSeparator: ',', // CSV 구분자
  })
}

// PDF로 저장하는 함수
const handleSaveToPdf = async () => {
  try {
    // Base64로 폰트 파일을 로드하고 인코딩
    const encodeFontToBase64 = async (fontPath) => {
      const response = await fetch(fontPath)
      const fontData = await response.arrayBuffer()
      return btoa(
        new Uint8Array(fontData).reduce((data, byte) => data + String.fromCharCode(byte), ''),
      )
    }

    // TTF 파일 경로를 Base64로 인코딩
    const batangFontBase64 = await encodeFontToBase64('/src/assets/fonts/Batang-01.ttf')

    console.log('batangFont 데이터 크기:', batangFontBase64 ? batangFontBase64.length : '로드 실패')

    // jsPDF 인스턴스 생성
    const doc = new jsPDF()

    // 사용자 정의 폰트 추가
    doc.addFileToVFS('Batang-01.ttf', batangFont)
    doc.addFont('Batang-01.ttf', 'Batang', 'normal')
    doc.setFont('Batang')

    // PDF 제목
    doc.text('경기장 정보', 10, 10)

    // 테이블 컬럼명
    const tableColumns = ['경기장 코드', '경기장 명', '위치 정보', '일반 정보', '첨부화일']

    //테이블 행 데이터 준비
    const tableRows =
      venueArray.value && venueArray.value.length > 0
        ? venueArray.value.map((row) => [
            row.venue_cd || 'N/A',
            row.venue_name || 'N/A',
            row.venue_place_info || 'N/A',
            row.venue_general_info || 'N/A',
            row.venue_img_file || 'N/A',
          ])
        : [['데이터 없음', '', '', '']]

    // 테이블 생성
    doc.autoTable({
      head: [tableColumns],
      body: tableRows,
      startY: 20,
      theme: 'striped',
      styles: { font: 'batangFontBase64', fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [100, 100, 255] },
      alternateRowStyles: { fillColor: [240, 240, 240] },
    })

    // PDF 저장
    doc.save('경기장_정보.pdf')
  } catch (error) {
    console.error('Error generating PDF:', error)
  }
}

// 경기장 데이터 전체 가져오기
const fetchVenues = async () => {
  try {
    const response = await axiosInstance.get(APIs.GET_ALL_VENUES)
    if (response.status === 200) {
      venueArray.value = response.data
    }
  } catch (error) {
    handleError(error)
  }
}

//파일 선택후 파일명을 검증하고 newFileSelected flag set
const onFileSelected = (event) => {
  const file = event.target.files ? event.target.files[0] : null

  if (file.name === venueData.value.venueImageFileName) {
    alert('새로운 Upload화일은 기존 화일명과 달라야 합니다.')
    // fileInput.value = ''
    venueData.value.venueImageFileName = ''
    newFileSelected = false
    return
  }
  if (file) {
    newFileSelected = true
    venueData.value.file = file
    venueData.value.venueImageFileName = file.name
  }
}

// API 호출 후 error처리 로직
const handleError = (error) => {
  if (error.response?.status === 403 || error.response?.status === 401) {
    //refresh expired인 경우 401발생
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
      console.log('오류 발생 내용 :', error.response.data)
      message.value = error.response.data.message
    } else if (error.request) {
      message.value = messageCommon.ERR_NETWORK
    } else {
      message.value = messageCommon.ERR_ETC
    }
  }
}

// Diaglog에 데이터 설정
const setNewVenueData = (venue) => {
  venueData.value = {
    venueCd: venue.venue_cd,
    venueName: venue.venue_name,
    venuePlaceInfo: venue.venue_place_info,
    venueGeneralInfo: venue.venue_general_info,
    venueImageFileName: venue.venue_img_file,
  }
  oldFileName = venue.venue_img_file
}

// 입력값 검증
const validateInput = () => {
  const { venueCd, venueName } = venueData.value
  const codePattern = /^\d{3}$/ // 정규식: 세 자리 숫자
  if (!venueCd || !codePattern.test(venueCd)) {
    alert('경기장코드는 세 자리 숫자로 입력해 주세요.')
    return false
  }
  if (!venueName) {
    alert('경기장명을 입력해 주세요.')
    return false
  }
  return true
}

// 입력 폼 초기화
const resetForm = () => {
  venueData.value = {
    venueCd: '',
    venueName: '',
    venuePlaceInfo: '',
    venueGeneralInfo: '',
    venueImageFileName: '',
  }
}

// 초기 데이터 로드
onMounted(() => {
  fetchVenues()
})
</script>

<style scoped>
.ag-grid-table {
  max-width: 100%;
  height: 100%;
  overflow: auto; /* 스크롤 가능 */
  background: linear-gradient(white, #eaeaea); /* 배경색 그라데이션 */
}
.btn-container {
  display: flex; /* Flexbox 사용 */
  align-items: center; /* 수직 가운데 정렬 */
  justify-content: start; /* 필요에 따라 start, center, or end */
  gap: 8px; /* 버튼 사이 간격 */
  height: 100%; /* 부모 요소의 높이에 맞춤 */
}
</style>
