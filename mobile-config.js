App.info({
  id: 'com.calgarypark',
  name: 'calgarypark',
  description: 'Find parking',
  author: 'Chih-Hsuan Huang',
//  email: 'contact@example.com',
  //website: 'http://example.com'
});
App.icons({
  'android_mdpi': './android_mdpi.png',
  // ... more screen sizes and platforms ...
});
App.accessRule('*.google.com/*');
App.accessRule('*.googleapis.com/*');
App.accessRule('*.gstatic.com/*');
