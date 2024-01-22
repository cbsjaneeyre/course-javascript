export default {
  getRandomElement(array) {
    if (array.length === 0) {
      return null;
    }

    const i = parseInt(Math.random() * (array.length));

    return array[i];
  },

  async getNextPhoto() {
    const friend = this.getRandomElement(this.friends.items);
    const photos = await this.getFriendPhotos(friend.id);
    const photo = this.getRandomElement(photos.items);
    const size = this.findSize(photo);

    return { friend, id: photo.id, url: size.url };
  },

  findSize(photo) {
    const size = photo.sizes.find((size) => size.width >= 360);

    if (!size) {
      return photo.sizes.reduce((biggest, current) => {
        if (current.width > biggest.width) {
          return current;
        }

        return biggest;
      }, photo.sizes[0]);
    }
    
    return size;
  },

  async init() {
    this.photoCache = {};
    this.friends = await this.getFriends();
  },

  photoCache: {},

  login() {
    return new Promise((resolve, reject) => {
      VK.init({
        apiId: 51838519,
      });

      VK.Auth.login((data) => {
        if (data.session) {
          resolve(data);
        } else {
          console.error(data);
          reject(data);
        }
      }, 2 | 4);
    });
  },

  callAPI(method, params) {
    params.v = '5.199';

    return new Promise((resolve, reject) => {
      VK.api(method, params, (data) => {
        if (data.error) {
          reject(new Error(data.error.error_msg));
        } else {
          resolve(data.response);
        }
      });
    });
  },

  getFriends() {
    const params = {
      fields: ['photo_50', 'photos_100'],
    };

    return this.callAPI('friends.get', params);
  },

  getPhotos(owner) {
    const params = {
      owner_id: owner,
    };

    return this.callAPI('photos.getAll', params);
  },

  async getFriendPhotos(id) {
    let photos = this.photoCache[id];

    if (photos) {
      return photos;
    }

    photos = await this.getPhotos(id);

    this.photoCache[id] = photos;

    return photos;
  },
};