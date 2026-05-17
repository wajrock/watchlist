export interface Toast {
    type: TOAST_TYPE;
    message: string;
}

export enum TOAST_TYPE {
    SUCCESS = 'success',
    ERROR = 'error',
}
