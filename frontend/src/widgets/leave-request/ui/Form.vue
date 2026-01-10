<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import ButtonWithIcon from '@/shared/ui/button-with-icon';
  import index from '@/content/pages/index.json'
  import { postLeaveRequest } from '@/shared/api';
  import {
    validateLeaveRequestValues,
    type LeaveRequestFormValues,
    type LeaveRequestValidationErrors,
  } from '@/widgets/leave-request/model/validation';

  const { locale } = useI18n()
  const currentLocale = locale.value || 'example'
  const translations = index.translations[currentLocale as keyof typeof index.translations] || index.translations.example

  const formData = translations.leave_request.form
  const agreeData = formData?.agree || {}

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
  const hasRequiredErrors = computed(() => Boolean(errors.value.name || errors.value.phone))
  const hasSubmitError = computed(() => Boolean(submitError.value))
  let errorResetTimeout: ReturnType<typeof setTimeout> | null = null
  let successResetTimeout: ReturnType<typeof setTimeout> | null = null

  const submitLabel = computed(() => {
    if (hasSubmitError.value) return submitError.value
    return hasRequiredErrors.value ? 'ЗАПОЛНИТЕ' : formData.button
  })

  const submitClass = computed(() => ({
    'submit--alert': hasRequiredErrors.value || hasSubmitError.value,
    'submit--loading': isSubmitting.value,
  }))

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

  const handleSubmit = async () => {
    if (isSubmitting.value) return

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

    const { isValid, errors: validationErrors, normalized } = validateLeaveRequestValues(formValues.value)
    errors.value = validationErrors

    if (!isValid) return

    isSubmitting.value = true
    try {
      const response = await postLeaveRequest({
        endpoint: '/contact',
        name: {
          text: formData?.name ?? '',
          response: normalized.name,
        },
        phone: {
          text: formData?.phone ?? '',
          response: normalized.phone,
        },
        question: {
          text: formData?.question ?? '',
          response: normalized.question,
        },
        question2: {
          text: formData?.question2 ?? '',
          response: normalized.question2,
        },
      })
      if (!response?.['send-data']) {
        throw new Error(response?.error || 'Request failed')
      }
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
    } catch (error) {
      submitError.value = error instanceof Error ? error.message : 'Request failed'
      if (errorResetTimeout) {
        clearTimeout(errorResetTimeout)
      }
      errorResetTimeout = setTimeout(() => {
        submitError.value = ''
        errorResetTimeout = null
      }, 5000)
    } finally {
      isSubmitting.value = false
    }
  }
</script>

<template>
  <form
    id="#data-collection-form"
    class="form"
    @submit.prevent="handleSubmit"
  >
    <div class="lr-form">
      <h4 class="base-text title">
        {{ formData.title }}
      </h4>
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
        v-model="formValues.phone"
        class="base-text field"
        type="tel"
        :placeholder="`${formData.phone} *`"
        :class="{ 'field--error': errors.phone }"
        :aria-invalid="Boolean(errors.phone)"
        name="phone"
        @input="clearValidationState"
      >

      <h4 class="base-text title">
        {{ formData.title2 }}
      </h4>
      <input
        v-model="formValues.question"
        class="base-text field"
        type="text"
        :placeholder="formData.question"
        name="question"
        @input="clearValidationState"
      >
      <textarea
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
            class="submit-loader"
            aria-hidden="true"
          >
            <span class="submit-loader-dot" />
            <span class="submit-loader-dot" />
            <span class="submit-loader-dot" />
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
            :href="agreeData.href_pdf || '#'"
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

.submit-loader {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 1em;
}

.submit-loader-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  animation: submit-bounce 0.9s infinite ease-in-out;
}

.submit-loader-dot:nth-child(2) {
  animation-delay: 0.15s;
}

.submit-loader-dot:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes submit-bounce {
  0%,
  80%,
  100% {
    transform: scale(0.4);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
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
