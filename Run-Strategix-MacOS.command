#!/usr/bin/env bash
set -euo pipefail

pause() {
  echo
  read -n 1 -s -r -p "Нажмите любую клавишу для выхода..."
  echo
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[ERROR] Команда '$1' не найдена."
    echo "$2"
    pause
    exit 1
  fi
}

require_cmd git  "Установите Xcode Command Line Tools (или Homebrew + git)."
require_cmd node "Установите Node.js (LTS): https://nodejs.org/"
require_cmd npm  "npm обычно ставится вместе с Node.js. Если его нет — переустановите Node.js."

REPO_URL="https://github.com/NiksorFront/Strategix.git"
BASE_DIR="$(cd "$(dirname "$0")" && pwd)"
TARGET_DIR="$BASE_DIR/Strategix"

if [[ ! -d "$TARGET_DIR" ]]; then
  echo "[INFO] Клонирую репозиторий в: $TARGET_DIR"
  git clone "$REPO_URL" "$TARGET_DIR"
else
  echo "[INFO] Папка уже существует: $TARGET_DIR"
fi

if [[ ! -d "$TARGET_DIR/.git" ]]; then
  echo "[ERROR] В папке нет .git. Удалите '$TARGET_DIR' и запустите снова."
  pause
  exit 1
fi

cd "$TARGET_DIR"

# --- Update from remote (safe)
echo "[INFO] Проверяю обновления репозитория..."
git remote update >/dev/null 2>&1 || true

if [[ -n "$(git status --porcelain)" ]]; then
  echo "[WARN] Есть незакоммиченные изменения. Авто-обновление (git pull) пропущено, чтобы избежать конфликтов."
  echo "       Закоммитьте/откатите изменения и запустите снова, если нужно подтянуть обновления."
else
  echo "[INFO] Подтягиваю изменения: git pull --rebase"
  # pull может потребовать авторизацию — это нормально
  git pull --rebase
fi

# --- Auto push only if we have local commits ahead of upstream
UPSTREAM="$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || true)"
if [[ -n "$UPSTREAM" ]]; then
  AHEAD_BEHIND="$(git rev-list --left-right --count "$UPSTREAM"...HEAD 2>/dev/null || echo "0 0")"
  BEHIND="$(echo "$AHEAD_BEHIND" | awk '{print $1}')"
  AHEAD="$(echo "$AHEAD_BEHIND" | awk '{print $2}')"

  if [[ "$AHEAD" != "0" ]]; then
    echo "[INFO] Есть локальные коммиты ($AHEAD) — пытаюсь сделать git push"
    set +e
    git push
    PUSH_EXIT=$?
    set -e
    if [[ $PUSH_EXIT -ne 0 ]]; then
      echo "[WARN] git push не удался (нет прав/не выполнен логин/конфликт на сервере)."
      echo "       Выполните push вручную после авторизации."
    fi
  else
    echo "[INFO] Локальных коммитов для push нет — пропускаю git push."
  fi
else
  echo "[WARN] Upstream ветка не настроена (нет @{u}). Push/pull по ветке может быть некорректен."
fi

# --- Frontend run
FRONTEND_DIR="$TARGET_DIR/frontend"
if [[ ! -f "$FRONTEND_DIR/package.json" ]]; then
  echo "[ERROR] Не найден frontend/package.json. Структура репозитория неожиданная."
  pause
  exit 1
fi

cd "$FRONTEND_DIR"

echo "[INFO] Устанавливаю зависимости..."
if [[ -f "package-lock.json" ]]; then
  set +e
  npm ci
  CI_EXIT=$?
  set -e
  if [[ $CI_EXIT -ne 0 ]]; then
    echo "[WARN] npm ci не удалось (lock-файл не синхронизирован). Перехожу на npm install..."
    npm install
  fi
else
  npm install
fi

echo "[INFO] Запуск dev-сервера..."
if [[ -x "node_modules/.bin/nuxi" ]]; then
  echo "[INFO] Nuxt обнаружен. Запускаю: npx nuxi dev"
  npx nuxi dev
else
  echo "[INFO] Запускаю: npm run dev"
  npm run dev
fi

pause
