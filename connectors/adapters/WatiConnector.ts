
import { BaseConnector } from '../BaseConnector';
// WATI is for messaging, so most BaseConnector methods are not applicable.

export class WatiConnector extends BaseConnector {
  constructor() {
    super('WATI (WhatsApp)');
  }

  // These methods from the base class don't apply to a WhatsApp API
  async fetchInsights(): Promise<any> {
    console.warn(`[${this.provider}] fetchInsights is not applicable.`);
    return {};
  }
  async createPost(): Promise<any> {
    console.warn(`[${this.provider}] createPost is not applicable.`);
    return {};
  }
  async listComments(): Promise<any[]> {
    console.warn(`[${this.provider}] listComments is not applicable.`);
    return [];
  }
  async replyToComment(): Promise<any> {
    console.warn(`[${this.provider}] replyToComment is not applicable.`);
    return {};
  }

  // Example of a WATI-specific method
  async sendMessage(to: string, message: string): Promise<{ id: string }> {
    console.log(`[${this.provider}] Sending message to ${to}: "${message}"`);
    await this.handleRateLimit();
    return { id: `wati_msg_${crypto.randomUUID()}` };
  }
}
