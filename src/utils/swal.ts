import Swal from 'sweetalert2'
import { SwalIconType } from '../types/enums'

export const ADUSwal = (params: { title: string; text: string; icon: SwalIconType; [key: string]: any }) => {
  return Swal.fire({
    ...params,
    theme: 'auto',
    color: '#a394ff',
    background: '#28243d',
    customClass: {
      popup: 'custom-popup-swal',
    },
  })
}

export const ADUToast = (params: { title: string; text: string; icon: SwalIconType; [key: string]: any }) => {
  return Toast.fire({
    ...params,
    theme: 'auto',
    color: '#a394ff',
    background: '#28243d',
  })
}

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer
    toast.onmouseleave = Swal.resumeTimer
  },
})
