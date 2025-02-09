import type { MailgunClientOptions as MGClientOptions, MailgunMessageData } from 'mailgun.js';

export interface EmailResponse {
  id: string
  message: string
  status: number
}

export type MailgunClientOptions = MGClientOptions

export type EmailPayload = MailgunMessageData

