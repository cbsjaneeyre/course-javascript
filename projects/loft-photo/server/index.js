const http = require('node:http');
const https = require('node:https');
const url = require('node:url');

const DB = {
  tokens: new Map(),
  likes: new Map(),
  comments: new Map(),
};

const methods = {
  like(req, res, url, vkUser) {
    const photoID = url.searchParams.get('photo'); // получаем параметр photo из url, где передается id фото
    let photoLikes = DB.likes.get(photoID); // получаем все лайки фото, у которой передали id

    // делаем проверку, если на фото еще нет лайков, если photoLikes пустой, undefined
    if (!photoLikes) {
      photoLikes = new Map(); // создаем коллекцию для хранения лайков фото
      DB.likes.set(photoID, photoLikes); // передаем коллекцию лайков для фото (пустой, чтобы был)
    }

    // снимаем лайк, если пользователь (мы) уже лайкнул фото
    if (photoLikes.get(vkUser.id)) {
      photoLikes.delete(vkUser.id);

      return {
        likes: photoLikes.size, // количество лайков
        liked: false
      };
    }

    // ставим лайк, если его не было
    photoLikes.set(vkUser.id, true);

    return {
      likes: photoLikes.size,
      liked: true
    };
  },

  photoStats(req, res, url, vkUser) {
    const photoID = url.searchParams.get('photo');
    const photoLikes = DB.likes.get(photoID);
    const photoComments = DB.comments.get(photoID); // получаем все комментарии под фото, у которой передали id

    return {
      likes: photoLikes?.size ?? 0, // количество лайков
      liked: photoLikes?.has(vkUser.id) ?? false, // лайкнута ли мы фото или нет
      comments: photoComments?.length ?? 0 // количество комментариев
    }
  },

  postComment(req, res, url, vkUser, body) {
    const photoID = url.searchParams.get('photo');
    let photoComments = DB.comments.get(photoID);

    if (!photoComments) {
      photoComments = []; // массив, метод карты соответствия (map) не нужен, так как комменты не удаляем, как лайки
      DB.comments.set(photoID, photoComments);
    }

    // добавляем комментарий к фото в начале
    photoComments.unshift({
      user: vkUser,
      text: body.text
    });
  },

  getComments(req, res, url) {
    const photoID = url.searchParams.get('photo');
    return DB.comments.get(photoID) ?? []; // получаем список всех комментариев к фото, если там ничего нет - пустой массив
  },
};

http
  .createServer(async (req, res) => {
    console.log('➡️ Поступил запрос:', req.method, req.url);
    const token = req.headers['vk_token'];
    const parsed = new url.URL(req.url, 'http://localhost');
    const vkUser = await getMe(token);
    const body = await readBody(req);
    const method = parsed.searchParams.get('method');
    const responseData = await methods[method]?.(req, res, parsed, vkUser, body);

    res.end(JSON.stringify(responseData ?? null));
  })
  .listen('8888', () => {
    console.log('🚀 Сервер запущен');
  });

async function readBody(req) {
  if (req.method === 'GET') {
    return null;
  }

  return new Promise((resolve) => {
    let body = '';
    req
      .on('data', (chunk) => {
        body += chunk;
      })
      .on('end', () => resolve(JSON.parse(body)));
  });
}

async function getVKUser(token) {
  const body = await new Promise((resolve, reject) =>
    https
      .get(
        `https://api.vk.com/method/users.get?access_token=${token}&fields=photo_50&v=5.120`
      )
      .on('response', (res) => {
        let body = '';

        res.setEncoding('utf8');
        res
          .on('data', (chunk) => {
            body += chunk;
          })
          .on('end', () => resolve(JSON.parse(body)));
      })
      .on('error', reject)
  );

  return body.response[0];
}

async function getMe(token) {
  const existing = DB.tokens.get(token);

  if (existing) {
    return existing;
  }

  const user = getVKUser(token);

  DB.tokens.set(token, user);

  return user;
}
