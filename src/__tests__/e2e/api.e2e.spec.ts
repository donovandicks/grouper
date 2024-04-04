import { createGroup, getGroup } from "../../lib";
import { deleteGroup } from "../../lib/delete-group";
import { initLogger } from "../../utils/telemtery";
import { beforeAll, describe, expect, it } from "bun:test";

describe("end to end suite", () => {
  beforeAll(() => {
    initLogger("test");
  });

  it("successfully creates groups via API", async () => {
    const created = await createGroup({ name: "Test" });

    expect(created.name).toEqual("Test");

    const received = await getGroup(created.id);

    expect(received).toEqual(created);

    const deleted = await deleteGroup(created.id);

    expect(deleted).toEqual(created);
  });
});
