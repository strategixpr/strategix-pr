export type LeaveRequestFormValues = {
  name: string;
  phone: string;
  question: string;
  question2: string;
};

export type LeaveRequestFormValuesInput = Partial<LeaveRequestFormValues>;
export type LeaveRequestValidationErrors = Partial<Record<keyof LeaveRequestFormValues, string>>;

const normalizeText = (value?: string) => (value ?? '').trim();

const normalizePhone = (value?: string) =>
  (value ?? '')
    .replace(/[^\d+]/g, '')
    .trim();

export const normalizeLeaveRequestValues = (
  values: LeaveRequestFormValuesInput,
): LeaveRequestFormValues => ({
  name: normalizeText(values.name),
  phone: normalizePhone(values.phone),
  question: normalizeText(values.question),
  question2: normalizeText(values.question2),
});

export const validateLeaveRequestValues = (values: LeaveRequestFormValuesInput) => {
  const normalized = normalizeLeaveRequestValues(values);
  const errors: LeaveRequestValidationErrors = {};

  if (!normalized.name) {
    errors.name = 'Name is required';
  }

  if (!normalized.phone) {
    errors.phone = 'Phone is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalized,
  };
};
