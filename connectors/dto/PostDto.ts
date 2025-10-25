
export interface Asset {
  type: 'image' | 'video';
  url: string;
  altText?: string;
}

export interface PostDto {
  text: string;
  assets?: Asset[];
  scheduledAt?: Date;
}
