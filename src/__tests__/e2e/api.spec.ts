import type { CreateRuleDTO } from "../../api/models";
import { createGroup, getGroup } from "../../lib";
import { addGroupMember } from "../../lib/add-group-member";
import { createRule } from "../../lib/create-rule";
import { deleteGroup } from "../../lib/delete-group";
import { deleteAllRules } from "../../lib/delete-rule";
import { getGroupMembers } from "../../lib/get-group-members";
import { getOrCreateGroup } from "../../lib/get-or-create-group";
import { getOrCreateUser } from "../../lib/get-or-create-user";
import { getRule } from "../../lib/get-rule";
import { listRules } from "../../lib/list-rules";
import { queryGroups } from "../../lib/query-group";
import { queryGroupMembers } from "../../lib/query-group-members";
import { initLogger } from "../../utils/telemtery";
import { beforeAll, describe, expect, it } from "bun:test";

initLogger("test");

describe("end to end suite", () => {
  beforeAll(() => {
    initLogger("test");
  });

  it("successfully creates groups via API", async () => {
    // GIVEN
    const params = { name: "Test", userManaged: true };

    // WHEN
    const created = await createGroup(params);
    const received = await getGroup(created.id);
    const deleted = await deleteGroup(created.id);

    // THEN
    expect(created.name).toEqual("Test");
    expect(created.createdAt).not.toBe(null);
    expect(created.updatedAt).not.toBe(null);
    expect(received).toEqual({ ...created, members: [] });
    expect(deleted).toEqual(created);
  });

  it("successfully lists all group members", async () => {
    // GIVEN
    const group_params = { name: "Test", userManaged: true };
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
    const group_params = { name: "Test", userManaged: true };
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
    const group_params = { name: "Test", userManaged: true };
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
    const group_1_params = { name: "Gold", userManaged: true };
    const group_2_params = { name: "Silver", userManaged: true };

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
    const group_1_params = { name: "Gold", userManaged: true };
    const group_2_params = { name: "Silver", userManaged: true };

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

  it("successfully creates rules", async () => {
    // GIVEN
    const rule: CreateRuleDTO = {
      name: "My Test Rule",
      description: "A test rule",
      condition: {
        and: [
          {
            attribute: "team",
            operation: "equals",
            value: "Gold Team",
          },
          {
            attribute: "title",
            operation: "contains",
            value: "Engineer",
          },
        ],
      },
    };

    // WHEN
    const created = await createRule(rule);

    // THEN
    expect(typeof created.id).toBe("string");
    expect(created.createdAt).not.toBeEmpty();
    expect(created.name).toEqual(rule.name);
    expect(created.description).toEqual(rule.description);
    expect(created.condition).toEqual(rule.condition);
  });

  it("successfully retrieves rules by ID", async () => {
    // GIVEN
    const rule: CreateRuleDTO = {
      name: "My Other Test Rule",
      description: "Another test rule",
      condition: {
        or: [
          {
            attribute: "title",
            operation: "equals",
            value: "Software Engineer",
          },
          {
            attribute: "title",
            operation: "equals",
            value: "Systems Engineer",
          },
        ],
      },
    };

    // WHEN
    const created = await createRule(rule);
    const received = await getRule(created.id);

    // THEN
    expect(received).toEqual(created);
  });

  it("successfully lists rules", async () => {
    // GIVEN
    const rule: CreateRuleDTO = {
      name: "Yet Another Test Rule",
      description: "Indeed, another test rule",
      condition: {
        and: [
          {
            attribute: "title",
            operation: "equals",
            value: "Software Engineer",
          },
          {
            or: [
              {
                attribute: "level",
                operation: "equals",
                value: "1",
              },
              {
                attribute: "level",
                operation: "equals",
                value: "2",
              },
            ],
          },
        ],
      },
    };

    await deleteAllRules();

    // WHEN
    const created = await createRule(rule);
    const received = await listRules();

    // THEN
    expect(received.length).toEqual(1);
    expect(received[0]).toEqual(created);
  });
});
