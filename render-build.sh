#!/usr/bin/env bash
set -o errexit

npm install

# Chromium'u elle indir
npx puppeteer browsers install chrome

# İndirilen Chromium'un gerçekten var olup olmadığını kontrol et
ls -l $PUPPETEER_CACHE_DIR || echo "Puppeteer cache directory not found!"

# Puppeteer cache işlemleri
if [[ -d $XDG_CACHE_HOME/puppeteer/ ]]; then
  echo "...Copying Puppeteer Cache from Build Cache"
  cp -R $XDG_CACHE_HOME/puppeteer/ $PUPPETEER_CACHE_DIR || true
else
  echo "...No Puppeteer cache found in build cache"
fi

if [[ -d $PUPPETEER_CACHE_DIR ]]; then
  echo "...Storing Puppeteer Cache in Build Cache"
  cp -R $PUPPETEER_CACHE_DIR $XDG_CACHE_HOME || true
else
  echo "...No Puppeteer cache to store in build cache"
fi