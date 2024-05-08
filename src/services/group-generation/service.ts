import type { CreateRuleDTO } from "../../api/models";
import type { Datastore } from "../../datastore";
import type { User } from "../../domain";
import { capWords } from "../../utils/domain";

type GeneratedGroup = {
  [key: string]: {
    users: User[];
    rule: CreateRuleDTO;
  };
};

export class GroupGenerationService {
  private db: Datastore;

  constructor(db: Datastore) {
    this.db = db;
  }

  async generateByAttribute(attrName: string): Promise<GeneratedGroup> {
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
          users: users ?? [],
          rule: {
            name: `${capWords(attrName)} ${bucket}`,
            description: `Users whose '${attrName}' is '${bucket}'`,
            condition: {
              attribute: attrName,
              operation: "equals",
              value: bucket,
            },
          },
        },
      };
    }, {} as GeneratedGroup);
  }
}
