export enum PaymentStatus {
  //common
  COMPLETED = 'completed',
  PENDING = 'pending',
  CANCELED = 'cancelled',

  //only khalti
  INITIATED = 'initiated',
  REFUNDED = 'refunded',
  EXPIRED = 'expired',

  //only esewa
  FULL_REFUND = 'full-refund',
  PARTIAL_REFUND = 'partial-refund',
  AMBIGUOUS = 'ambiguous',
  NOT_FOUND = 'not-found',
}
