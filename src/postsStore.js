let posts = [
  {
    id: 1,
    title: "Bienvenidos a DevBlog",
    author: "Equipo DevBlog",
    publishedAt: "2026-01-10",
    category: "Noticias",
    content:
      "Este es el primer post de nuestro blog. Aqui compartiremos noticias, tips y actualizaciones del equipo."
  },
  {
    id: 2,
    title: "5 tips de productividad con IA",
    author: "Ana Torres",
    publishedAt: "2026-05-15",
    category: "Tips",
    content:
      "La inteligencia artificial puede ayudarte a ser mas **productivo** si la usas bien. Aqui van 5 tips clave."
  },
  {
    id: 3,
    title: "Nuestro roadmap para el segundo semestre",
    author: "Carlos Ruiz",
    publishedAt: "2026-09-01",
    category: "Roadmap",
    content:
      "Estamos muy emocionados de compartir el roadmap de DevBlog para los proximos meses."
  }
];
let nextId = 4;

function getAll() {
  return posts;
}

function getById(id) {
  return posts.find((p) => p.id === id);
}

function create({ title, author, content, publishedAt, category }) {
  const post = {
    id: nextId++,
    title,
    author,
    category,
    content,
    publishedAt: publishedAt || new Date().toISOString().slice(0, 10)
  };
  posts.push(post);
  return post;
}

function update(id, changes) {
  const post = getById(id);
  if (!post) return null;
  Object.assign(post, changes);
  return post;
}

function filterByDate(list, desde, hasta) {
  return list.filter((p) => {
    if (desde && p.publishedAt < desde) return false;
    if (hasta && p.publishedAt > hasta) return false;
    return true;
  });
}

module.exports = { getAll, getById, create, update, filterByDate };
