import models from '../models';
import faker from 'faker';

const { User, Category, Article, Comment } = models;

let categories;
let articles;
let users;
let comments;


const seedCategories = async () => {
  const dummyCategories = [
    { name: 'technology' },
    { name: 'fashion' },
  ];

  const categoriesPromise = dummyCategories.map(async (data) => {
    return await Category.create(data);
  });
  categories = await Promise.all(categoriesPromise);
};

const seedUsers = async () => {
  const createdUsers = [];
  for(let i=1; i <= 2; i++) {
    const firstname = faker.name.firstName();
    const lastname = faker.name.lastName();
    const username = firstname.toLowerCase() + '.' + lastname.toLowerCase();
    const userData = { firstname, lastname, username };
    const newUser = await User.create(userData);
    createdUsers.push(newUser);
  }
  users = await Promise.all(createdUsers);
}

const seedArticles = async () => {
  const articleSeedsPromise = [];

  // create 20 articles
  for(let a=1; a <= 20; a++) {
    const user = faker.random.arrayElement(users);
    const category = faker.random.arrayElement(categories);
    const title = faker.random.words(10);
    const slug = title.replace(/\s+/g, '-').toLowerCase();

    const newArticle = await Article.create({
      title,
      slug,
      description: faker.random.words(10),
      body: faker.random.words(10),
      authorId: user.id,
      categoryId: category.id
    });

    articleSeedsPromise.push(newArticle);
  }
  articles = await Promise.all(articleSeedsPromise);
};


const seedComments = async () => {
  // create 30 random comments
  for(let i=1; i <= 30; i++) {
    const user = faker.random.arrayElement(users);
    const article = faker.random.arrayElement(articles);
    await Comment.create({
      userId: user.id,
      articleId: article.id,
      body: faker.random.words(10)
    });
  }
}


const seedDatabase = async () => {
  await seedCategories();
  await seedUsers();
  await seedArticles();
  await seedComments();
}

seedDatabase();