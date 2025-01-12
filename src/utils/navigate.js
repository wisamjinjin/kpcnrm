/**
 * navigate
 * - 사용자 동작(routeName)과 세션 컨텍스트(sessionContext)에 따라 URL을 결정하고 해당 URL로 라우팅
 * - URL이 유효하지 않거나 에러 발생 시 경고 또는 에러를 로깅
 *
 * @param {string} sessionContext - 세션 컨텍스트 (예: "user", "admin" 여기서는 "kpcnrm" 하나만 사용하므로 sessionContext는 사용하지 않음)
 * @param {string} routeName - 수행하려는 동작 (예: "login", "logout", "navigateToDashboard")
 * @param {Object} [query=null] - 라우팅 시 전달할 쿼리 매개변수
 */

export const navigate = (router, sessionContext, routeName, query = null) => {
  try {
    router.push({ name: routeName, ...(query && { query }) })
  } catch (err) {
    alert('라우팅 오류 : ' + err.message)
  }
}
