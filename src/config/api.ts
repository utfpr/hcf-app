import { API_URL, IMAGE_BASE_URL, REPORT_BASE_URL, RECAPTCHA_SITE_KEY } from '@env';

export const apiUrl = API_URL || 'http://10.0.2.2:3000/api';
export const imageBaseUrl = IMAGE_BASE_URL || 'http://10.0.2.2:3000/fotos';
export const reportBaseUrl = REPORT_BASE_URL || 'http://10.0.2.2:3000/reports';
export const recaptchaKey = RECAPTCHA_SITE_KEY || '';
