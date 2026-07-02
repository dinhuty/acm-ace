#!/usr/bin/env bash
# run.sh — đầu mối duy nhất cho các tác vụ thường dùng của dự án.
#
# Cách dùng:
#   bash run.sh <lệnh> [tham số...]
#   ./run.sh <lệnh> [tham số...]      (sau khi `chmod +x run.sh`)
#
# Bao bọc yarn, Docker Compose và Drizzle để cùng một tên lệnh chạy được
# cả ở máy local lẫn CI.

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

CMD="${1:-help}"
shift || true

load_env_local() {
  # Export biến từ .env.local để drizzle-kit / tsx thấy DATABASE_URL.
  if [[ -f ".env.local" ]]; then
    set -a
    # shellcheck disable=SC1091
    source ./.env.local
    set +a
  fi
}

require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "Lỗi: không tìm thấy Docker trong PATH." >&2
    echo "Cài Docker Desktop: https://docs.docker.com/get-docker/" >&2
    exit 1
  fi
}

cmd_help() {
  cat <<'EOF'
Cách dùng: bash run.sh <lệnh> [tham số...]

Vòng đời app (chạy trực tiếp trên máy):
  start              yarn dev trên HOST (http://localhost:3021)
  build              next build
  prod               yarn build && yarn start
  lint               yarn lint
  typecheck          yarn typecheck (tsc --noEmit)
  verify             yarn lint && yarn typecheck

Dev trong Docker (hot reload, mount source vào container):
  up [-d]            Chạy app (yarn dev) + db trong Docker, tự reload khi sửa code.
                     KHÔNG cần build lại image mỗi lần đổi code.
  up:build           Như `up` nhưng build lại image dev trước (khi sửa Dockerfile).
  down [-v]          Dừng stack dev (thêm -v để xoá luôn volume node_modules/.next/db).

Database (Postgres trong Docker + Drizzle):
  db                 Bật container Postgres (localhost:5450, user/db = postgres/zen).
  db:stop            Dừng container Postgres.
  generate           Sinh file migration SQL từ db/schema.ts (drizzle-kit generate).
  migrate            Áp dụng các migration đang chờ (drizzle-kit migrate).
  seed               Chạy db/seed.ts để nạp template khởi đầu (tsx).

Deploy:
  deploy             Build + chạy toàn bộ stack (app + db) ở local qua Docker Compose.
                     Service `migrate` sẽ tự chạy migration + seed trước khi app khởi động.
  deploy-prd [branch]  Copy .env.production -> .env trên server, rồi git pull (mặc định: main)
                     + build lại stack. Đọc SSH_SERVER/USER/PASSWORD từ .env (cần sshpass).

  help               Hiện thông báo này.
EOF
}

cmd_start()     { yarn dev; }
cmd_build()     { yarn build; }
cmd_prod()      { yarn build && yarn start; }
cmd_lint()      { yarn lint; }
cmd_typecheck() { yarn typecheck; }
cmd_verify()    { yarn verify; }

# Hai file compose: base (prod) + override dev. Dùng cho các lệnh up/down.
DEV_FILES=(-f docker-compose.yml -f docker-compose.dev.yml)

cmd_up() {
  require_docker
  docker compose "${DEV_FILES[@]}" up "$@"
}

cmd_up_build() {
  require_docker
  docker compose "${DEV_FILES[@]}" up --build "$@"
}

cmd_down() {
  require_docker
  docker compose "${DEV_FILES[@]}" down "$@"
}

cmd_db() {
  require_docker
  docker compose up -d db
  echo "Postgres đang khởi động ở localhost:5450 (user=postgres db=zen)."
}

cmd_db_stop() {
  require_docker
  docker compose stop db
}

cmd_generate() {
  load_env_local
  yarn db:generate
}

cmd_migrate() {
  load_env_local
  yarn db:migrate
}

cmd_seed() {
  load_env_local
  yarn db:seed
}

cmd_deploy() {
  require_docker
  echo "→ docker compose up -d --build (migrate + seed chạy trước, rồi tới app)"
  docker compose up -d --build
  echo "App:      http://localhost:3021"
  echo "Postgres: localhost:5450"
}

# Đọc một dòng KEY=VALUE từ .env mà KHÔNG source cả file (file có thể chứa
# những dòng không phải KEY=VALUE mà `source` sẽ cố thực thi gây lỗi).
read_env_var() {
  local key="$1"
  # Chỉ bóc cặp nháy bao ngoài nếu KHỚP (giữ nguyên nháy là ký tự thật).
  # `|| true` ở cuối: thiếu key làm grep trả mã 1, dưới `set -o pipefail` sẽ
  # khiến script thoát trước khi hàm gọi kịp kiểm tra giá trị rỗng.
  grep -E "^${key}=" .env 2>/dev/null | tail -1 | cut -d= -f2- | tr -d '\r' \
    | sed -E -e 's/^"(.*)"$/\1/' -e "s/^'(.*)'\$/\1/" || true
}

# Thư mục đích khi deploy lên server (tương đối so với home của SSH user).
REMOTE_DIR="acm-tool"

cmd_deploy_prd() {
  local branch="${1:-main}"
  local env_prod=".env.production"

  [[ -f "$env_prod" ]] || { echo "Lỗi: không thấy $env_prod (tạo file này trên máy bạn)." >&2; exit 1; }
  command -v sshpass >/dev/null 2>&1 || { echo "Lỗi: chưa cài sshpass (macOS: brew install hudochenkov/sshpass/sshpass)." >&2; exit 1; }

  local ssh_host ssh_user ssh_pass
  ssh_host="$(read_env_var SSH_SERVER)"
  ssh_user="$(read_env_var SSH_USER)"
  ssh_pass="$(read_env_var SSH_PASSWORD)"
  [[ -n "$ssh_host" && -n "$ssh_user" && -n "$ssh_pass" ]] \
    || { echo "Lỗi: cần đặt SSH_SERVER / SSH_USER / SSH_PASSWORD trong .env." >&2; exit 1; }

  # sshpass đọc mật khẩu từ biến SSHPASS (-e) để không lộ ra trong `ps`.
  export SSHPASS="$ssh_pass"

  echo "→ Copy $env_prod → server ~/$REMOTE_DIR/.env…"
  sshpass -e scp -o StrictHostKeyChecking=accept-new "$env_prod" "$ssh_user@$ssh_host:$REMOTE_DIR/.env"

  echo "→ git pull ($branch) + build lại trên server (migrate + seed tự chạy)…"
  sshpass -e ssh -o StrictHostKeyChecking=accept-new "$ssh_user@$ssh_host" \
    "set -e; cd \"$REMOTE_DIR\" && git fetch origin && git checkout -f -B \"$branch\" \"origin/$branch\" && docker compose up -d --build && docker compose ps"

  unset SSHPASS
  echo "Xong. App: http://$ssh_host:${APP_PORT:-3021} · Postgres: $ssh_host:${DB_PORT:-5450}"
}

case "$CMD" in
  start|dev)      cmd_start ;;
  up)             cmd_up "$@" ;;
  up:build)       cmd_up_build "$@" ;;
  down)           cmd_down "$@" ;;
  build)          cmd_build ;;
  prod)           cmd_prod ;;
  lint)           cmd_lint ;;
  typecheck)      cmd_typecheck ;;
  verify)         cmd_verify ;;
  db)             cmd_db ;;
  db:stop)        cmd_db_stop ;;
  generate)       cmd_generate ;;
  migrate)        cmd_migrate ;;
  seed)           cmd_seed ;;
  deploy)         cmd_deploy ;;
  deploy-prd)     cmd_deploy_prd "$@" ;;
  help|-h|--help) cmd_help ;;
  *)
    echo "Lệnh không hợp lệ: $CMD" >&2
    echo >&2
    cmd_help >&2
    exit 1
    ;;
esac
