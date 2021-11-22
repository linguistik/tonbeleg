import { createI18n } from 'vue-i18n';

/** Specify default language
 * 1. Read from user settings (MISSING! Feature)
 * 2. Use the browser's language setting
 * 3. Select a hardcoded default language (e.g. 'en')
 */
const defaultLocale = navigator.language || 'en';

/** Register standard messages */
export default createI18n({
  locale: defaultLocale,
  messages: {
    'de-DE': require('./de.json'),
    'de': require('./de.json'),
    'de-DE': require('./de.json'),
    'en': require('./en.json'),
    'en-GB': require('./en.json'),
    'en-US': require('./en.json'),
  }
})