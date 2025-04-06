import Swal, { SweetAlertIcon, SweetAlertOptions } from 'sweetalert2'
import { THEME } from '../config/constants'
import { AlertIconType } from '../types/enums'
import { AlertOptions } from '../types/index'

const BASE_ALERT_CONFIG = {
  theme: 'auto',
  color: THEME.primary,
  background: THEME.background,
  customClass: {
    popup: 'custom-popup-swal'
  }
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
  ...(BASE_ALERT_CONFIG as SweetAlertOptions)
})

const createAlert = (params: { title: string; text: string; icon: AlertIconType } & AlertOptions) => {
  return Swal.fire({
    ...params,
    icon: params.icon as SweetAlertIcon,
    ...(BASE_ALERT_CONFIG as SweetAlertOptions)
  })
}

const createToast = (params: { title: string; text: string; icon: AlertIconType } & AlertOptions) => {
  return Toast.fire({
    ...params,
    icon: params.icon as SweetAlertIcon
  })
}

export const alert = {
  /**
   * Show an information alert
   */
  info: (title: string, text: string, options: AlertOptions = {}) => {
    return createAlert({ title, text, icon: AlertIconType.INFO, ...options })
  },

  /**
   * Show a success alert (auto-closes after 2 seconds by default)
   */
  success: (title: string, text: string, options: AlertOptions = {}) => {
    return createAlert({
      title,
      text,
      icon: AlertIconType.SUCCESS,
      timer: 2000,
      showConfirmButton: false,
      ...options
    })
  },

  /**
   * Show a warning alert with Yes/Cancel buttons
   */
  warning: (title: string, text: string, options: AlertOptions = {}) => {
    return createAlert({
      title,
      text,
      icon: AlertIconType.WARNING,
      showCancelButton: true,
      confirmButtonColor: THEME.primary,
      cancelButtonColor: THEME.error,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      ...options
    })
  },

  /**
   * Show an error alert
   */
  error: (title: string, text: string, options: AlertOptions = {}) => {
    return createAlert({ title, text, icon: AlertIconType.ERROR, ...options })
  },

  /**
   * Show a question alert with Yes/Cancel buttons
   */
  question: (title: string, text: string, options: AlertOptions = {}) => {
    return createAlert({
      title,
      text,
      icon: AlertIconType.QUESTION,
      showCancelButton: true,
      confirmButtonColor: THEME.primary,
      cancelButtonColor: THEME.error,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      ...options
    })
  }
}

export const toast = {
  /**
   * Show an information toast notification
   */
  info: (title: string, text: string, options: AlertOptions = {}) => {
    return createToast({ title, text, icon: AlertIconType.INFO, ...options })
  },

  /**
   * Show a success toast notification
   */
  success: (title: string, text: string, options: AlertOptions = {}) => {
    return createToast({ title, text, icon: AlertIconType.SUCCESS, ...options })
  },

  /**
   * Show a warning toast notification
   */
  warning: (title: string, text: string, options: AlertOptions = {}) => {
    return createToast({ title, text, icon: AlertIconType.WARNING, ...options })
  },

  /**
   * Show an error toast notification
   */
  error: (title: string, text: string, options: AlertOptions = {}) => {
    return createToast({ title, text, icon: AlertIconType.ERROR, ...options })
  }
}

// For backward compatibility with existing code
export const swal = alert
