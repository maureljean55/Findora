import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import fr from './fr';

const i18n = new I18n({ fr });

i18n.locale = Localization.getLocales()[0]?.languageCode ?? 'fr';
i18n.enableFallback = true;
i18n.defaultLocale = 'fr';

export function t(key: string, options?: Record<string, unknown>): string {
  return i18n.t(key, options);
}

export default i18n;
