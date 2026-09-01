#!/usr/bin/env bash
# Build + tag the storefront image using apps/storefront/.env.build for
# build-time (NEXT_PUBLIC_*) args, then push.
set -euo pipefail

TAG="${1:-registry.tabeshelecshop.ir/storefront:v8}"
ENV_BUILD_FILE="apps/storefront/.env.build"

# Load .env.build into the shell so we can forward each var as --build-arg
set -a
source "$ENV_BUILD_FILE"
set +a

DOCKER_BUILDKIT=1 docker build \
  -f Dockerfile.storefront \
  --build-arg NEXT_PUBLIC_MEDUSA_BACKEND_URL \
  --build-arg NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY \
  --build-arg NEXT_PUBLIC_BASE_URL \
  --build-arg NEXT_PUBLIC_DEFAULT_REGION \
  --build-arg NEXT_PUBLIC_DEFAULT_REGION_ID \
  --build-arg NEXT_PUBLIC_DEFAULT_STORE_ID \
  --build-arg NEXT_PUBLIC_INCREDIBLE_OFFER_HANDLE \
  --build-arg NEXT_PUBLIC_SUBSCRIPTION_PRODUCT_SLUG \
  --build-arg NEXT_PUBLIC_FEATURE_SEARCH_ENABLED \
  --build-arg NEXT_PUBLIC_SEARCH_ENDPOINT \
  --build-arg NEXT_PUBLIC_SEARCH_API_KEY \
  --build-arg NEXT_PUBLIC_EMAIL_DOMAIN \
  --build-arg NEXT_PUBLIC_IMAGE_HOST_ADDRESS \
  -t "$TAG" \
  .

docker push "$TAG"