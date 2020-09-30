FROM node:12.14-alpine

# Build environment variables
ARG SHEETS_URL
ARG ACCESS_KEY_ID
ARG SECRET_ACCESS_KEY
ARG REGION
ARG IMAGE_BUCKET

# Install system dependencies
# Add deploy user
RUN apk --no-cache --quiet add \
  dumb-init && \
  adduser -D -g '' deploy

WORKDIR /app

# Set the correct owner on the /app
RUN chown deploy:deploy $(pwd)

# Switch to less-privileged user
USER deploy

# Copy files required for installation of application dependencies
COPY --chown=deploy:deploy package.json yarn.lock ./

# Install application dependencies
RUN yarn install --frozen-lockfile --quiet && \
  yarn cache clean --force

# Copy application code
COPY --chown=deploy:deploy . ./

# Build application
RUN yarn build


ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["yarn", "start"]
