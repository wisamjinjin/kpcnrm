const routes = [
  // {
  //   path: '/',
  //   component: () => import('layouts/MainLayout.vue'),   //quasar 설치 확인용
  //   children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  // },

  {
    path: '/',
    component: () => import('components/AdminMain.vue'), // 관리자 기본 레이아웃
    children: [
      {
        name: 'home',
        path: '/',
        component: () => import('components/AdminHome.vue'),
      }, // 홈 이미지지
      {
        name: 'login',
        path: 'login',
        component: () => import('components/UserLogin.vue'),
      }, // 로그인
      {
        name: 'registerUser',
        path: 'registerUser',
        component: () => import('components/RegisterUser.vue'),
      }, // 사용자 등록
      {
        name: 'updateUser',
        path: 'updateUser',
        component: () => import('components/UpdateUser.vue'),
      }, // 사용자 정보 수정
      {
        name: 'changePassword',
        path: 'changepassword',
        component: () => import('components/ChangeUserPassword.vue'),
      }, // 비밀번호 변경
      {
        name: 'selectVenue',
        path: 'selectvenue',
        component: () => import('components/SelectVenue.vue'),
      }, // 경기장 선택

      {
        name: 'manageVenue',
        path: 'managevenue',
        component: () => import('components/ManageVenue.vue'),
      }, // 경기장 관리
      {
        name: 'manageVenueAgGrid',
        path: 'managevenueaggrid',
        component: () => import('components/ManageVenueAgGrid.vue'),
      }, // 경기장 관리(AgGrid이용)
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
