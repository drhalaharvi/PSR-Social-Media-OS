
import { BaseConnector } from '../BaseConnector';
import { CommentDto } from '../dto/CommentDto';
import { InsightsDto } from '../dto/InsightsDto';
import { PostDto } from '../dto/PostDto';

// Helper function for UUID generation (browser-compatible)
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export class InstagramConnector extends BaseConnector {
  constructor() {
    super('Instagram');
  }

  async fetchInsights(since: Date, until: Date): Promise<InsightsDto> {
    console.log(`[${this.provider}] Fetching insights from ${since.toISOString()} to ${until.toISOString()}`);
    await this.handleRateLimit();
    return { impressions: 25000, reach: 20000, engagement: 1500, followers: 10000, period: { since, until } };
  }

  async createPost(post: PostDto): Promise<{ id: string; }> {
    console.log(`[${this.provider}] Creating post:`, post);
    await this.handleRateLimit();
    return { id: `ig_post_${generateUUID()}` };
  }

  async listComments(postId: string): Promise<CommentDto[]> {
    console.log(`[${this.provider}] Listing comments for post ${postId}`);
    await this.handleRateLimit();
    return [{
      id: `ig_comment_${generateUUID()}`,
      postId,
      author: { id: 'user456', name: 'InstaUser' },
      text: 'Love this!',
      timestamp: new Date(),
      likes: 50,
    }];
  }

  async replyToComment(commentId: string, text: string): Promise<{ id: string; }> {
    console.log(`[${this.provider}] Replying to comment ${commentId} with: "${text}"`);
    await this.handleRateLimit();
    return { id: `ig_reply_${generateUUID()}` };
  }
}
