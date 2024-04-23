import { createGroup, getGroup } from "../../lib";
import { addGroupMember } from "../../lib/add-group-member";
import { deleteGroup } from "../../lib/delete-group";
import { getGroupMembers } from "../../lib/get-group-members";
import { getOrCreateGroup } from "../../lib/get-or-create-group";
import { getOrCreateUser } from "../../lib/get-or-create-user";
import { queryGroups } from "../../lib/query-group";
import { queryGroupMembers } from "../../lib/query-group-members";
import { initLogger } from "../../utils/telemtery";
import { beforeAll, describe, expect, it } from "bun:test";

initLogger("local");

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

  it("successfully lists all group members", async () => {
    // GIVEN
    const group_params = { name: "Test" };
    const user_1_params = { name: "Alex", email: "alex@email.com" };
    const user_2_params = { name: "Celine", email: "celine@email.com" };

    // WHEN
    const group = await getOrCreateGroup(group_params);
    if (group === undefined) {
      throw new Error("failed to get or create group during test");
    }
    const user_1 = await getOrCreateUser(user_1_params);
    const user_2 = await getOrCreateUser(user_2_params);
    await addGroupMember({ groupId: group.id, userId: user_1.id });
    await addGroupMember({ groupId: group.id, userId: user_2.id });
    const members = await getGroupMembers(group.id);

    // THEN
    expect(members).toEqual([user_1, user_2]);
  });

  it("successfully filters group members by email", async () => {
    // GIVEN
    const group_params = { name: "Test" };
    const user_1_params = { name: "Alex", email: "alex@email.com" };
    const user_2_params = { name: "Celine", email: "celine@email.com" };

    // WHEN
    const group = await getOrCreateGroup(group_params);
    if (group === undefined) {
      throw new Error("failed to get or create group during test");
    }
    const user_1 = await getOrCreateUser(user_1_params);
    const user_2 = await getOrCreateUser(user_2_params);
    await addGroupMember({ groupId: group.id, userId: user_1.id });
    await addGroupMember({ groupId: group.id, userId: user_2.id });
    const members = await queryGroupMembers(group.id, { email: user_1_params.email });

    // THEN
    expect(members).toEqual([user_1]);
  });

  it("successfully filters group members by name", async () => {
    // GIVEN
    const group_params = { name: "Test" };
    const user_1_params = { name: "Alex", email: "alex@email.com" };
    const user_2_params = { name: "Celine", email: "celine@email.com" };

    // WHEN
    const group = await getOrCreateGroup(group_params);
    if (group === undefined) {
      throw new Error("failed to get or create group during test");
    }
    const user_1 = await getOrCreateUser(user_1_params);
    const user_2 = await getOrCreateUser(user_2_params);
    await addGroupMember({ groupId: group.id, userId: user_1.id });
    await addGroupMember({ groupId: group.id, userId: user_2.id });
    const members = await queryGroupMembers(group.id, { name: user_2_params.name });

    // THEN
    expect(members).toEqual([user_2]);
  });

  it("successfully filters groups by name", async () => {
    // GIVEN
    const group_1_params = { name: "Gold" };
    const group_2_params = { name: "Silver" };

    // WHEN
    const group_1 = await getOrCreateGroup(group_1_params);
    const group_2 = await getOrCreateGroup(group_2_params);
    if (group_1 === undefined || group_2 === undefined) {
      throw new Error("failed to get or create group during test");
    }
    const results = await queryGroups({ name: group_1_params.name });
    if (!(results instanceof Array)) {
      throw new Error(results.message);
    }

    // THEN
    expect(results[0]).toEqual(group_1);
  });

  it("successfully filters groups by handle", async () => {
    // GIVEN
    const group_1_params = { name: "Gold" };
    const group_2_params = { name: "Silver" };

    // WHEN
    const group_1 = await getOrCreateGroup(group_1_params);
    const group_2 = await getOrCreateGroup(group_2_params);
    if (group_1 === undefined || group_2 === undefined) {
      throw new Error("failed to get or create group during test");
    }
    const results = await queryGroups({ handle: group_2.handle });
    if (!(results instanceof Array)) {
      throw new Error(results.message);
    }

    // THEN
    expect(results[0]).toEqual(group_2);
  });
});
