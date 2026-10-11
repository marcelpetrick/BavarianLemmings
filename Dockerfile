# SPDX-FileCopyrightText: 2026 Marcel Petrick <mail@marcelpetrick.it>
# SPDX-License-Identifier: GPL-3.0-or-later
#
# BavarianLemmings as a container (vision P-03, plan M7.01).
# Stage 1 builds the static site with the pinned tools from package-lock.json.
# Stage 2 serves dist/ with nginx. The game has no backend.
#
# Build: docker build -t bavarianlemmings .
# Run:   docker run --rm -p 8080:80 bavarianlemmings   then open http://localhost:8080

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-fund --no-audit
COPY . .
RUN npx --no-install vite build --logLevel warn

FROM nginx:alpine
LABEL org.opencontainers.image.title="BavarianLemmings" \
      org.opencontainers.image.description="Unofficial browser homage to the 1991 DOS game Lemmings, with a Bavarian mode" \
      org.opencontainers.image.source="https://github.com/marcelpetrick/BavarianLemmings" \
      org.opencontainers.image.licenses="GPL-3.0-or-later"
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
