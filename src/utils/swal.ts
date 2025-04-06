import Swal from 'sweetalert2'

export enum SwalIconType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  QUESTION = 'question'
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
  }
})

const ADUSwal = (params: { title: string; text: string; icon: SwalIconType; [key: string]: any }) => {
  return Swal.fire({
    ...params,
    theme: 'auto',
    color: '#a394ff',
    background: '#28243d',
    customClass: {
      popup: 'custom-popup-swal'
    }
  })
}

const ADUToast = (params: { title: string; text: string; icon: SwalIconType; [key: string]: any }) => {
  return Toast.fire({
    ...params,
    theme: 'auto',
    color: '#a394ff',
    background: '#28243d'
  })
}

export const swal = {
  info: (title: string, text: string, options: any = {}) => {
    return ADUSwal({ title, text, icon: SwalIconType.INFO, ...options })
  },

  success: (title: string, text: string, options: any = {}) => {
    return ADUSwal({
      title,
      text,
      icon: SwalIconType.SUCCESS,
      timer: 2000,
      showConfirmButton: false,
      ...options
    })
  },

  warning: (title: string, text: string, options: any = {}) => {
    return ADUSwal({
      title,
      text,
      icon: SwalIconType.WARNING,
      showCancelButton: true,
      confirmButtonColor: '#a394ff',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      ...options
    })
  },

  error: (title: string, text: string, options: any = {}) => {
    return ADUSwal({ title, text, icon: SwalIconType.ERROR, ...options })
  },

  question: (title: string, text: string, options: any = {}) => {
    return ADUSwal({
      title,
      text,
      icon: SwalIconType.QUESTION,
      showCancelButton: true,
      confirmButtonColor: '#a394ff',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      ...options
    })
  }
}

export const toast = {
  info: (title: string, text: string, options: any = {}) => {
    return ADUToast({ title, text, icon: SwalIconType.INFO, ...options })
  },

  success: (title: string, text: string, options: any = {}) => {
    return ADUToast({ title, text, icon: SwalIconType.SUCCESS, ...options })
  },

  warning: (title: string, text: string, options: any = {}) => {
    return ADUToast({ title, text, icon: SwalIconType.WARNING, ...options })
  },

  error: (title: string, text: string, options: any = {}) => {
    return ADUToast({ title, text, icon: SwalIconType.ERROR, ...options })
  }
}
