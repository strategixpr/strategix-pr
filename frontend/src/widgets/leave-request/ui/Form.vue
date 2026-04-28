<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import ButtonWithIcon from '@/shared/ui/button-with-icon';
  import index from '@/content/pages/index.json'
  import {
    postLeaveRequest,
    type LeaveRequestField,
    type LeaveRequestPayload,
    type LeaveRequestResponse,
    type RequestError,
  } from '@/shared/api';
  import { resolveMediaSrc } from '@/shared/lib/media/resolveMediaSrc'
  import {
    validateLeaveRequestValues,
    type LeaveRequestFormValues,
    type LeaveRequestValidationErrors,
  } from '@/widgets/leave-request/model/validation';

  const { locale } = useI18n()
  const { app } = useRuntimeConfig()
  const baseURL = app?.baseURL ?? '/'
  const currentLocale = locale.value || 'example'
  const translations = index.translations[currentLocale as keyof typeof index.translations] || index.translations.example
  const rpcUrls = translations.leave_request.form.rpc_urls || [];

  const formData = translations.leave_request.form
  const agreeData = formData?.agree || {}
  const resolvedAgreePdfHref = computed(() => {
    const rawHref = (agreeData.href_pdf || '').trim()
    if (!rawHref || rawHref === '#') return '#'
    return resolveMediaSrc(rawHref, baseURL)
  })

  const formValues = ref<LeaveRequestFormValues>({
    name: '',
    phone: '',
    question: '',
    question2: '',
  })

  const errors = ref<LeaveRequestValidationErrors>({})
  const submitError = ref('')
  const submitSuccess = ref(false)
  const isSubmitting = ref(false)
  const activeRpcDomain = ref('')
  const hasRequiredErrors = computed(() => Boolean(errors.value.name || errors.value.phone))
  const hasSubmitError = computed(() => Boolean(submitError.value))
  let errorResetTimeout: ReturnType<typeof setTimeout> | null = null
  let successResetTimeout: ReturnType<typeof setTimeout> | null = null

  const submitLabel = computed(() => {
    if (hasSubmitError.value) return submitError.value
    return hasRequiredErrors.value ? formData.not_filled_error : formData.button
  })

  const submitClass = computed(() => ({
    'submit--alert': hasRequiredErrors.value || hasSubmitError.value,
    'submit--loading': isSubmitting.value,
  }))
  const hasQuestionField = computed(() => (formData?.question ?? '') !== '')
  const hasQuestion2Field = computed(() => (formData?.question2 ?? '') !== '')
  const sendingErrorLabel = computed(() => formData.sending_error)
  const deliveryChannels = ['email', 'telegram']

  const getErrorStatusCode = (error: unknown) => {
    if (!(error instanceof Error)) return ''

    const statusCode = (error as RequestError).statusCode
    if (typeof statusCode === 'number' && Number.isInteger(statusCode) && statusCode > 0) {
      return String(statusCode)
    }

    return ''
  }

  const resolveSubmitErrorMessage = (error: unknown) => {
    const statusCode = getErrorStatusCode(error)
    if (statusCode) {
      return `${sendingErrorLabel.value} - ${statusCode}`
    }

    if (!(error instanceof Error)) return sendingErrorLabel.value

    const message = error.message.trim()
    if (!message) return sendingErrorLabel.value

    if (message.startsWith('{') && message.endsWith('}')) {
      try {
        const parsed = JSON.parse(message) as { error?: unknown }
        if (typeof parsed.error === 'string' && parsed.error.trim()) {
          return parsed.error.trim()
        }
      } catch {
        // ignore JSON parse errors and use the raw message fallback below
      }
    }

    if (message === 'Failed to fetch') {
      return sendingErrorLabel.value
    }

    return sendingErrorLabel.value
  }

  const getRpcDomain = (rpcUrl: string) => {
    const normalizedUrl = rpcUrl.trim()
    if (!normalizedUrl) return ''

    const extractDisplayDomain = (hostname: string) => {
      const normalizedHost = hostname.replace(/\.$/, '').toLowerCase()
      if (!normalizedHost) return ''

      if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(normalizedHost) || normalizedHost.includes(':')) {
        return normalizedHost
      }

      const labels = normalizedHost.split('.').filter(Boolean)
      if (labels.length <= 1) return labels[0] ?? normalizedHost

      const secondLevelMarkers = new Set(['co', 'com', 'net', 'org', 'gov', 'edu', 'ac'])
      const lastLabel = labels.at(-1) ?? ''
      const secondLastLabel = labels.at(-2) ?? ''
      const thirdLastLabel = labels.at(-3) ?? ''

      if (labels.length >= 3 && lastLabel.length === 2 && secondLevelMarkers.has(secondLastLabel)) {
        return thirdLastLabel || secondLastLabel || lastLabel || normalizedHost
      }

      return secondLastLabel || lastLabel || normalizedHost
    }

    try {
      const parsedUrl = normalizedUrl.includes('://') ? normalizedUrl : `https://${normalizedUrl}`
      return extractDisplayDomain(new URL(parsedUrl).hostname)
    } catch {
      const hostWithPathStripped = normalizedUrl
        .replace(/^[a-z]+:\/\//i, '')
        .split('/')[0]
      const fallbackHost = (hostWithPathStripped ?? '').split(':')[0] ?? ''

      return extractDisplayDomain(fallbackHost || normalizedUrl)
    }
  }

  const sendLeaveRequestWithFallback = (
    urls: string[],
    requestFields: LeaveRequestField[],
    initialChannels: string[],
    onAttemptStart: (rpcUrl: string) => void,
  ) => {
    let pendingChannels = [...initialChannels]
    let lastError: unknown = null
    let lastResponse: LeaveRequestResponse | null = null

    const trySend = (index: number): Promise<LeaveRequestResponse> => {
      if (!pendingChannels.length && lastResponse) {
        return Promise.resolve(lastResponse)
      }

      if (index >= urls.length) {
        if (lastError instanceof Error) {
          return Promise.reject(lastError)
        }

        if (lastResponse?.error) {
          return Promise.reject(new Error(lastResponse.error))
        }

        return Promise.reject(new Error('Request failed'))
      }

      const rpcUrl = urls[index]
      if (!rpcUrl) {
        return trySend(index + 1)
      }
      onAttemptStart(rpcUrl)

      const requestItems: LeaveRequestPayload = [
        ...requestFields,
        ...pendingChannels,
      ]

      return postLeaveRequest(rpcUrl, requestItems)
        .then((response) => {
          lastResponse = response
          pendingChannels = pendingChannels.filter((channel) => response[channel] !== true)

          if (!pendingChannels.length) {
            return response
          }

          lastError = null
          return trySend(index + 1)
        })
        .catch((error) => {
          lastError = error
          return trySend(index + 1)
        })
    }

    return trySend(0).then((response) => {
      const allChannelsDelivered = initialChannels.every((channel) => response[channel] === true)
      if (allChannelsDelivered) {
        return response
      }

      if (lastError instanceof Error) {
        return Promise.reject(lastError)
      }

      if (response.error) {
        return Promise.reject(new Error(response.error))
      }

      return Promise.reject(new Error('Request failed'))
    })
  }

  const clearValidationState = () => {
    if (!errors.value.name && !errors.value.phone && !submitError.value && !submitSuccess.value) return
    errors.value = {}
    submitError.value = ''
    submitSuccess.value = false
    if (errorResetTimeout) {
      clearTimeout(errorResetTimeout)
      errorResetTimeout = null
    }
    if (successResetTimeout) {
      clearTimeout(successResetTimeout)
      successResetTimeout = null
    }
  }

  const handleSubmit = () => {
    if (isSubmitting.value) return

    activeRpcDomain.value = ''
    submitError.value = ''
    if (errorResetTimeout) {
      clearTimeout(errorResetTimeout)
      errorResetTimeout = null
    }
    submitSuccess.value = false
    if (successResetTimeout) {
      clearTimeout(successResetTimeout)
      successResetTimeout = null
    }

    const valuesForSubmit: LeaveRequestFormValues = {
      ...formValues.value,
      question: hasQuestionField.value ? formValues.value.question : '',
      question2: hasQuestion2Field.value ? formValues.value.question2 : '',
    }

    const { isValid, errors: validationErrors, normalized } = validateLeaveRequestValues(valuesForSubmit)
    errors.value = validationErrors

    if (!isValid) return

    isSubmitting.value = true
    const requestFields: LeaveRequestField[] = [
      {
        text: formData?.name ?? '',
        response: normalized.name,
      },
      {
        text: formData?.phone ?? '',
        response: normalized.phone,
      },
    ]

    if (hasQuestionField.value) {
      requestFields.push({
        text: formData?.question ?? '',
        response: normalized.question,
      })
    }

    if (hasQuestion2Field.value) {
      requestFields.push({
        text: formData?.question2 ?? '',
        response: normalized.question2,
      })
    }

    const channelsToSend = deliveryChannels.filter((channel) => channel.trim() !== '')

    if (!channelsToSend.length) {
      submitError.value = sendingErrorLabel.value
      errorResetTimeout = setTimeout(() => {
        submitError.value = ''
        errorResetTimeout = null
      }, 5000)
      isSubmitting.value = false
      return
    }

    const availableRpcUrls = rpcUrls
      .map((url) => (typeof url === 'string' ? url.trim() : ''))
      .filter((url) => url !== '')

    if (!availableRpcUrls.length) {
      submitError.value = 'RPC URL is not configured'
      errorResetTimeout = setTimeout(() => {
        submitError.value = ''
        errorResetTimeout = null
      }, 5000)
      isSubmitting.value = false
      return
    }

    sendLeaveRequestWithFallback(
      availableRpcUrls,
      requestFields,
      channelsToSend,
      (rpcUrl) => {
        activeRpcDomain.value = getRpcDomain(rpcUrl)
      },
    )
      .then(() => {
        submitSuccess.value = true
        if (successResetTimeout) {
          clearTimeout(successResetTimeout)
        }
        successResetTimeout = setTimeout(() => {
          submitSuccess.value = false
          successResetTimeout = null
        }, 5000)
        formValues.value = {
          name: '',
          phone: '',
          question: '',
          question2: '',
        }
        errors.value = {}
      })
      .catch((error) => {
        submitError.value = resolveSubmitErrorMessage(error)
        if (errorResetTimeout) {
          clearTimeout(errorResetTimeout)
        }
        errorResetTimeout = setTimeout(() => {
          submitError.value = ''
          errorResetTimeout = null
        }, 5000)
      })
      .finally(() => {
        isSubmitting.value = false
        activeRpcDomain.value = ''
      })
  }
</script>

<template>
  <form
    id="#data-collection-form"
    class="form"
    @submit.prevent="handleSubmit"
  >
    <div class="lr-form">
      <label
        class="base-text title"
        for="leave-request-phone"
      >
        {{ formData.title }}
      </label>
      <input
        v-model="formValues.name"
        class="base-text field"
        type="text"
        :placeholder="`${formData.name} *`"
        :class="{ 'field--error': errors.name }"
        :aria-invalid="Boolean(errors.name)"
        name="name"
        @input="clearValidationState"
      >
      <input
        id="leave-request-phone"
        v-model="formValues.phone"
        class="base-text field"
        type="tel"
        :placeholder="`${formData.phone} *`"
        :class="{ 'field--error': errors.phone }"
        :aria-invalid="Boolean(errors.phone)"
        name="phone"
        @input="clearValidationState"
      >

      <label
        class="base-text title"
        for="leave-request-question2"
      >
        {{ formData.title2 }}
      </label>
      <input
        v-if="hasQuestionField"
        v-model="formValues.question"
        class="base-text field"
        type="text"
        :placeholder="formData.question"
        name="question"
        @input="clearValidationState"
      >
      <textarea
        v-if="hasQuestion2Field"
        id="leave-request-question2"
        v-model="formValues.question2"
        class="base-text field textarea"
        :placeholder="formData.question2"
        name="question2"
        @input="clearValidationState"
      />

      <div class="form-row">
        <ButtonWithIcon
          style-button="white"
          class="submit"
          :class="submitClass"
          href="#"
          :aria-disabled="isSubmitting"
          :aria-busy="isSubmitting"
          @click.prevent="handleSubmit"
        >
          <span
            v-if="isSubmitting"
            class="submit-loader-domain"
            aria-live="polite"
          >
            {{ activeRpcDomain }}
          </span>
          <span
            v-else-if="submitSuccess"
            class="submit-check"
          >
            ✓
          </span>
          <span
            v-else
            class="submit-text"
          >
            {{ submitLabel }}
          </span>
        </ButtonWithIcon>
        <p class="base-text agree">
          {{ agreeData.text }} <a
            :href="resolvedAgreePdfHref"
            target="_blank"
            rel="noopener"
            class="hover"
          >{{ agreeData.link }}</a>
        </p>
      </div>
    </div>
  </form>
</template>

<style scoped>
.form{
  width: 100%;
  height: calc(var(--vh) * 76);
  padding: 0 var(--padding-section-x);
  box-sizing: border-box;

  background-color: var(--strategix-accent);

  @media(--tablet-width){
    width: 50%;
    height: 100%;
    padding: 0 var(--padding-section-x) 0 0;
  }
/* 
  @media(--mobile-medium){
    width: 100%;
    height: calc(var(--vh) * 76);
    padding: 0 var(--padding-section-x);
  } */
}

.lr-form {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: calc(var(--vh) * 3) 0;
  box-sizing: border-box; 

  display: flex;
  flex-direction: column;
  gap: 2.5%;

  color: var(--strategix-dark);
  background-color: var(--strategix-accent);

  @media(--tablet-width){
    padding: calc(var(--vh) * 4.25) 0 0 min(108px, 4.5vw);
    gap: 1.6%;
  }
}

.title {
  margin: 0;

  font-size: min(25px, 6.4vw);
  font-weight: 500;     
  line-height: 110%;  
  letter-spacing: 0;
  text-align: left;
  text-transform: none;

  color: var(--strategix-dark);

  @media(--tablet-width){
    font-size: clamp(25px, calc(1.166vw + var(--vh) * 1.3), 52px);
    padding: calc(var(--vh) * 1.5) 0 0 0;
  }

  @media(--mobile-medium) {
    font-size: min(25px, calc(var(--vh) * 5));
  }
}

.field {
  width: 100%;
  padding: min(15px, calc(var(--vh) * 1.95)) min(15px, 3.85vw);
  box-sizing: border-box;
  border-radius: var(--card-radius);
  border: 1px solid var(--strategix-dark);
  background: var(--strategix-accent);
  
  font-size: min(18px, 4.65vw);
  font-weight: 400;
  outline: none;
  text-align: left;
  color: var(--strategix-dark);

  @media(--tablet-width){
    padding: min(16px, calc(var(--vh) * 1.2)) min(40px, 1.8vw);
    font-size: clamp(18px, calc(1.1vw + var(--vh) * 0.6), 42px);
  }

  @media(--mobile-medium) {
    font-size: min(18px, calc(var(--vh) * 3.75));
  }
}

.field--error {
  border-color: #c63737;
}

.field::placeholder{
  color: var(--strategix-dark);
  opacity: 0.8;
}

:deep(.field:-webkit-autofill),
:deep(.field:-webkit-autofill:hover),
:deep(.field:-webkit-autofill:focus),
:deep(.field:-webkit-autofill:active) {
  -webkit-text-fill-color: var(--strategix-dark);
  -webkit-box-shadow: 0 0 0 1000px var(--strategix-accent) inset;
  box-shadow: 0 0 0 1000px var(--strategix-accent) inset;
  transition: background-color 9999s ease-in-out 0s;
}

.textarea {
  min-height: 21%;
  resize: vertical; 
  color: var(--strategix-dark);

  @media(--tablet-width){
    height: 12%;
  }
}

.form-row {
  margin: 1% 0 0;
  
  display: flex;
  flex-direction: column;
  
  gap: 4%;

  @media(--tablet-width){
    margin: 3.5% 0 0;
    flex-direction: row;
    align-items: center;
  }
}

.submit{
  @media(--tablet-width){
    min-width: 36%;
    width: fit-content;
  }
}

.submit.submit--alert {
  color: #c63737;
}

.submit.submit--alert:hover {
  color: #c63737;
}

.submit.submit--loading {
  pointer-events: none;
  cursor: progress;
}

.submit-text {
  display: inline-flex;
  align-items: center;
}

.submit-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1em;
  font-weight: 600;
  color: #1f8a4c;
}

.submit-loader-domain {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1em;
  max-width: min(46vw, 280px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  animation: submit-domain-pulse 1.1s ease-in-out infinite;
}

@keyframes submit-domain-pulse {
  0%,
  100% {
    opacity: 0.45;
  }
  50% {
    opacity: 1;
  }
}

.agree {
  width: 80%;
  margin: calc(var(--vh) * 1.6) 0;

  font-size: min(15px, 3.85vw); 
  font-weight: 400;
  text-align: left;

  color: black; 

  @media(--tablet-width){
    min-width: 20%;
    width: fit-content;
    max-width: 40%;
    margin: 0;

    font-size: clamp(8px, calc(0.567vw + var(--vh) * 0.2), 16px);
  }

  @media(--mobile-medium) {
    font-size: min(8px, calc(var(--vh) * 2));
  }
}

.agree a { 
  color: white; 
  text-decoration: underline;
}

</style>
