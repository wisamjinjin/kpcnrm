<template>
  <!-- 트리 메뉴 -->
  <q-tree
    :nodes="menuTree"
    node-key="id"
    @update:selected="handleTreeClick"
    selected="selectedNode"
    v-model:expanded="expandedNodes"
    :expandable="true"
    style="min-width: 200px; max-width: 600px"
  >
  </q-tree>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'

const props = defineProps({
  isLoggedIn: {
    type: Boolean,
    required: true,
  },
  hasSelectedMatch: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['link-action'])
const isUnmounted = ref(false) // 언마운트 상태를 추적
const expandedNodes = ref([]) // 확장된 노드 상태를 관리, 기본 icon으로 tree를 expand/close할 수 있으나, 하위노드가 있는 메뉴이름 자체를 click해도 expand/close되게 관리

// 컴포넌트가 unMount되었는지 확인
onMounted(() => {
  isUnmounted.value = false // 마운트 시 초기화
})

// 메뉴 트리 데이터: 각 노드는 id, label, 하위 노드(children)로 구성
// 로그인 상태에 따라 disabled 여부를 설정
// id는 routes.js의 이름을 기술함.
const menuTree = ref([
  {
    id: 'selectionAndAthleteManagement',
    label: '선발 및 선수 관리',
    children: [
      // { id: 'selectionAnnouncement', label: '선발공고', disabled: !props.isLoggedIn },
      { id: 'manageVenue', label: '선발공고', disabled: !props.isLoggedIn },
      // { id: 'selectionAnnouncementDetails', label: '선발공고 상세', disabled: !props.isLoggedIn },
      { id: 'manageVenueAgGrid', label: '선발공고 상세', disabled: !props.isLoggedIn },
      {
        id: 'nationalTeamApplicants',
        label: '국가대표 선발 신청자 명단 조회',
        disabled: !props.isLoggedIn,
      },
      {
        id: 'nationalTeamApplicantsDetails',
        label: '국가대표 선발 신청자 명단 상세',
        disabled: !props.isLoggedIn,
      },
      {
        id: 'nationalTeamApplicationStatus',
        label: '국가대표 선발 신청 현황',
        disabled: !props.isLoggedIn,
      },
      { id: 'selectionResults', label: '선발전 결과', disabled: !props.isLoggedIn },
      { id: 'selectionResultsDetails', label: '선발전 결과 상세', disabled: !props.isLoggedIn },
      { id: 'evaluationOfSelection', label: '선수/지도자 선발 평가', disabled: !props.isLoggedIn },
      {
        id: 'evaluationOfSelectionDetails',
        label: '선수/지도자 선발 평가 상세',
        disabled: !props.isLoggedIn,
      },
      {
        id: 'affiliateSportsCommittee',
        label: '가맹단체 전문체육위원회',
        disabled: !props.isLoggedIn,
      },
      {
        id: 'finalSelectionStatus',
        label: '최종 선수/지도자선발 현황',
        disabled: !props.isLoggedIn,
      },
      {
        id: 'nationalTeamPerformanceRanking',
        label: '국가대표 선수성적 및 국제랭킹',
        disabled: !props.isLoggedIn,
      },
      {
        id: 'nationalTeamPerformanceRankingDetails',
        label: '국가대표 선수성적 및 국제랭킹 상세',
        disabled: !props.isLoggedIn,
      },
      { id: 'excellentAthleteEvaluation', label: '우수선수 평가', disabled: !props.isLoggedIn },
      {
        id: 'excellentAthleteEvaluationDetails',
        label: '우수선수 평가 상세',
        disabled: !props.isLoggedIn,
      },
      {
        id: 'finalExcellentAthletesStatus',
        label: '최종 우수선수 현황 조회',
        disabled: !props.isLoggedIn,
      },
    ],
  },
  {
    id: 'traningManagement',
    label: '훈련 관리',
    children: [
      { id: 'trainingPlanStatus', label: '훈련계획서 등록현황', disabled: !props.isLoggedIn },
      { id: 'trainingPlanDetails', label: '훈련계획서 등록현황 상세', disabled: !props.isLoggedIn },
      { id: 'trainingReportStatus', label: '훈련보고서 등록현황', disabled: !props.isLoggedIn },
      {
        id: 'trainingReportDetails',
        label: '훈련보고서 등록현황 상세',
        disabled: !props.isLoggedIn,
      },
      { id: 'trainingResults', label: '트레이닝 결과 현황', disabled: !props.isLoggedIn },
      {
        id: 'trainingResultsDetails',
        label: '트레이닝 결과 현황 상세',
        disabled: !props.isLoggedIn,
      },
      { id: 'externalTrainingStatus', label: '촌외 훈련신청 현황', disabled: !props.isLoggedIn },
      {
        id: 'externalTrainingDetails',
        label: '촌외 훈련신청 현황 상세',
        disabled: !props.isLoggedIn,
      },
      {
        id: 'externalTrainingApproval',
        label: '촌외 훈련신청 승인대상',
        disabled: !props.isLoggedIn,
      },
      {
        id: 'externalTrainingApprovalDetails',
        label: '촌외 훈련신청 승인대상 상세',
        disabled: !props.isLoggedIn,
      },
      { id: 'externalTrainingOngoing', label: '촌외 훈련 현황', disabled: !props.isLoggedIn },
    ],
  },
  {
    id: 'statisticsManagement',
    label: '통계 관리',
    children: [
      { id: 'applicationBySport', label: '종목별 신청 통계', disabled: !props.isLoggedIn },
      { id: 'applicationByRegion', label: '지역별 신청 통계', disabled: !props.isLoggedIn },
      {
        id: 'applicationByDisabilityType',
        label: '장애유형별 신청 통계',
        disabled: !props.isLoggedIn,
      },
      { id: 'trainingInVillage', label: '촌내 훈련 통계', disabled: !props.isLoggedIn },
      { id: 'trainingOutOfVillage', label: '촌외 훈련 통계', disabled: !props.isLoggedIn },
      { id: 'trainingBySport', label: '종목별 훈련 통계', disabled: !props.isLoggedIn },
    ],
  },
  {
    id: 'userManagement',
    label: '사용자 관리',
    children: [
      { id: 'updateUser', label: '사용자 정보 수정', disabled: !props.isLoggedIn },
      { id: 'changePassword', label: '비밀번호 변경 및 재설정', disabled: !props.isLoggedIn },
      { id: 'registerUser', label: '사용자 등록', disabled: false },
    ],
  },
])

// 로그인 상태 변화에 따라 메뉴 항목의 활성화 상태를 업데이트
// 'registerUser' 메뉴는 항상 활성화됨.
const updateMenuTree = () => {
  menuTree.value.forEach((node) => {
    if (node.children) {
      node.children.forEach((child) => {
        // 사용자 등록 메뉴는 항상 활성화
        if (child.id === 'registerUser') {
          child.disabled = false
        } else {
          child.disabled = !props.isLoggedIn // 로그인 상태에 따라 disabled 설정
        }
      })
    }
  })
}

// 트리 메뉴 클릭 이벤트 핸들러
// 1. 하위 노드가 있는 경우: 해당 노드를 확장 또는 축소
// 2. 하위 노드가 없는 경우: 메뉴 액션 실행
const handleTreeClick = (selectedNode) => {
  // 선택된 노드가 배열인지 확인 (다중 선택 가능성)
  const nodeId = Array.isArray(selectedNode) ? selectedNode[0] : selectedNode

  // 노드 검색 (최상위 노드인지 확인하기 위해)
  const findNodeById = (nodes, id) => {
    for (const node of nodes) {
      if (node.id === id) {
        return node
      }
      if (node.children) {
        const found = findNodeById(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  const clickedNode = findNodeById(menuTree.value, nodeId)

  if (clickedNode && clickedNode.children) {
    // 최상위 노드이거나 하위 노드가 있는 경우 -> 왼쪽 메뉴 토글 동작
    const isExpanded = expandedNodes.value.includes(nodeId)
    if (isExpanded) {
      // 이미 열려 있다면 닫음
      expandedNodes.value = expandedNodes.value.filter((id) => id !== nodeId)
    } else {
      // 닫혀 있다면 열음
      expandedNodes.value.push(nodeId)
    }
  } else {
    // 하위 노드가 없는 경우 -> handleClickAction 실행
    handleClickAction(nodeId)
  }
}

// 선택된 메뉴 액션을 실행
// 컴포넌트가 언마운트된 상태에서는 동작하지 않음.
const handleClickAction = async (action) => {
  if (isUnmounted.value) {
    console.log('컴포넌트가 언마운트되어 액션이 실행되지 않습니다.')
    return // 언마운트 상태 확인
  }
  emit('link-action', action)
}

// 로그인 상태 변화 감지
// props.isLoggedIn이 변경되면 메뉴 트리 상태를 업데이트
watch(
  () => props.isLoggedIn,
  () => {
    updateMenuTree()
  },
  { immediate: true },
)
</script>

<style scoped></style>
