TARGETS: build run lint lintfix down up

down:
	docker compose down --remove-orphans

up:
	docker compose up -d

build:
	pnpm run build

run:
	pnpm run start

lint:
	pnpm run lint

lintfix:
	pnpm run lint-fix

