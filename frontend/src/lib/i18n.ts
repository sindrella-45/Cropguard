export type Language = 'English' | 'Swahili' | 'French' | 'Luganda' | 'Runyankole';

export interface Translations {
  nav_dashboard:     string;
  nav_diagnose:      string;
  nav_history:       string;
  nav_offline:       string;
  nav_guides:        string;
  nav_feedback:      string;
  nav_settings:      string;
  nav_profile:       string;
  nav_logout:        string;
  dash_welcome:      string;
  dash_total:        string;
  dash_healthy:      string;
  dash_alerts:       string;
  dash_reports:      string;
  dash_recent:       string;
  dash_view_all:     string;
  dash_upload_new:   string;
  dash_tips:         string;
  dash_no_diagnoses: string;
  dash_diagnose_now: string;
  diag_title:        string;
  diag_subtitle:     string;
  diag_drop:         string;
  diag_upload:       string;
  diag_camera:       string;
  diag_analyze:      string;
  diag_analyzing:    string;
  diag_complete:     string;
  diag_new:          string;
  diag_rate:         string;
  set_title:         string;
  set_language:      string;
  set_dark_mode:     string;
  set_push:          string;
  set_weekly_tips:   string;
  set_outbreak:      string;
  set_offline:       string;
  set_auto_download: string;
  set_analytics:     string;
  set_change_pw:     string;
  set_delete_data:   string;
  set_logout:        string;
  hist_title:        string;
  hist_subtitle:     string;
  hist_search:       string;
  guide_title:       string;
  feedback_title:    string;
  profile_title:     string;
  save:              string;
  cancel:            string;
  loading:           string;
  close:             string;
  view:              string;
  delete_word:       string;
}

const translations: Record<Language, Translations> = {
  English: {
    nav_dashboard:     'Dashboard',
    nav_diagnose:      'Diagnose',
    nav_history:       'History',
    nav_offline:       'Offline Mode',
    nav_guides:        'Guides',
    nav_feedback:      'Feedback',
    nav_settings:      'Settings',
    nav_profile:       'My Profile',
    nav_logout:        'Logout',
    dash_welcome:      'Good morning',
    dash_total:        'Total Diagnoses',
    dash_healthy:      'Healthy Crops',
    dash_alerts:       'Active Alerts',
    dash_reports:      'Reports Generated',
    dash_recent:       'Recent Diagnoses',
    dash_view_all:     'View all',
    dash_upload_new:   '+ Upload New Image',
    dash_tips:         'Farmer Tips',
    dash_no_diagnoses: 'No diagnoses yet',
    dash_diagnose_now: '+ Diagnose Now',
    diag_title:        'Diagnose Crop',
    diag_subtitle:     'Upload a photo to get AI-powered disease diagnosis',
    diag_drop:         'Drop your crop image here',
    diag_upload:       'Upload Image',
    diag_camera:       'Take Photo',
    diag_analyze:      'Diagnose Crop',
    diag_analyzing:    'Analyzing your crop image...',
    diag_complete:     'Diagnosis Complete',
    diag_new:          '+ New Diagnosis',
    diag_rate:         '⭐ Rate This Diagnosis',
    set_title:         'Settings',
    set_language:      'App Language',
    set_dark_mode:     'Dark Mode',
    set_push:          'Push Notifications',
    set_weekly_tips:   'Weekly Crop Tips',
    set_outbreak:      'Disease Outbreak Alerts',
    set_offline:       'Offline Mode',
    set_auto_download: 'Auto-Download Updates',
    set_analytics:     'Data Analytics',
    set_change_pw:     'Change Password',
    set_delete_data:   'Delete All My Data',
    set_logout:        'Sign Out of All Devices',
    hist_title:        'Diagnosis History',
    hist_subtitle:     'All your past crop diagnoses',
    hist_search:       'Search crop or disease...',
    guide_title:       'Crop Guides',
    feedback_title:    'Rate Your Diagnosis',
    profile_title:     'My Profile',
    save:              'Save Changes',
    cancel:            'Cancel',
    loading:           'Loading...',
    close:             'Close',
    view:              'View',
    delete_word:       'Delete',
  },

  Swahili: {
    nav_dashboard:     'Dashibodi',
    nav_diagnose:      'Chunguza',
    nav_history:       'Historia',
    nav_offline:       'Hali ya Nje ya Mtandao',
    nav_guides:        'Miongozo',
    nav_feedback:      'Maoni',
    nav_settings:      'Mipangilio',
    nav_profile:       'Wasifu Wangu',
    nav_logout:        'Toka',
    dash_welcome:      'Habari za asubuhi',
    dash_total:        'Jumla ya Uchunguzi',
    dash_healthy:      'Mazao Yenye Afya',
    dash_alerts:       'Tahadhari Zinazoendelea',
    dash_reports:      'Ripoti Zilizoundwa',
    dash_recent:       'Uchunguzi wa Hivi Karibuni',
    dash_view_all:     'Angalia yote',
    dash_upload_new:   '+ Pakia Picha Mpya',
    dash_tips:         'Vidokezo vya Mkulima',
    dash_no_diagnoses: 'Hakuna uchunguzi bado',
    dash_diagnose_now: '+ Chunguza Sasa',
    diag_title:        'Chunguza Zao',
    diag_subtitle:     'Pakia picha kupata utambuzi wa magonjwa wa AI',
    diag_drop:         'Acha picha ya zao lako hapa',
    diag_upload:       'Pakia Picha',
    diag_camera:       'Piga Picha',
    diag_analyze:      'Chunguza Zao',
    diag_analyzing:    'Inachunguza picha ya zao lako...',
    diag_complete:     'Uchunguzi Umekamilika',
    diag_new:          '+ Uchunguzi Mpya',
    diag_rate:         '⭐ Kadiria Uchunguzi Huu',
    set_title:         'Mipangilio',
    set_language:      'Lugha ya Programu',
    set_dark_mode:     'Hali ya Giza',
    set_push:          'Arifa za Kusukuma',
    set_weekly_tips:   'Vidokezo vya Kila Wiki',
    set_outbreak:      'Arifa za Mlipuko wa Magonjwa',
    set_offline:       'Hali ya Nje ya Mtandao',
    set_auto_download: 'Pakua Masasisho Kiotomatiki',
    set_analytics:     'Uchanganuzi wa Data',
    set_change_pw:     'Badilisha Nenosiri',
    set_delete_data:   'Futa Data Zangu Zote',
    set_logout:        'Toka Kwenye Vifaa Vyote',
    hist_title:        'Historia ya Uchunguzi',
    hist_subtitle:     'Uchunguzi wako wote uliopita',
    hist_search:       'Tafuta zao au ugonjwa...',
    guide_title:       'Miongozo ya Mazao',
    feedback_title:    'Kadiria Uchunguzi Wako',
    profile_title:     'Wasifu Wangu',
    save:              'Hifadhi Mabadiliko',
    cancel:            'Ghairi',
    loading:           'Inapakia...',
    close:             'Funga',
    view:              'Angalia',
    delete_word:       'Futa',
  },

  French: {
    nav_dashboard:     'Tableau de bord',
    nav_diagnose:      'Diagnostiquer',
    nav_history:       'Historique',
    nav_offline:       'Mode Hors ligne',
    nav_guides:        'Guides',
    nav_feedback:      'Commentaires',
    nav_settings:      'Paramètres',
    nav_profile:       'Mon Profil',
    nav_logout:        'Déconnexion',
    dash_welcome:      'Bonjour',
    dash_total:        'Total des Diagnostics',
    dash_healthy:      'Cultures Saines',
    dash_alerts:       'Alertes Actives',
    dash_reports:      'Rapports Générés',
    dash_recent:       'Diagnostics Récents',
    dash_view_all:     'Voir tout',
    dash_upload_new:   '+ Télécharger une Nouvelle Image',
    dash_tips:         'Conseils aux Agriculteurs',
    dash_no_diagnoses: 'Aucun diagnostic pour le moment',
    dash_diagnose_now: '+ Diagnostiquer Maintenant',
    diag_title:        'Diagnostiquer la Culture',
    diag_subtitle:     'Téléchargez une photo pour un diagnostic IA',
    diag_drop:         'Déposez votre image ici',
    diag_upload:       'Télécharger une Image',
    diag_camera:       'Prendre une Photo',
    diag_analyze:      'Diagnostiquer',
    diag_analyzing:    'Analyse de votre image en cours...',
    diag_complete:     'Diagnostic Terminé',
    diag_new:          '+ Nouveau Diagnostic',
    diag_rate:         '⭐ Évaluer ce Diagnostic',
    set_title:         'Paramètres',
    set_language:      'Langue de l\'Application',
    set_dark_mode:     'Mode Sombre',
    set_push:          'Notifications Push',
    set_weekly_tips:   'Conseils Hebdomadaires',
    set_outbreak:      'Alertes d\'Épidémie',
    set_offline:       'Mode Hors ligne',
    set_auto_download: 'Téléchargement Automatique',
    set_analytics:     'Analyse des Données',
    set_change_pw:     'Changer le Mot de Passe',
    set_delete_data:   'Supprimer Toutes mes Données',
    set_logout:        'Déconnexion de Tous les Appareils',
    hist_title:        'Historique des Diagnostics',
    hist_subtitle:     'Tous vos diagnostics passés',
    hist_search:       'Rechercher une culture ou maladie...',
    guide_title:       'Guides des Cultures',
    feedback_title:    'Évaluer votre Diagnostic',
    profile_title:     'Mon Profil',
    save:              'Enregistrer',
    cancel:            'Annuler',
    loading:           'Chargement...',
    close:             'Fermer',
    view:              'Voir',
    delete_word:       'Supprimer',
  },

  Luganda: {
    nav_dashboard:     'Ekibiina',
    nav_diagnose:      'Kennya Obulwadde',
    nav_history:       'Ebyafaayo',
    nav_offline:       'Enkola Etalina Intaneti',
    nav_guides:        'Emikisa',
    nav_feedback:      'Ebitegeereza',
    nav_settings:      'Entegeka',
    nav_profile:       'Ebikkusa Byange',
    nav_logout:        'Fiira',
    dash_welcome:      'Wasuze otya',
    dash_total:        'Obuganda Bwonna bw\'Okunaba',
    dash_healthy:      'Ebimera Ebirungi',
    dash_alerts:       'Okuteeka Amazima',
    dash_reports:      'Ebikwatibwa Ebyavangudwa',
    dash_recent:       'Okunaba Okukyali Okuntu',
    dash_view_all:     'Laba byonna',
    dash_upload_new:   '+ Yingiza Ekifaananyi Ekipya',
    dash_tips:         'Ebyogerwa by\'Omulimi',
    dash_no_diagnoses: 'Tewali kunaba okukola',
    dash_diagnose_now: '+ Naba Kati',
    diag_title:        'Naba Ebimera',
    diag_subtitle:     'Yingiza ekifaananyi okufuna okunaba kw\'obulwadde',
    diag_drop:         'Seka ekifaananyi ky\'ebimera wano',
    diag_upload:       'Yingiza Ekifaananyi',
    diag_camera:       'Fota Ekifaananyi',
    diag_analyze:      'Naba Ebimera',
    diag_analyzing:    'Genda okunaba ekifaananyi...',
    diag_complete:     'Okunaba Kwakwatikirwa',
    diag_new:          '+ Okunaba Okupya',
    diag_rate:         '⭐ Kola Okunaba Kuno Amangu',
    set_title:         'Entegeka',
    set_language:      'Olulimi lw\'App',
    set_dark_mode:     'Enkola y\'Ekizikiza',
    set_push:          'Okuteeka Amazima Okweyongera',
    set_weekly_tips:   'Ebyogerwa bya Buli Wiiki',
    set_outbreak:      'Okuteeka Amazima g\'Obulwadde',
    set_offline:       'Enkola Etalina Intaneti',
    set_auto_download: 'Kuuma Ebyavuganyizibwa Wekka',
    set_analytics:     'Okusomesa Ebyogerwa',
    set_change_pw:     'Kyusa Ekigambo ky\'Obukuumi',
    set_delete_data:   'Sazaamu Ebyange Byonna',
    set_logout:        'Fiira ku Bikozesebwa Byonna',
    hist_title:        'Ebyafaayo by\'Okunaba',
    hist_subtitle:     'Okunaba kwako kwonna okwafaayo',
    hist_search:       'Noonya ebimera oba obulwadde...',
    guide_title:       'Emikisa gy\'Ebimera',
    feedback_title:    'Kola Okunaba Kuno Amangu',
    profile_title:     'Ebikkusa Byange',
    save:              'Kuuma Ebikyusiddwa',
    cancel:            'Sazaamu',
    loading:           'Tegereza...',
    close:             'Ggalawo',
    view:              'Laba',
    delete_word:       'Sazaamu',
  },

  Runyankole: {
    nav_dashboard:     'Ekibiina',
    nav_diagnose:      'Kennya Endwara',
    nav_history:       'Ebyabaire',
    nav_offline:       'Enkora Etaine Intaneti',
    nav_guides:        'Emikisa',
    nav_feedback:      'Ebitegeereza',
    nav_settings:      'Entegeka',
    nav_profile:       'Ebikkusa Byange',
    nav_logout:        'Fiira',
    dash_welcome:      'Oraire ota',
    dash_total:        'Obuganda Bwona bw\'Okukennya',
    dash_healthy:      'Ebimera Ebirungi',
    dash_alerts:       'Okuteeka Amazima',
    dash_reports:      'Ebikwatibwa Ebyavangudwa',
    dash_recent:       'Okukennya Okukyali Okuntu',
    dash_view_all:     'Reba byona',
    dash_upload_new:   '+ Yingiza Ekifaananyi Ekipya',
    dash_tips:         'Ebyogerwa by\'Omuhingri',
    dash_no_diagnoses: 'Tewali kukennya okukora',
    dash_diagnose_now: '+ Kennya Kati',
    diag_title:        'Kennya Ebimera',
    diag_subtitle:     'Yingiza ekifaananyi okufuna okukennya kw\'endwara',
    diag_drop:         'Seka ekifaananyi ky\'ebimera wano',
    diag_upload:       'Yingiza Ekifaananyi',
    diag_camera:       'Fota Ekifaananyi',
    diag_analyze:      'Kennya Ebimera',
    diag_analyzing:    'Genda okukennya ekifaananyi...',
    diag_complete:     'Okukennya Kwakwatikirwa',
    diag_new:          '+ Okukennya Okupya',
    diag_rate:         '⭐ Kora Okukennya Kuno Amangu',
    set_title:         'Entegeka',
    set_language:      'Orurimi rw\'App',
    set_dark_mode:     'Enkora y\'Ekizikiza',
    set_push:          'Okuteeka Amazima Okweyongera',
    set_weekly_tips:   'Ebyogerwa bya Buri Wiiki',
    set_outbreak:      'Okuteeka Amazima g\'Endwara',
    set_offline:       'Enkora Etaine Intaneti',
    set_auto_download: 'Kuuma Ebyavuganyizibwa Wekka',
    set_analytics:     'Okusomesa Ebyogerwa',
    set_change_pw:     'Hindura Ekigambo ky\'Obukuumi',
    set_delete_data:   'Hanura Ebyange Byona',
    set_logout:        'Fiira ku Bikozesebwa Byona',
    hist_title:        'Ebyabaire by\'Okukennya',
    hist_subtitle:     'Okukennya kwako kwona okwabaire',
    hist_search:       'Noonya ebimera oba endwara...',
    guide_title:       'Emikisa gy\'Ebimera',
    feedback_title:    'Kora Okukennya Kuno Amangu',
    profile_title:     'Ebikkusa Byange',
    save:              'Kuuma Ebikyusiddwa',
    cancel:            'Hanura',
    loading:           'Tegeereza...',
    close:             'Galawo',
    view:              'Reba',
    delete_word:       'Hanura',
  },
};

export function t(language: string, key: keyof Translations): string {
  const lang = (language as Language) in translations
    ? (language as Language)
    : 'English';
  return translations[lang][key] || translations['English'][key] || key;
}