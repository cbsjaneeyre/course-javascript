const pagesMap = {
  login: '.page-login',
  main: '.page-main',
  profile: '.page-profile',
};

export default {
  openPage(name) {
    let currentPage = null;
    const selector = pagesMap[name];
    const page = document.querySelector(selector);

    if (currentPage != null) {
      currentPage.classList.add('hidden');
      currentPage = page;
    } else {
      currentPage.classList.remove('hidden');
    }
  },
};