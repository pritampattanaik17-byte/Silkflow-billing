import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Define translations
const resources = {
  en: {
    translation: {
      dashboard: "Dashboard",
      invoices: "Invoices",
      returns: "Returns",
      customers: "Customers",
      products: "Products",
      purchases: "Purchases",
      settings: "Settings",
      search_placeholder: "Search invoices, customers...",
      profile: "Profile",
      sign_out: "Sign out",
      user_account: "Account",
      employees: "Employees",
      reports: "Reports & Analytics"
    }
  },
  hi: {
    translation: {
      dashboard: "डैशबोर्ड",
      invoices: "चालान",
      returns: "वापसी",
      customers: "ग्राहक",
      products: "उत्पाद",
      purchases: "खरीददारी",
      settings: "सेटिंग्स",
      search_placeholder: "चालान, ग्राहक खोजें...",
      profile: "प्रोफ़ाइल",
      sign_out: "साइन आउट",
      user_account: "खाता",
      employees: "कर्मचारी",
      reports: "रिपोर्ट और एनालिटिक्स"
    }
  },
  or: {
    translation: {
      dashboard: "ଡ୍ୟାସବୋର୍ଡ",
      invoices: "ଚାଲାଣ",
      returns: "ଫେରସ୍ତ",
      customers: "ଗ୍ରାହକ",
      products: "ଉତ୍ପାଦ",
      purchases: "କିଣାକିଣି",
      settings: "ସେଟିଂସ",
      search_placeholder: "ଚାଲାଣ, ଗ୍ରାହକ ଖୋଜନ୍ତୁ...",
      profile: "ପ୍ରୋଫାଇଲ୍",
      sign_out: "ସାଇନ୍ ଆଉଟ୍",
      user_account: "ଖାତା",
      employees: "କର୍ମଚାରୀ",
      reports: "ରିପୋର୍ଟ ଏବଂ ଆନାଲିଟିକ୍ସ"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('vastraflow_lang') || 'en', // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

// Save language change to localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('vastraflow_lang', lng);
});

export default i18n;
