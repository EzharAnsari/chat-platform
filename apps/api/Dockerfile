FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

# copy workspace files
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY package.json .

# IMPORTANT: copy root tsconfig
COPY tsconfig.base.json ./
COPY prisma.config.ts ./

# copy packages + prisma + apps
COPY packages ./packages
COPY prisma ./prisma
COPY apps ./apps

# install dependencies
RUN pnpm install --frozen-lockfile

# ensure api deps are installed
#RUN pnpm --filter api install

# generate prisma client
RUN pnpm exec prisma generate

# build api
RUN pnpm --filter api build

EXPOSE 3000

#CMD ["node", "apps/api/dist/server.js"]

# CMD ["node", "apps/api/dist/apps/api/src/server.js"]
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node apps/api/dist/apps/api/src/server.js"]
