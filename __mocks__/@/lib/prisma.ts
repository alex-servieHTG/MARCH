export default {
  project: {
    findMany: jest.fn().mockResolvedValue([
      { id: 1, title: "Foo",  images: [] },
      { id: 2, title: "Bar",  images: [] },
    ]),
  },
}