import { faker } from "@faker-js/faker";
import { User } from "../models/user.model.js";

const createUser = async (numUsers) => {
  try {
    const usersPromise = [];

    for (let i = 0; i < numUsers; i++) {
      const tempUser = User.create({
        email: faker.internet.email(),
        username: faker.internet.userName(),
        bio: faker.lorem.sentence(10),
        password: faker.internet.password(),
        avatar_url: faker.image.avatar(),
        avatar_public_id: faker.system.fileName(),
      });
      usersPromise.push(tempUser);
    }

    await Promise.all(usersPromise);

    console.log("Users created", numUsers);
    process.exit(1);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export { createUser };