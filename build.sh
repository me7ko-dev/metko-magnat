#!/bin/sh
# Събира index.html (пълна страница за браузър / GitHub Pages) от game.html
cd "$(dirname "$0")"
{
  printf '<!doctype html>\n<html lang="bg">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<meta name="theme-color" content="#113A28">\n</head>\n<body>\n'
  cat game.html
  printf '\n</body>\n</html>\n'
} > index.html
