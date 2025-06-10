export const generatePaymentUUID = (): string => {
  const timestamp = Date.now();
  return `Payment - ${timestamp}`;
};
