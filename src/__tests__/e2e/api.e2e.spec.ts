import { createGroup, getGroup } from "../../lib";
import { deleteGroup } from "../../lib/delete-group";
import { initLogger } from "../../utils/telemtery";
import { beforeAll, describe, expect, it } from "bun:test";

describe("end to end suite", () => {
  beforeAll(() => {
    initLogger("test");
  });

  it("successfully creates groups via API", async () => {
    // GIVEN
    const params = { name: "Test" };

    // WHEN
    const created = await createGroup(params);
    const received = await getGroup(created.id);
    const deleted = await deleteGroup(created.id);

    // THEN
    expect(created.name).toEqual("Test");
    expect(received).toEqual({ ...created, members: [] });
    expect(deleted).toEqual(created);
  });
});
