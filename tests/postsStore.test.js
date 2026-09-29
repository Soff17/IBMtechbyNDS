const store = require("../src/postsStore");

// Helper: get a fresh isolated list from the store after each create
// We snapshot getAll() before and after to avoid coupling to seed data order.

describe("filterByDate", () => {
  const list = [
    { id: 10, title: "A", publishedAt: "2026-03-01" },
    { id: 11, title: "B", publishedAt: "2026-05-15" },
    { id: 12, title: "C", publishedAt: "2026-09-01" },
  ];

  test("returns all posts when no params provided", () => {
    expect(store.filterByDate(list, undefined, undefined)).toHaveLength(3);
  });

  test("filters by desde — returns posts on or after the date", () => {
    const result = store.filterByDate(list, "2026-05-15", undefined);
    expect(result.map((p) => p.id)).toEqual([11, 12]);
  });

  test("filters by hasta — returns posts on or before the date", () => {
    const result = store.filterByDate(list, undefined, "2026-05-15");
    expect(result.map((p) => p.id)).toEqual([10, 11]);
  });

  test("filters by both desde and hasta — returns posts within inclusive range", () => {
    const result = store.filterByDate(list, "2026-03-01", "2026-05-15");
    expect(result.map((p) => p.id)).toEqual([10, 11]);
  });

  test("boundary — post exactly on desde is included", () => {
    const result = store.filterByDate(list, "2026-09-01", undefined);
    expect(result.map((p) => p.id)).toContain(12);
  });

  test("boundary — post exactly on hasta is included", () => {
    const result = store.filterByDate(list, undefined, "2026-03-01");
    expect(result.map((p) => p.id)).toContain(10);
  });

  test("returns empty array when no posts match the range", () => {
    const result = store.filterByDate(list, "2027-01-01", undefined);
    expect(result).toHaveLength(0);
  });
});

describe("create", () => {
  test("creates a post with all fields including category", () => {
    const post = store.create({
      title: "Test post",
      author: "Tester",
      content: "Hello world",
      category: "Tips",
    });
    expect(post.id).toBeDefined();
    expect(post.title).toBe("Test post");
    expect(post.author).toBe("Tester");
    expect(post.content).toBe("Hello world");
    expect(post.category).toBe("Tips");
    expect(post.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("creates a post without category — category is undefined", () => {
    const post = store.create({
      title: "No category post",
      author: "Tester",
      content: "No cat",
    });
    expect(post.category).toBeUndefined();
  });

  test("created post is retrievable via getById", () => {
    const created = store.create({ title: "Findable", author: "X", content: "Y" });
    const found = store.getById(created.id);
    expect(found).toBe(created);
  });
});

describe("getById", () => {
  test("returns the post for a valid id", () => {
    const post = store.create({ title: "Lookup test", author: "A", content: "B" });
    expect(store.getById(post.id)).toEqual(post);
  });

  test("returns undefined for a non-existent id", () => {
    expect(store.getById(99999)).toBeUndefined();
  });
});
