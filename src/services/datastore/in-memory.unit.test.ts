import { CreateGroupDTO } from "../../api/models";
import { InMemoryDatastore } from "./in-memory";

let ds: InMemoryDatastore;

describe("InMemoryDatastore", () => {
  beforeEach(() => {
    ds = new InMemoryDatastore();
  });

  it("should support creating a group", async () => {
    // GIVEN
    const g: CreateGroupDTO = { name: "Test" };

    // WHEN
    const created = await ds.createGroup(g);

    // THEN
    expect(created.name).toEqual("Test");
    expect(created.handle).toEqual("test");
    expect(created.id.length).toEqual(36);
    expect(created.createdAt.getDay()).toEqual(new Date().getDay());
    expect(created.updatedAt.getDay()).toEqual(new Date().getDay());
  });
});
