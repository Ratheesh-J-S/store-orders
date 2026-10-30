#!/usr/bin/env bash
# Fires 2..N simultaneous orders for the LAST unit of one product.
# Expect exactly one 201 and the rest 422. Requires `php artisan serve --host=127.0.0.1 --port=8000`
# and a DB that supports row locks (MySQL/Postgres) for a faithful demo.
set -euo pipefail
BASE=${BASE:-http://127.0.0.1:8000}
N=${N:-6}
PID=${PID_PRODUCT:-1}

# Reset the product to 1 unit.
php artisan tinker --execute="App\Models\Product::whereKey($PID)->update(['stock'=>1]);"

for i in $(seq 1 "$N"); do
  curl -s -o /dev/null -w "request $i -> HTTP %{http_code}\n" -X POST "$BASE/api/orders" \
    -H 'Content-Type: application/json' -H 'Accept: application/json' \
    -d "{\"email\":\"race$i@example.com\",\"name\":\"Race $i\",\"items\":[{\"product_id\":$PID,\"quantity\":1}]}" &
done
wait
php artisan tinker --execute="echo 'final stock: '.App\Models\Product::find($PID)->stock.PHP_EOL;"
