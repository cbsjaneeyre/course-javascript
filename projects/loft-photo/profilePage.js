import model from './model';
import mainPage from './mainPage';
import pages from './pages';

export default {
  async setUser(user) {
    const userInfoPhotoComponent = document.querySelector('.component-user-info-photo');
    const userInfoNameComponent = document.querySelector('.component-user-info-name');
    const userPhotosComponent = document.querySelector('.component-user-photos');

    const photos = await model.getPhotos(user.id);

    this.user = user;

    userInfoPhotoComponent.style.backgroundImage = `url('${user.photo_100}')`;
    userInfoNameComponent.innerText = `${user.first_name ?? ''} ${user.last_name ?? ''}`;
    userPhotosComponent.innerHTML = '';

    for (const photo of photos.items) {
      const size = model.findSize(photo);
      const userPhotoComponent = document.createElement('div');
      
      userPhotoComponent.classList.add('component-user-photo');
      userPhotoComponent.dataset.id = photo.id;
      userPhotoComponent.style.backgroundImage = `url(${size.url})`;
      userPhotosComponent.append(userPhotoComponent);
    }
  },

  handleEvents() {
    const userPhoto = document.querySelector('.component-user-photos');
    const backButton = document.querySelector('.page-profile-back');
    const exitButton = document.querySelector('.page-profile-exit');

    userPhoto.addEventListener('click', async (e) => {
      if (e.target.classList.contains('component-user-photo')) {
        const photoID = e.target.dataset.id;
        const friendPhotos = await model.getPhotos(this.user.id);
        const photo = friendPhotos.items.find((photo) => photo.id == photoID);
        const size = model.findSize(photo);
        const photoStats = await model.photoStats(photo.id);

        mainPage.setFriendAndPhoto(this.user, parseInt(photoID), size.url, photoStats);
        pages.openPage('main');
      }
    });

    backButton.addEventListener('click', async () => {
      pages.openPage('main');
    });

    exitButton.addEventListener('click', async () => {
      await model.logout();
      pages.openPage('login');
    });

  },
};