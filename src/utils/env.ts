const environments = ["prod", "local", "test"] as const;

export type Environment = (typeof environments)[number];

export const isEnv = (env: string): env is Environment => environments.includes(env as Environment);

export const currentEnv = (): Environment => {
  return (process.env["ENV"] || "local") as Environment;
};

export const mustGetEnvVar = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Failed to get env var ${name}`);
  }
  return value;
};
