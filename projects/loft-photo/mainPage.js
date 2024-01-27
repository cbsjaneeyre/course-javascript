import pages from './pages';
import model from './model';
import profilePage from './profilePage';

const photoComponent = document.querySelector('.component-photo');

export default {
  async getNextPhoto() {
    const { friend, id, url } = await model.getNextPhoto();
    this.setFriendAndPhoto(friend, id, url);
  },

  setFriendAndPhoto(friend, id, url) {
    const headerPhotoComponent = document.querySelector('.component-header-photo');
    const headerNameComponent = document.querySelector('.component-header-name');
    const footerPhotoComponent = document.querySelector('.component-footer-photo');

    this.friend = friend;

    photoComponent.style.backgroundImage = `url(${url})`;
    headerPhotoComponent.style.backgroundImage = `url('${friend.photo_50}')`;
    headerNameComponent.innerText = `${friend.first_name ?? ''} ${friend.last_name ?? ''}`;
    footerPhotoComponent.style.backgroundImage = `url('${model.me.photo_50}')`;
  },

  handleEvents() {
    let startFrom;

    photoComponent.addEventListener('touchstart', (e) => {
      e.preventDefault();

      startFrom = { y: e.changedTouches[0].pageY };
    });

    photoComponent.addEventListener('touchend', async (e) => {
      const direction = e.changedTouches[0].pageY - startFrom.y;

      if (direction < 0) {
        await this.getNextPhoto();
      }
    });

    document.querySelector('.component-header-profile-link').addEventListener('click', async () => {
      await profilePage.setUser(this.friend);
      pages.openPage('profile');
    });

    document.querySelector('.component-footer-container-profile-link').addEventListener('click', async () => {
      await profilePage.setUser(model.me);
      pages.openPage('profile');
    });
  },
};