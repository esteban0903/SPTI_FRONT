// blueprintsService.js
// Selects between the in-memory apimock and the real apiclient based on VITE_USE_MOCK

import apimock from './apimock.js'
import apiClientWrapper from './apiClientWrapper.js'

const raw = import.meta.env.VITE_USE_MOCK
const useMock = raw === 'true' || raw === true || raw === undefined

const service = useMock ? apimock : apiClientWrapper

export default service
