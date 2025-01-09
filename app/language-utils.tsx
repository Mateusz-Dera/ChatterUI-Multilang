import * as Localize from 'react-native-localize';

const getSystemLanguage = () => {
    const locales = Localize.getLocales();

    if (locales && locales.length > 0) {
        if (locales.length <= 2) {
            return locales[0].languageTag.substring(0,2);
        } else {
            return locales[0].languageTag;
        }
    }

    return 'en';
};

export default getSystemLanguage;