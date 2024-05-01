import type { User } from "../../domain";
import type { Rule } from "../../domain/rule";
import type { Datastore } from "../datastore";

export class GroupGenerationService {
  private db: Datastore;

  constructor(db: Datastore) {
    this.db = db;
  }

  async generateByAttribute(attrName: string): Promise<Partial<Record<string, User[]>>> {
    const allUsers = await this.db.listUsers();

    // TODO: Consider converting this to a SQL GROUP BY instead of doing it in code
    const buckets = Object.groupBy(allUsers, ({ attributes }) => {
      const val = new Map(Object.entries(attributes)).get(attrName) as unknown;
      if (typeof val === undefined) {
        return "missing"; // TODO: Improve
      }

      if (typeof val !== "string") {
        return "invalid"; // TODO: Improve
      }

      return val;
    });

    return Object.entries(buckets).reduce((prev, [bucket, users]) => {
      return {
        ...prev,
        [bucket]: {
          users,
          rule: {
            name: `${attrName} ${bucket}`,
            description: `Users whose ${attrName} is '${bucket}'`,
            userManaged: false,
            type: "simple",
            condition: {
              attribute: attrName,
              operation: "equals",
              value: bucket,
            },
          } as Rule<"simple">,
        },
      };
    }, {});

    // for (const [i, bucket] of Object.keys(buckets).entries()) {
    //   const rule: Rule<"simple"> = {
    //     id: i,
    //     name: `${attrName} ${bucket}`,
    //     description: `Users whose ${attrName} is ${bucket}`,
    //     userManaged: false,
    //     type: "simple",
    //     condition: {
    //       attribute: attrName,
    //       operation: "equals",
    //       value: bucket,
    //     },
    //   };

    //   logger.info({ bucket, rule }, "would generate rule");
    // }

    // return buckets;
  }

  // for (const [bucket, users] of Object.entries(userBuckets)) {
  //   if (["invalid", "missing"].includes(bucket)) {
  //     return;
  //   }

  //   const us = users || [];
  //   const g = { name: bucket } as CreateGroupDTO;
  //   const group = await this.db.createGroup(g);
  //   for (const user of us) {
  //     await this.db.addGroupMember(group.id, user.id);
  //   }
  // }
}
