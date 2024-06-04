# Grouper

An application to make and manage user groups.

## Tech Stack

- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Runtime**: [Bun](https://bun.sh/)
- **Database**: [Postgres](https://www.postgresql.org/)
- **Cache**: [Redis](https://redis.io/)

## Development

### Developer Tooling

You will need TypeScript and Bun installed in order to contribute to development.

With these installed, run

```shell
bun install
```

to install the application and development dependencies.

After setup is complete, check the [package.json](./package.json) file for the
available scripts, which can be run with `bun run <script_name>`. For example,
here are the some core scripts:

```shell
bun run build # build the application locally and compile to ./app
bun run start # run the application locally, directly from TypeScript
bun run lint # lint the codebase using Prettier, ESLint, and TSC
bun run format # format the codebase using Prettier
bun run test:unit # run unit tests
bun run test:integration # run integration tests, optionally add `:docker` to include the docker setup
bun run test:e2e # run end-to-end tests, optionally add `:docker` to include the docker setup
```

We leverage [Prettier](https://prettier.io/) for formatting and [ESLint](https://eslint.org/) for linting.
View their respective configs [here](./.prettierrc.json) and [here](./.eslintrc.json). This repository is
using [Husky](https://typicode.github.io/husky/) for git hooks, which currently triggers Prettier and
ESLint on staged files as a pre-commit task.

### Running locally

To run the application, you will also need [Docker](https://docs.docker.com/) installed on your machine.

The application can be run directly on your machine or via container.

To run the full app via container, simply use [docker compose](https://docs.docker.com/compose/):

```shell
docker compose up
```

Pass the `-d` flag to run in detached mode or `--build` to ensure the containers are
rebuilt. You can view the current Dockerfile [here](./Dockerfile) and the compose
configuration [here](./docker-compose.yml).

To run the app directly on your machine, you can either run it directly from
TypeScript or by building and compiling. In either case, you will need a database
available for connection. The app expects connection parameters to be available
in the environment, which are currently stored in a [.env](./.env) file.

To run without compiling:

```shell
source .env
docker compose up database -d # Start _only_ the database container
bun run start
```

To run with compiling:

```shell
source .env
bun run build
docker compose up database -d
./app
```

On successful start, you should see logs like this:

```
[17:05:57.161] INFO (90268): starting application
    config: {
      "host": "0.0.0.0",
      "port": 3001
    }
[17:05:57.164] INFO (90268): connecting to database
[17:05:57.176] DEBUG (90268): looking for sql migration files
    migrationDir: "/<path>/src/migrations"
[17:05:57.177] DEBUG (90268): found sql migration files
    upPaths: [
      "/<path>/src/migrations/000001_core.up.sql"
    ]
    downPaths: [
      "/<path>/src/migrations/000001_core.down.sql"
    ]
[17:05:57.184] INFO (90268): executing migration
    migration: "000001_core.up.sql"
[17:05:57.204] INFO (90268): successfully executed migration
    migration: "000001_core.up.sql"
[17:05:57.208] INFO (90268): successfully completed database migrations
[17:05:57.208] INFO (90268): registering routes
[17:05:57.208] INFO (90268): starting http server
[17:05:57.213] INFO (90268): listening on 0.0.0.0:3001
```

You can then run a simple `curl` command to get a response back:

```shell
curl http://localhost:3001/health
#> {"message":"Ok"}
```

### Using the Service

There is currently only a CLI available for interaction, which can be built from
source using the command `bun run build:cli` to produce an executable `./cli`.

Call the CLI to get help information:

```shell
./cli
# Usage: grouper [options] [command]

# Manage user groups

# Options:
#   -V, --version   output the version number
#   -h, --help      display help for command

# Commands:
#   users           Manage user entities
#   groups          Manage group entities
#   group           Manage a single group
#   help [command]  display help for command
```
