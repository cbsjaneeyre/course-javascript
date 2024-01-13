const pagesMap = {
  login: '.page-login',
  main: '.page-main',
  profile: '.page-profile',
};

export default {
  openPage(name) {
    const page = document.querySelector('.page');

    page.addEventListener('click', (e) => {
      e.preventDefault();

      if (name === page.classList.contains('page-login')) {
        name.classList.remove('hidden');
      } else (name === page.classList.containe('page-main')) {
        name.classList.remove('hidden');
      } 
    });
  },
};