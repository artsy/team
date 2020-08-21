FROM node:alpine

# Build environment variables
ARG SHEETS_URL
ARG ACCESS_KEY_ID
ARG SECRET_ACCESS_KEY
ARG REGION
ARG IMAGE_BUCKET

WORKDIR /app

# Install system dependencies
# Add deploy user
RUN apk --no-cache --quiet add \
  dumb-init && \
  adduser -D -g '' deploy

# Copy files required for installation of application dependencies
COPY package.json yarn.lock ./

# Install application dependencies
RUN yarn install --frozen-lockfile --quiet

# Copy application code
COPY . ./

# Build application
# Update file/directory permissions
RUN yarn build && chown -R deploy:deploy ./

# Switch to less-privileged user
USER deploy

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["yarn", "start"]
