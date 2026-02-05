import { Injectable } from '@nestjs/common';
import 'dotenv/config';
import { ConfigService } from '@nestjs/config';
import {
  IAttachment,
  IDownloadAsBase64Result,
  IEmailOptions,
} from 'src/common/utils/interfaces';
import { SendMailClient } from 'zeptomail';
import * as request from 'request';
import * as mime from 'mime-types';

@Injectable()
export class NotificationService {
  constructor(private readonly configService: ConfigService) {}

  async sendMail(data: IEmailOptions) {
    return new Promise(async (resolve, reject) => {
      try {
        const {
          recipient,
          subject,
          attachments = [],
          allow_to_reply = false,
          reply_to_email = null,
          template_id,
          template_variables = {},
          cc = null,
          bcc = null,
          send_attachment = true,
        } = data;

        const mailSender = new SendMailClient({
          url: this.configService.get('ZEPTOMAIL_API_BASE_URL')!,
          token: this.configService.get('ZEPTOMAIL_API_TOKEN')!,
        });

        const sender = {
          address: this.configService.get('ZEPTOMAIL_MAIL_FROM_ADDRESS'),
          name: this.configService.get('ZEPTOMAIL_MAIL_FROM_NAME'),
        };
        const receiver = [
          {
            email_address: {
              address: recipient,
            },
          },
        ];
        const _attachments = [];
        if (attachments && attachments.length > 0) {
          for (let i = 0; i < attachments.length; i += 1) {
            const attachmentData = await this.getFileAndFileNameForZepto(
              attachments[i],
            );
            _attachments.push({
              name: attachmentData.file_name,
              content: attachmentData.data,
              mime_type: attachmentData.mime_type,
            });
          }
        }

        let message = {
          from: sender,
          to: receiver,
          subject,
          template_key: template_id,
          merge_info: template_variables,
        } as any;

        // add attachment if it is allowed and available
        if (send_attachment && _attachments.length > 0) {
          message = { ...message, attachments: _attachments };
        }

        // add replyTo if it is allowed
        if (allow_to_reply) {
          message = { ...message, reply_to: reply_to_email };
        }

        // add cc if it is allowed
        if (cc) {
          const cc_emails = cc.map((email) => {
            return { email_address: { address: email } };
          });
          message = { ...message, cc: cc_emails };
        }

        // add bcc if it is allowed
        if (bcc) {
          const bcc_emails = bcc.map((email) => {
            return { email_address: { address: email } };
          });
          message = { ...message, bcc: bcc_emails };
        }

        await mailSender.sendMail(message);
        console.log(`Successfully sent email to ${recipient}`);
        resolve({ done: true });
      } catch (error) {
        if (
          error.toString().indexOf('parameter is not a valid address') !== -1
        ) {
          resolve({
            done: true,
          });
        }

        reject(error);
      }
    });
  }

  async downloadAsBase64(url: string): Promise<IDownloadAsBase64Result> {
    return new Promise((resolve, reject) => {
      request({ url, encoding: null }, (err, response, body) => {
        if (err) {
          reject(err);
          return;
        }
        const base_64_data = body.toString('base64');
        const mime_type = response.headers['content-type'] || mime.lookup(url);
        resolve({ base_64_data, mime_type });
      });
    });
  }

  async getFileAndFileNameForZepto(attachment: IAttachment) {
    const download_result = await this.downloadAsBase64(attachment.file_url);
    const data = download_result.base_64_data;
    const mime_type = download_result.mime_type;
    const file_name = attachment.file_name;
    return { data, file_name, mime_type };
  }
}
