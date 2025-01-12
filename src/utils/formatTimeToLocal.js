/**
 * formatTimeToLocal
 * - SQL 날짜 및 시간을 "ko-KR" 로컬 시간대로 변환하여 12시간 형식으로 출력
 * - 날짜와 시간이 없을 경우 빈 문자열 반환
 *
 * @param {string} sqlDatetime - SQL 형식의 날짜 및 시간 문자열
 * @returns {string} - 변환된 로컬 시간 문자열 (예: "2024.12.14 오전 10:30:15")
 */

export const formatTimeToLocal = (sqlDatetime) => {
  if (!sqlDatetime) {
    return "";
  }
  const date = new Date(sqlDatetime);

  // "ko-KR" 로컬 시간대와 12시간 형식을 사용하여 오전/오후로 표시
  const localTime = date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true, // 12시간 형식 사용
  });

  return localTime;
};
