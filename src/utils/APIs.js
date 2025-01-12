/**
 * Vue.js에서 사용되는 API 경로 설정 객체
 * - 각 API 엔드포인트를 관리하며, 요청을 보낼 때 해당 경로를 참조하여 사용
 */

import { reactive } from 'vue'

// 베이스 URL 설정
const baseURL = 'http://localhost:9001'

// API 경로 객체
export const APIs = reactive({
  LOGIN: `${baseURL}/login`, // 로그인
  LOGOUT: `${baseURL}/logout`, // 로그아웃
  REGISTER_USER: `${baseURL}/register`, // 사용자 등록
  PG_START: `${baseURL}/api/pgstart`, // 결제 시작
  PG_START_MOBILE: `${baseURL}/api/pgstart-mobile`, // 모바일 결제 시작

  SEND_ONE_SMS: `${baseURL}/api/sendsms/send-auth-code`, // 전화로 인증번호 전송
  VERIFY_CODE: `${baseURL}/api/sendsms/verify-code`, // 인증번호 검증
  SEND_KAKAO_ALIMTALK: `${baseURL}/api/sendkakao/send-kakao-message`, // 낙찰내용 알림톡 전송
  REISSUE_ACCESS_TOKEN: `${baseURL}/reissue-access-token`, // 만료된 액세스 토큰 재발급

  UPDATE_USER: `${baseURL}/api/user/update`, // 사용자 정보 수정
  GET_USER_WITH_PASSWORD: `${baseURL}/api/user/getinfo-byquery-and-password`, // 비밀번호 포함 사용자 정보 조회
  CHANGE_USER_PASSWORD: `${baseURL}/api/user/change-password`, // 비밀번호 변경
  GET_EMAIL_COUNT: `${baseURL}/api/user/get-email-count`, // 이메일 건수 조회(중복 확인용)
  GET_TELNO_COUNT: `${baseURL}/api/user/get-telno-count`, // 전화번호 건수 조회(중복 확인용)

  GET_SEATPRICES: `${baseURL}/api/seatprice/getall`, // 좌석 가격 조회
  UPDATE_SEATPRICEARRAY: `${baseURL}/api/seatprice/updatearray`, // 좌석 가격 배열 수정
  DELETE_SEATPRICEARRAY: `${baseURL}/api/seatprice/deletearray`, // 좌석 가격 배열 삭제

  GET_BIDS_BY_SEATARRAY: `${baseURL}/api/bid/get-by-seatarray`, // 좌석 배열별 입찰 조회
  GET_MY_BIDS: `${baseURL}/api/bid/get-mybids`, // 내 입찰 조회
  GET_MY_LASTBIDS: `${baseURL}/api/bid/get-mylastbids`, // 내 마지막 입찰 조회
  GET_BID_TALLIES: `${baseURL}/api/bid/get-bid-tallies`, // 좌석별 입찰자수, 최고액 등  조회
  GET_ALL_BIDS: `${baseURL}/api/bid/get-all-bids`, // 모든 입찰 내역 조회
  GET_HIGHEST_BIDS: `${baseURL}/api/bid/get-highest-bids`, // 좌석별 최고 입찰 내역 조회
  SUBMIT_BID: `${baseURL}/api/bid/submit`, // 입찰 제출
  SUBMIT_BATCH_BID: `${baseURL}/api/match/batch-bid-submit`, // 일괄 입찰 제출
  APPROVE_BATCH_BID: `${baseURL}/api/match/batch-bid-approve`, // 일괄 입찰 승인
  AWARD_BID: `${baseURL}/api/bid/award`, // 낙찰 처리

  GET_BID_STATUS: `${baseURL}/api/match/status`, // 경기 상태 조회
  GET_MATCH_BY_ID: `${baseURL}/api/match/getbyid`, // 경기 상태 조회
  GET_ALL_MATCHES: `${baseURL}/api/match/getall`, // 모든 경기 목록 조회
  GET_MY_MATCHES: `${baseURL}/api/match/getmy`, // 내가 등록한 경기 조회
  GET_ALL_APPROVED_MATCHES: `${baseURL}/api/match/getallapproved`, // 입찰이 가능한 승인된 모든 경기 조회(일반 사용자 용)
  ADD_MATCH: `${baseURL}/api/match/add`, // 경기 추가
  UPDATE_MATCH: `${baseURL}/api/match/update`, // 경기 수정
  APPROVE_MATCH: `${baseURL}/api/match/approve`, // 경기 승인
  DELETE_MATCH: `${baseURL}/api/match/delete`, // 경기 삭제

  UPLOAD_MATCHINFO: `${baseURL}/api/files/upload`, // 경기 첨부 정보 업로드
  DOWNLOAD_MATCHINFO: `${baseURL}/api/files/download`, // 경기 첨부 정보 다운로드
  DOWNLOAD_VENUE_IMAGE: `${baseURL}/api/files/download`, // 경기 첨부 정보 다운로드

  GET_ALL_VENUES: `${baseURL}/api/venue/getall`, // 모든 경기장 목록 조회
  ADD_VENUE: `${baseURL}/api/venue/add`, // 경기장 추가
  UPDATE_VENUE: `${baseURL}/api/venue/update`, // 경기장 수정
  DELETE_VENUE: `${baseURL}/api/venue/delete`, // 경기장 삭제
})
