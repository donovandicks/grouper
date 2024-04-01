import { Group } from "./group";
import { randomUUID } from "crypto";

describe("Group Model", () => {
  it("should have id, name, and handle properties", () => {
    const group: Group = {
      id: randomUUID(),
      name: "Group 1",
      handle: "group1",
    };

    expect(group.id).toBeDefined();
    expect(group.name).toBeDefined();
    expect(group.handle).toBeDefined();
  });

  it("should have id as GroupID type", () => {
    const group: Group = {
      id: randomUUID(),
      name: "Group 1",
      handle: "group1",
    };

    expect(typeof group.id).toBe("string");
  });

  it("should have name and handle as string type", () => {
    const group: Group = {
      id: randomUUID(),
      name: "Group 1",
      handle: "group1",
    };

    expect(typeof group.name).toBe("string");
    expect(typeof group.handle).toBe("string");
  });
});
