import type { MailgunClientOptions as MGClientOptions, MailgunMessageData } from 'mailgun.js';

export interface IEmailResponse {
  id: string
  message: string
  status: number
}

export interface IEmailData {
  recipient: string
  guestName: string
  qrCode: string
}

export type MailgunClientOptions = MGClientOptions

export type EmailPayload = MailgunMessageData
