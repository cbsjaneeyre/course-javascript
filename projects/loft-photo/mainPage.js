import pages from './pages';
import model from './model';
import profilePage from './profilePage';
import commentsTemplate from './commentsTemplate.html.hbs';

const photoComponent = document.querySelector('.component-photo');

export default {
  async getNextPhoto() {
    const { friend, id, url } = await model.getNextPhoto();
    const photoStats = await model.photoStats(id);
    this.setFriendAndPhoto(friend, id, url);
  },

  setFriendAndPhoto(friend, id, url, stats) {
    const headerPhotoComponent = document.querySelector('.component-header-photo');
    const headerNameComponent = document.querySelector('.component-header-name');
    const footerPhotoComponent = document.querySelector('.component-footer-photo');

    this.friend = friend; // запоминаем, чья фотография
    this.photoID = id; // запоминаем передаваемую фотографию

    photoComponent.style.backgroundImage = `url(${url})`;
    headerPhotoComponent.style.backgroundImage = `url('${friend.photo_50}')`;
    headerNameComponent.innerText = `${friend.first_name ?? ''} ${friend.last_name ?? ''}`;
    footerPhotoComponent.style.backgroundImage = `url('${model.me.photo_50}')`;

    this.setLikes(stats.likes, stats.liked);
    this.setComments(stats.comments);
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

    // клик по аве друга
    document.querySelector('.component-header-profile-link').addEventListener('click', async () => {
      await profilePage.setUser(this.friend);
      pages.openPage('profile');
    });

    // клик по своей аву
    document.querySelector('.component-footer-container-profile-link').addEventListener('click', async () => {
      await profilePage.setUser(model.me);
      pages.openPage('profile');
    });

    // клик по лайку
    document.querySelector('.component-footer-container-social-likes').addEventListener('click', async () => {
      const { likes, liked } = await model.like(this.photoID);
      this.setLikes(likes, liked);
    });

    // клик по иконке комментариев
    document.querySelector('.component-footer-container-social-comments').addEventListener('click', async () => {
      document.querySelector('.component-comments').classList.remove('hidden');
      await this.loadComments(this.photoID);
    });

    // скрываем контейнер с комментариями при нажатии вне этого контейнера
    document.querySelector('.component-comments').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        document.querySelector('.component-comments').classList.add('hidden');
      }
    });

    // отправка комментария
    const input = document.querySelector('.component-comments-container-form-input'); // получаем доступ к инпуту
    document.querySelector('.component-comments-container-form-send').addEventListener('click', async () => {
      // убираем все пробелы вокруг текста коммента
      if (input.value.trim().length) {
        await model.postComment(this.photoID, input.value.trim()); 

        input.value = '';

        await this.loadComments(this.photoID);
      }
    });
  },

  async loadComments(photo) {
    const comments = await model.getComments(photo);
    const commentsElements = commentsTemplate({ 
      list: comments.map((comment) => {
        return {
          name: `${comment.user.first_name ?? ''} ${comment.user.last_name ?? ''}`,
          photo: comment.user.photo_50,
          text: comment.text
        };
      }),
    });

    document.querySelector('.component-comments-container-list').innerHTML = ''; // очищаем от предыдущих комментариев
    document.querySelector('.component-comments-container-list').append(commentsElements); // добавляем новые комментарии

    this.setComments(comments.length);
  },

  setLikes(total, liked) {
    const likesComponent = document.querySelector('.component-footer-container-social-likes');

    likesComponent.innerText = total; // установка количества лайков

    if (liked) {
      likesComponent.classList.add('liked'); // если лайкнуто, то применяем стиль с красным сердечком
    } else {
      likesComponent.classList.remove('liked');
    }
  },

  setComments(total) {
    const commentsComponent = document.querySelector('.component-footer-container-social-comments');

    commentsComponent.innerText = total; // установка количества комментариев, того, что прислал нам сервер
  },
};