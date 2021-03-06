import Vue from 'vue'
import App from './App.vue'

import i18next from 'i18next'
import Locize from 'i18next-locize-backend'
import locizeEditor from 'locize-editor'
import VueI18Next from '@panter/vue-i18next'

import localeResources from '../locales'
import vuetify from './plugins/vuetify'

Vue.use(VueI18Next)

window.localeResources = localeResources

const store = {
  state: {
    gender: 'female',
    language: navigator.language,
    catCount: 0,
    resources: localeResources,
    // True if language has been manually selected.
    // False e.g. when language is detected from navigator.language.
    manuallySelectedLanguage: false,
    messageLog: {
      messageList: []
    }
  },
  overrideUILanguageTo(languageCode) {
    store.state.manuallySelectedLanguage = true
    i18next.changeLanguage(languageCode)
  },
  enableAutomaticUILanguage() {
    store.state.manuallySelectedLanguage = false
    i18next.changeLanguage(navigator.language)
  },
  addLogMessage(messageId, parameters = {}) {
    store.state.messageLog.messageList.push({
      time: new Date(),
      messageId,
      parameters
    })
  }
}

const MyStorePlugin = {
  install(Vue) {
    Object.defineProperty(Vue.prototype, '$store', {
      get() {
        return store
      }
    })
  }
}
Vue.use(MyStorePlugin)

const USE_TRANSLATIONS_FROM_LOCIZE = true

i18next
  .use(Locize)
  .use(locizeEditor)
  .init({
    debug: true,
    lng: store.state.language,
    resources: USE_TRANSLATIONS_FROM_LOCIZE ? null : localeResources,
    fallbackLng: 'en',

    // For setting environment variables, see:
    // https://cli.vuejs.org/guide/mode-and-env.html#environment-variables
    backend: {
      referenceLng: 'en',
      projectId: process.env.VUE_APP_LOCIZE_PROJECT_ID,
      apiKey: process.env.VUE_APP_LOCIZE_API_KEY
    },

    editor: {
      enabled: USE_TRANSLATIONS_FROM_LOCIZE,
      onEditorSaved: function(lng, ns) {
        i18next.reloadResources(lng, ns)
      }
    }
  })

i18next.on('languageChanged', function(lng) {
  store.state.language = lng
})

const i18n = new VueI18Next(i18next)

Vue.config.productionTip = false

window.addEventListener('languagechange', () => {
  if (!store.state.manuallySelectedLanguage) {
    i18next.changeLanguage(navigator.language)
  }
})

let vueApp = new Vue({
  i18n,
  render: h => h(App),
  vuetify,

  data: function() {
    return store.state
  }
}).$mount('#app')

vueApp.$watch(function translateDocumentTitle() {
  document.title = vueApp.$t('app.name')
})

function updateVuetifyLanguage() {
  vueApp.$vuetify.lang.current = store.state.language.substring(0, 2)
}
i18next.on('languageChanged', updateVuetifyLanguage)
