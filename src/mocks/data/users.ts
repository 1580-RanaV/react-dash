import { faker } from "@faker-js/faker";

faker.seed(42);

const TAG_PALETTE: [string, string][] = [
  ["Customer", "#0080FF"],
  ["High Value", "#16a34a"],
  ["Internal", "#64748b"],
  ["Lead", "#f97316"],
  ["Enterprise", "#0ea5e9"],
  ["Designer", "#8b5cf6"],
  ["Beta", "#8b5cf6"],
];

const COMPANIES = Array.from({ length: 10 }, () => faker.company.name());

function randomTags(): [string, string][] {
  const count = faker.number.int({ min: 1, max: 2 });
  return faker.helpers.arrayElements(TAG_PALETTE, count);
}

export const USERS_DATA = Array.from({ length: 30 }, (_, i) => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const account = faker.helpers.arrayElement(COMPANIES);

  return {
    id: `u${String(i + 1).padStart(2, "0")}`,
    name: `${firstName} ${lastName}`,
    account,
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    title: faker.person.jobTitle(),
    tags: randomTags(),
  };
});
