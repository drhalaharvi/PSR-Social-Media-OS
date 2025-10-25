
import { BaseConnector } from './BaseConnector';
import { FacebookConnector } from './adapters/FacebookConnector';
import { GoogleBusinessProfileConnector } from './adapters/GoogleBusinessProfileConnector';
import { InstagramConnector } from './adapters/InstagramConnector';
import { LinkedInConnector } from './adapters/LinkedInConnector';
import { WatiConnector } from './adapters/WatiConnector';
import { XConnector } from './adapters/XConnector';
import { YouTubeConnector } from './adapters/YouTubeConnector';

export type ProviderType = 'facebook' | 'instagram' | 'linkedin' | 'x' | 'youtube' | 'google_business_profile' | 'wati';

/**
 * Factory for creating connector instances based on provider type.
 */
export class ConnectorFactory {
  public static createConnector(provider: ProviderType): BaseConnector {
    switch (provider) {
      case 'facebook':
        return new FacebookConnector();
      case 'instagram':
        return new InstagramConnector();
      case 'linkedin':
        return new LinkedInConnector();
      case 'x':
        return new XConnector();
      case 'youtube':
        return new YouTubeConnector();
      case 'google_business_profile':
        return new GoogleBusinessProfileConnector();
      case 'wati':
        return new WatiConnector();
      default:
        throw new Error(`Provider '${provider}' is not supported.`);
    }
  }
}
