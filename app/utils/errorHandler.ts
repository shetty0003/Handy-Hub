// app/utils/errorHandler.ts
// Re-exports the shared error handler so the helpers under app/utils can import it locally.
export { handleError, AuthErrorHandler } from '../../utils/errorHandler';
export type { HandledError } from '../../utils/errorHandler';