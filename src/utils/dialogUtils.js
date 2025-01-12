/**
 * showConfirmDialog
 * - 사용자에게 확인 및 취소 옵션을 제공하는 Quasar Dialog를 생성
 * - 기본적으로 확인 버튼, 취소 버튼, 메시지 및 제목이 포함된 대화 상자를 표시
 *
 */

import { Dialog } from 'quasar'

export const showConfirmDialog = ({
  title = '확인',
  message = '계속하시겠습니까?',
  okLabel = '예',
  cancelLabel = '아니오',
  persistent = true,
  onOk = () => {},
  onCancel = () => {},
}) => {
  // Dialog 생성
  Dialog.create({
    title: title,
    message: message,
    persistent: persistent,
    ok: { label: okLabel, color: 'primary' },
    cancel: { label: cancelLabel, color: 'negative' },
  })
    .onOk(() => {
      onOk()
    })
    .onCancel(() => {
      onCancel()
    })
}
