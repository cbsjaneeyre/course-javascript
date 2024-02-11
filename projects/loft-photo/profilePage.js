import model from './model';
import mainPage from './mainPage';
import pages from './pages';

export default {
  async setUser(user) {
    const userInfoPhotoComponent = document.querySelector('.component-user-info-photo');
    const userInfoNameComponent = document.querySelector('.component-user-info-name');
    const photosTab = document.querySelector('.component-profile-mode-photos');
    const friendsTab = document.querySelector('.component-profile-mode-friends');

    this.user = user;

    userInfoPhotoComponent.style.backgroundImage = `url('${user.photo_100}')`;
    userInfoNameComponent.innerText = `${user.first_name ?? ''} ${user.last_name ?? ''}`;

    const mode = localStorage.getItem('loft-photo-profile-mode') ?? '1';

    if (mode === '1') {
      photosTab.click();
    } else {
      friendsTab.click();
    }

  },

  async showPhotos() {
    const userPhotosComponent = document.querySelector('.component-user-photos');
    const photos = await model.getPhotos(this.user.id);

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

  async showFriends() {
    const userFriendsComponent = document.querySelector('.component-user-friends');
    const friends = await model.getFriends(this.user.id);

    userFriendsComponent.innerHTML = '';

    for (const friend of friends.items) {
      const element = document.createElement('div');
      const photoElement = document.createElement('div');
      const nameElement = document.createElement('div');

      element.classList.add('component-user-friend');
      element.dataset.id = friend.id;

      photoElement.classList.add('component-user-friend-photo');
      photoElement.style.backgroundImage = `url(${friend.photo_100})`;
      photoElement.dataset.id = friend.id;

      nameElement.classList.add('component-user-friend-name');
      nameElement.innerText = `${friend.first_name ?? ''} ${friend.last_name ?? ''}`;
      nameElement.dataset.id = friend.id;

      element.append(photoElement, nameElement);
      userFriendsComponent.append(element);
    }
  },

  handleEvents() {
    const userPhotos = document.querySelector('.component-user-photos');
    const backButton = document.querySelector('.page-profile-back');
    const exitButton = document.querySelector('.page-profile-exit');
    const photosButton = document.querySelector('.component-profile-mode-photos');
    const friendsButton = document.querySelector('.component-profile-mode-friends');
    const userFriends = document.querySelector('.component-user-friends');

    userPhotos.addEventListener('click', async (e) => {
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

    userFriends.addEventListener('click', async (e) => {
      const friendID = e.target.dataset.id;

      if (friendID) {
        const [friend] = await model.getUsers([friendID]);
        const friendPhotos = await model.getPhotos(friendID);

        const photo = model.getRandomElement(friendPhotos.items);
        const size = model.findSize(photo);
        const photoStats = await model.photoStats(photo.id);

        mainPage.setFriendAndPhoto(friend, parseInt(photo.id), size.url, photoStats);
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

    photosButton.addEventListener('click', async () => {
      const photosComponent = document.querySelector('.component-user-photos');
      const friendsComponent = document.querySelector('.component-user-friends');

      photosComponent.classList.remove('hidden');
      friendsComponent.classList.add('hidden');

      localStorage.setItem('loft-photo-profile-mode', '1');

      this.showPhotos();
    });

    friendsButton.addEventListener('click', async () => {
      const friendsComponent = document.querySelector('.component-user-friends');
      const photosComponent = document.querySelector('.component-user-photos');

      friendsComponent.classList.remove('hidden');
      photosComponent.classList.add('hidden');

      localStorage.setItem('loft-photo-profile-mode', '2');

      this.showFriends();
    });
  },
};

// node projects/loft-photo/server