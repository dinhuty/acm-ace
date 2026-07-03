// AUTO-GENERATED from acm-tools/database sql-snippets. Do not edit by hand.

export type SqlSnippetSeed = { category: string; title: string; body: string };

export const sqlSnippetSeeds: SqlSnippetSeed[] = [
  {
    "category": "cart",
    "title": "clear",
    "body": "DELETE FROM mall.carts WHERE user_id = ${user_id};"
  },
  {
    "category": "cart",
    "title": "clear-store",
    "body": "Delete from mall.store_carts where user_id = ${user_id};"
  },
  {
    "category": "cart",
    "title": "reset-and-add-cart",
    "body": "-- Reset a user's rental + cart state, then re-seed the cart from one or\n-- more item_ids. Form fields:\n--   user_id  -> target users.id\n--   item_ids -> comma-separated list of items.id (e.g. \"524,522,546\"); each\n--               id gets one row inserted into mall.carts with count = 1\nUPDATE items SET count = 100 WHERE id IN (${item_ids});\nDELETE FROM mall.carts WHERE user_id = ${user_id};\nINSERT INTO mall.carts (user_id, item_id, count) VALUES (${user_id}, <item_id>, 1);\n-- ... one INSERT per item_id ...\nUPDATE rental_items SET cancel_flg = 1, stopped_at = NOW() WHERE user_id = ${user_id};\nDELETE FROM amazon_pay_rental_reservations WHERE user_id = ${user_id};"
  },
  {
    "category": "coupon",
    "title": "add-coupon",
    "body": "-- Insert a coupon row (only if its code does not exist yet), and optionally\nINSERT INTO coupons (code, coupon_name, type, distribution_type, discount_rate, discount_price,\n                     capacity, start_date, end_date, tv_flg)\nSELECT ${coupon_code}, 'Auto 70%', ${type}, ${distribution_type}, ${discount_rate}, ${discount_price}, 1000, SUBDATE(NOW(), 0), '2300-12-31', 0\nFROM DUAL\nWHERE NOT EXISTS (SELECT 1 FROM coupons WHERE code = ${coupon_code});\n\n-- Only when item_id is provided:\nINSERT INTO coupon_relations (coupon_id, item_id, rental_plan_id, store_id)\nVALUES ((SELECT id FROM coupons WHERE code = ${coupon_code} LIMIT 0, 1), ${item_id}, ${rental_plan_id}, ${store_id});"
  },
  {
    "category": "coupon",
    "title": "delete-coupon-relations-by-code",
    "body": "DELETE FROM coupon_relations\nWHERE coupon_id IN (SELECT id FROM coupons WHERE code = '${coupon_code}') and item_id=${item_id};"
  },
  {
    "category": "coupon",
    "title": "view-coupons-by-item",
    "body": "SELECT cr.coupon_id, c.capacity, c.code, c.type, c.distribution_type,cr.rental_plan_id\nFROM coupon_relations AS cr\nLEFT JOIN coupons AS c ON c.id = cr.coupon_id\nWHERE c.start_date <= NOW()\n  AND c.end_date >= NOW()\n  AND cr.item_id = ${item_id}\n  AND c.distribution_type = 1\nGROUP BY cr.coupon_id;"
  },
  {
    "category": "item",
    "title": "build-item-url-by-brand",
    "body": "-- Build the public mall URL for type=1 items by joining the brand slug.\n-- Form fields:\n--   domain   (optional, default 'https://mall.air-closet.com') -> base URL, no trailing slash.\n--   item_id  (optional) -> if blank, list all type=1 items.\nSELECT CONCAT(${domain}, '/brands/', b.name_en, '/items/', i.id) AS link,\n       i.id,\n       b.name_en\nFROM items AS i\nLEFT JOIN brands AS b ON b.id = i.brand_id\nWHERE i.type = 1\n  -- Only when item_id is provided:\n  AND i.id = ${item_id}\nORDER BY i.id ASC;"
  },
  {
    "category": "item",
    "title": "delete-item-campaigns",
    "body": "DELETE FROM item_campaigns WHERE item_id IN (${item_ids});"
  },
  {
    "category": "item",
    "title": "force-stock-0",
    "body": "UPDATE items SET count = 0 WHERE id IN (${item_ids});"
  },
  {
    "category": "item",
    "title": "force-stock-100",
    "body": "UPDATE items SET count = 100 WHERE id IN (${item_ids});"
  },
  {
    "category": "item",
    "title": "insert-item-campaign",
    "body": "INSERT INTO item_campaigns (item_id, request_volume, available_volume, request_start_date, request_end_date)\nVALUES (${item_id}, 1000, 1000, SUBDATE(NOW(), 7), ADDDATE(NOW(), 30));"
  },
  {
    "category": "item",
    "title": "insert-item-groups-bulk",
    "body": "-- Wire items 1, 2, 3 as \"type=2\" related items pointing at item 4. Adjust ids freely.\nINSERT INTO item_groups (item_id, related_item_id, type)\nVALUES (${item_id_1}, ${related_item_id}, ${type});"
  },
  {
    "category": "item",
    "title": "insert-item-price-history",
    "body": "-- Snapshot the current rental_price / original_price of an item into item_price_histories.\nINSERT INTO item_price_histories (item_id, rental_price, original_price, price_version)\nVALUES (${item_id},\n        (SELECT rental_price FROM items WHERE id = ${item_id}),\n        (SELECT original_price FROM items WHERE id = ${item_id}),\n        ${price_version});"
  },
  {
    "category": "item",
    "title": "top-items-last-90d",
    "body": "SELECT `item_id`, COUNT(`id`) AS `count`\nFROM `rental_items` AS `RentalItem`\nWHERE `RentalItem`.`cancel_flg` = 0\n  AND `RentalItem`.`started_at` >= DATE_FORMAT(SUBDATE(NOW(), ${day}), '%Y-%m-%d')\nGROUP BY `item_id`\nORDER BY COUNT(`id`) DESC, `RentalItem`.`item_id` DESC\nLIMIT 50;\n    "
  },
  {
    "category": "item",
    "title": "update-item-tag",
    "body": "UPDATE item_tags\nSET tag_id = ${tag_id}\nWHERE item_id = ${item_id}\n  AND price_version = ${price_version};"
  },
  {
    "category": "pricing",
    "title": "effective-price-for-item",
    "body": "SELECT i.id,\n       i.rental_price,\n       c.discount_rate,\n       c.discount_price,\n       rp.plan_price\nFROM items i\nLEFT JOIN coupon_relations cp ON i.id = cp.item_id AND cp.rental_plan_id IS NULL\nLEFT JOIN coupons c ON c.id = cp.coupon_id\n                   AND c.start_date <= NOW()\n                   AND c.end_date >= NOW()\n                   AND c.type = 1\n                   AND c.distribution_type = 1\nLEFT JOIN rental_plan_items AS rpi ON rpi.item_id = i.id\nLEFT JOIN rental_plans rp ON rp.id = rpi.item_id\n                         AND rp.start_date <= NOW()\n                         AND rp.end_date >= NOW()\nLEFT JOIN coupon_relations cprp ON i.id = cprp.item_id AND cprp.rental_plan_id = rp.id\nLEFT JOIN coupons crp ON crp.id = cprp.coupon_id\n                     AND crp.start_date <= NOW()\n                     AND crp.end_date >= NOW()\n                     AND crp.type = 1\n                     AND crp.distribution_type = 1\nWHERE i.id = ${item_id}\nORDER BY c.discount_rate DESC, c.discount_price DESC, rp.plan_price DESC;"
  },
  {
    "category": "pricing",
    "title": "item-discount-relation-insert",
    "body": "INSERT INTO item_discount_relations (item_discount_id, rental_item_id, discount_price)\nVALUES ((SELECT id FROM item_discounts WHERE item_id = ${item_id} LIMIT 1),\n        ${rental_item_id},\n        1000);"
  },
  {
    "category": "pricing",
    "title": "move-item-discount-away",
    "body": "UPDATE item_discount_by_rental_counts             SET item_id = ${new_item_id} WHERE item_id = ${item_id};\nUPDATE item_discount_by_purchased_rental_items    SET item_id = ${new_item_id} WHERE item_id = ${item_id};"
  },
  {
    "category": "pricing",
    "title": "rfid-discount-provision",
    "body": "-- Provision an ecrobo_item, link it to the rental, and attach a 50% RFID discount.\nINSERT INTO ecrobo_items (item_id, rfid, status)\nSELECT ri.item_id,\n       LPAD(CAST(COALESCE((SELECT CAST(ei.rfid AS UNSIGNED)\n                           FROM ecrobo_items ei\n                           WHERE ei.item_id = ri.item_id\n                           ORDER BY ei.id DESC\n                           LIMIT 1), 1000) + 1 AS CHAR), 24, '0') AS new_rfid,\n       2 AS status\nFROM rental_items ri\nWHERE ri.id = ${rental_item_id}\nORDER BY ri.id DESC\nLIMIT 1;\n\nINSERT INTO ecrobo_delivered_items (user_id, item_id, rental_item_id, user_shipping_id, count,\n                                    delivery_status, delivery_tracking_code, ecrobo_item_id)\nSELECT user_id,\n       item_id,\n       id,\n       user_id,\n       1,\n       2,\n       'sample-tracking-code',\n       (SELECT id FROM ecrobo_items WHERE item_id = rental_items.item_id ORDER BY id DESC LIMIT 0, 1)\nFROM rental_items\nWHERE id = ${rental_item_id};\n\nINSERT INTO item_rfid_discounts (rfid, discount_rate, discount_price, start_date, end_date)\nSELECT rfid, 50, 1000, '2025-07-15', '2300-12-31'\nFROM ecrobo_items ei\nINNER JOIN ecrobo_delivered_items edi ON edi.ecrobo_item_id = ei.id\nINNER JOIN rental_items ri ON ri.id = edi.rental_item_id\nWHERE ri.id = ${rental_item_id}\nLIMIT 1;"
  },
  {
    "category": "pricing",
    "title": "rfid-discount-provision-alt",
    "body": "-- Alternate RFID discount provisioning: 32-char RFID, ecrobo status=1, delivery_status=11, 50% rate / no floor.\n-- Idempotent: skip inserts when an ecrobo_items / ecrobo_delivered_items row already exists for the target rental.\nINSERT INTO ecrobo_items (item_id, rfid, status)\nSELECT ri.item_id,\n       LPAD(CAST(COALESCE((SELECT CAST(ei.rfid AS UNSIGNED)\n                           FROM ecrobo_items ei\n                           WHERE ei.item_id = ri.item_id\n                           ORDER BY ei.id DESC\n                           LIMIT 1), 0) + 1 AS CHAR), 32, '0') AS new_rfid,\n       1                                                       AS status\nFROM rental_items ri\nWHERE ri.id = ${rental_item_id}\n  AND NOT EXISTS (SELECT 1 FROM ecrobo_items ei2 WHERE ei2.item_id = ri.item_id)\nORDER BY ri.id DESC\nLIMIT 1;\n\nINSERT INTO ecrobo_delivered_items (user_id, item_id, rental_item_id, user_shipping_id, count, delivery_status,\n                                    delivery_tracking_code, ecrobo_item_id)\nSELECT ri.user_id,\n       ri.item_id,\n       ri.id,\n       ri.user_id,\n       1,\n       11,\n       '123456789',\n       (SELECT id FROM ecrobo_items WHERE item_id = ri.item_id ORDER BY id DESC LIMIT 0, 1)\nFROM rental_items ri\nWHERE ri.id = ${rental_item_id}\n  AND NOT EXISTS (SELECT 1 FROM ecrobo_delivered_items edi WHERE edi.rental_item_id = ri.id);\n\nINSERT INTO item_rfid_discounts (rfid, discount_rate, discount_price, start_date, end_date)\nSELECT rfid, 50, 0, '2025-01-01', '2300-01-01'\nFROM ecrobo_items ei\nINNER JOIN ecrobo_delivered_items edi ON edi.ecrobo_item_id = ei.id\nINNER JOIN rental_items ri ON ri.id = edi.rental_item_id\nWHERE ri.id = ${rental_item_id}\nLIMIT 1;"
  },
  {
    "category": "pricing",
    "title": "toggle-discount-relation-status",
    "body": "UPDATE item_discount_relations\nSET status = 2\nWHERE rental_item_id = ${rental_item_id};"
  },
  {
    "category": "pricing",
    "title": "view-buy-new-buy-reuse",
    "body": "SELECT id,\n       original_price,\n       rental_price,\n       (buy_new + ROUND(t.buy_new * 10))     AS buy_new_w_vat,\n       (buy_reuse + ROUND(t.buy_reuse * 10)) AS buy_reuse_w_vat\nFROM (\n    SELECT ri.id,\n           iph.original_price,\n           SUM(rit.price)                                                                              AS rental_price,\n           iph.original_price - SUM(rit.price)                                                         AS buy_new,\n           ROUND(iph.original_price - (iph.original_price - SUM(rit.price)) * iph.discount_rate / 100) AS buy_reuse\n    FROM rental_items ri\n    LEFT JOIN item_price_histories iph\n        ON iph.item_id = ri.item_id AND iph.price_version = ri.price_version\n    LEFT JOIN rental_item_transactions rit\n        ON rit.rental_item_id = ri.id AND rit.status IN (1, 4) AND rit.month <= iph.month_limit\n    WHERE ri.id = ${rental_item_id}\n) AS t;"
  },
  {
    "category": "purchase",
    "title": "reset-purchase",
    "body": "-- Strip the purchase rows for a rental but keep the rental itself alive.\nDELETE pi, pit, t\nFROM purchased_items pi\nLEFT JOIN purchased_item_transactions pit ON pit.purchased_item_id = pi.id\nLEFT JOIN transactions t ON t.id = pit.transaction_id\nWHERE pi.rental_item_id = ${rental_item_id};\n\nUPDATE rental_items\nSET delivery_status = 2,\n    stopped_at      = NULL\nWHERE id = ${rental_item_id};"
  },
  {
    "category": "purchase",
    "title": "view-latest-rit-per-purchased",
    "body": "SELECT rit.*\nFROM `purchased_items`\nINNER JOIN (\n    SELECT rit1.*\n    FROM rental_item_transactions rit1\n    INNER JOIN (\n        SELECT rental_item_id, MAX(id) AS id\n        FROM rental_item_transactions\n        GROUP BY rental_item_id\n    ) rit2 ON rit1.id = rit2.id\n) AS rit ON purchased_items.rental_item_id = rit.rental_item_id\nWHERE rit.rental_item_id = ${rental_item_id};"
  },
  {
    "category": "purchase",
    "title": "view-purchase-timeline",
    "body": "SELECT pi.id,\n       pi.rental_item_id,\n       pi.delivery_status,\n       pi.cancel_flg,\n       pi.created_at,\n       ri.next_started_at,\n       pit.traded_at AS pit_traded_at,\n       rit.traded_at AS rit_traded_at\nFROM purchased_items pi\nINNER JOIN rental_items ri ON ri.id = pi.rental_item_id\nINNER JOIN purchased_item_transactions pit ON pit.purchased_item_id = pi.id\nINNER JOIN rental_item_transactions rit ON rit.rental_item_id = pi.rental_item_id\nORDER BY rit.traded_at DESC;"
  },
  {
    "category": "recommendation",
    "title": "insert-item-shipping-fee",
    "body": "INSERT INTO item_shipping_fees (item_pack_size_id, transport_company_id, fee, start_date, end_date)\nVALUES ((SELECT item_pack_size_id    FROM items WHERE id = ${item_id} LIMIT 1),\n        (SELECT transport_company_id FROM items WHERE id = ${item_id} LIMIT 1),\n        500,\n        NULL,\n        NULL);"
  },
  {
    "category": "recommendation",
    "title": "move-categories-parent-id",
    "body": "UPDATE mall.categories\nSET parent_id = 0\nWHERE id IN (1,2,3);"
  },
  {
    "category": "recommendation",
    "title": "personalised-recommendation",
    "body": "SELECT `ri`.`item_id`,\n       ud.user_id,\n       ud.birthday,\n       ud.sex,\n       COUNT(DISTINCT (ri.id)) AS count\nFROM rental_items ri\nJOIN items i ON i.id = ri.item_id\nLEFT JOIN item_groups ig ON ig.item_id = i.id AND ig.type = '1'\nLEFT JOIN items similar_i ON similar_i.id = ig.related_item_id\nLEFT JOIN item_campaigns ic ON ic.item_id = i.id\nLEFT JOIN user_details ud ON ud.user_id = ri.user_id\nLEFT JOIN category_items ci ON ci.item_id = i.id\nWHERE (i.count > 0\n       OR similar_i.count > 0\n       OR (ic.request_volume > 0\n           AND ic.request_start_date <= DATE_FORMAT(NOW(), '%Y-%m-%d')\n           AND ic.request_end_date  >= DATE_FORMAT(NOW(), '%Y-%m-%d')))\n  AND i.status = 1\n  AND ri.started_at > DATE_FORMAT(SUBDATE(NOW(), 90), '%Y-%m-%d')\n  AND ud.user_id = ${user_id}\nGROUP BY `ri`.`item_id`\nORDER BY count DESC;"
  },
  {
    "category": "recommendation",
    "title": "questionnaire-answers-by-item",
    "body": "SELECT `QuestionnaireAnswer`.`answers`,\n       `QuestionnaireAnswer`.`created_at`,\n       `QuestionnaireAnswer`.`show_user_info`,\n       `QuestionnaireAnswer`.`rental_item_id`,\n       `QuestionnaireAnswer`.`item_id`,\n       `QuestionnaireAnswer`.`purchased_item_id`,\n       `UserDetail`.`nick_name`,\n       `UserDetail`.`sex`,\n       `UserDetail`.user_id,\n       CAST(FORMAT(DATEDIFF(CURRENT_DATE, birthday) / 365, 2) AS UNSIGNED) AS `age`\nFROM `questionnaire_answers` AS `QuestionnaireAnswer`\nINNER JOIN `user_details` AS `UserDetail`\n    ON `QuestionnaireAnswer`.`user_id` = `UserDetail`.`user_id`\nWHERE `QuestionnaireAnswer`.`item_id` IN (1,2,3)\n  AND `QuestionnaireAnswer`.`status` = 2\n  AND `QuestionnaireAnswer`.`item_review` IN (5)\n  AND `QuestionnaireAnswer`.`service_review` IN (5)\n  AND (`QuestionnaireAnswer`.`purchased_item_id` IS NOT NULL\n       OR `QuestionnaireAnswer`.`rental_item_id` IS NOT NULL);"
  },
  {
    "category": "recommendation",
    "title": "shipping-fee-resolver",
    "body": "SELECT i.id            AS item_id,\n       i.item_pack_size_id,\n       i.transport_company_id,\n       isf.id           AS item_shipping_fee_id,\n       isf.fee          AS shipping_fee,\n       isf.start_date,\n       isf.end_date,\n       isf.updated_at\nFROM items i\nLEFT JOIN item_shipping_fees isf\n    ON isf.item_pack_size_id = i.item_pack_size_id\n   AND isf.transport_company_id = i.transport_company_id\n   AND (isf.start_date IS NULL OR isf.start_date <= CURDATE())\n   AND (isf.end_date   IS NULL OR isf.end_date   >= CURDATE())\nWHERE i.id = ${item_id}\nORDER BY isf.updated_at DESC\nLIMIT 1;"
  },
  {
    "category": "recommendation",
    "title": "special-sale-candidates",
    "body": "SELECT ri.item_id,\n       COUNT(DISTINCT ri.id) AS rental_count,\n       GREATEST(\n           MAX(c.discount_rate),\n           MAX(c.discount_price / i.rental_price * 100),\n           COALESCE(MAX(cplan.discount_price / rp.plan_price * 100), 0),\n           COALESCE(MAX(cplan.discount_rate), 0)\n       ) AS discount_rate\nFROM rental_items AS ri\nJOIN items AS i ON i.id = ri.item_id\nLEFT JOIN coupon_relations AS cr ON cr.item_id = ri.item_id AND cr.rental_plan_id IS NULL\nLEFT JOIN coupons AS c\n    ON c.id = cr.coupon_id\n   AND c.distribution_type = 1 AND c.tv_flg = 0\n   AND c.start_date <= NOW() AND c.end_date >= NOW()\nLEFT JOIN rental_plan_items rpi ON rpi.item_id = i.id\nLEFT JOIN rental_plans rp\n    ON rp.id = rpi.rental_plan_id\n   AND rp.start_date <= CURDATE() AND rp.end_date >= CURDATE()\nLEFT JOIN coupon_relations AS crplan\n    ON crplan.item_id = ri.item_id AND crplan.rental_plan_id = rp.id\nLEFT JOIN coupons AS cplan\n    ON cplan.id = crplan.coupon_id\n   AND cplan.type = 1 AND cplan.distribution_type = 1\n   AND cplan.tv_flg = 0\n   AND cplan.start_date <= NOW() AND cplan.end_date >= NOW()\nWHERE ri.cancel_flg = 0\n  AND ri.started_at >= SUBDATE(NOW(), 90)\n  AND ri.item_id NOT IN (SELECT item_id FROM shop_site_items)\n  AND i.status = 1\nGROUP BY ri.item_id\nHAVING discount_rate > 30\nORDER BY discount_rate DESC, rental_count DESC, ri.item_id DESC\nLIMIT 50;"
  },
  {
    "category": "recommendation",
    "title": "top-categories-with-count",
    "body": "SELECT c.id, c.name_en, c.parent_id, COUNT(*) AS item_count\nFROM categories c\nLEFT JOIN category_items ci ON ci.category_id = c.id\nGROUP BY c.id;"
  },
  {
    "category": "recommendation",
    "title": "top-rented-last-90d",
    "body": "SELECT `item_id`, COUNT(`id`) AS `count`\nFROM `rental_items` AS `RentalItem`\nWHERE `RentalItem`.`cancel_flg` = 0\n  AND `RentalItem`.`started_at` >= DATE_FORMAT(SUBDATE(NOW(), 90), '%Y-%m-%d')\nGROUP BY `item_id`\nORDER BY COUNT(`id`) DESC, `RentalItem`.`item_id` DESC\nLIMIT 50;"
  },
  {
    "category": "recommendation",
    "title": "top-rented-per-category",
    "body": "SELECT `ri`.`item_id`,\n       COUNT(DISTINCT (ri.item_id)) AS count\nFROM rental_items ri\nJOIN items i ON i.id = ri.item_id\nLEFT JOIN item_groups ig ON ig.item_id = i.id AND ig.type = '1'\nLEFT JOIN items similar_i ON similar_i.id = ig.related_item_id\nLEFT JOIN item_campaigns ic ON ic.item_id = i.id\nWHERE ((i.count > 0 OR similar_i.count > 0\n        OR (ic.available_volume > 0\n            AND ic.request_start_date <= '2025-01-01'\n            AND ic.request_end_date   >= '2025-01-01')))\n  AND i.status = 1\n  AND i.recommend_display = 1\n  AND ri.started_at > '2025-01-01'\nGROUP BY `ri`.`id`\nORDER BY count DESC;"
  },
  {
    "category": "rental",
    "title": "add-amz-failed-transactions",
    "body": "UPDATE users\nSET default_payment_method = 2\nWHERE id = ${user_id};\n\nINSERT INTO rental_items (user_id, item_id, price_version, user_shipping_id, count,\n                          started_at, next_started_at,\n                          delivery_status, cancel_flg, rental_type, store_id)\nVALUES (${user_id}, 546, 1, 112, 1, NOW(), DATE_ADD(NOW(), INTERVAL 1 MONTH), 2, 0, 1, 1);\n\nINSERT INTO transactions (user_id, price, tax_price, tax, traded_at, type)\nVALUES (${user_id}, 3000, 300, 10, '2025-04-01', 1);\n\nINSERT INTO rental_item_transactions (user_id, price, original_price, tax, rental_item_id,\n                                      status, type, month, traded_at, transaction_id)\nVALUES (${user_id}, 3000, 10000, 10,\n        (SELECT id FROM rental_items ORDER BY id DESC LIMIT 1),\n        4, 2, 1, NOW(),\n        (SELECT id FROM transactions ORDER BY id DESC LIMIT 1));\n\nINSERT INTO transactions (user_id, price, tax_price, tax, traded_at, type)\nVALUES (${user_id}, 3000, 300, 10, '2025-04-01', 1);\n\nINSERT INTO rental_item_transactions (user_id, price, original_price, tax, rental_item_id,\n                                      status, type, month, traded_at, transaction_id)\nVALUES (${user_id}, 3000, 10000, 10,\n        (SELECT id FROM rental_items ORDER BY id DESC LIMIT 1),\n        8, 2, 2, NOW(),\n        (SELECT id FROM transactions ORDER BY id DESC LIMIT 1));"
  },
  {
    "category": "rental",
    "title": "add-new-rental",
    "body": "-- Insert a rental_items row, its first transaction + rental_item_transactions row,\n-- and an ecrobo_delivered_items row (delivery_status from the form, default 0,\n-- warehouse delivery tracking).\n-- When store_id > 1, also insert a store_rental_items row whose code is a random\n-- 5-digit string (zero-padded) and rental_item_id points to the rental_items row\n-- just created above.\n-- Form fields:\n--   user_id  -> target users.id\n--   item_id  -> target items.id\n--   store_id (optional, default 1) -> store assignment for the rental_items row;\n--                                     values > 1 trigger the extra store_rental_items INSERT.\n--   delivery_status (optional, default 0) -> ecrobo_delivered_items.delivery_status.\nINSERT INTO rental_items (user_id, item_id, price_version, user_shipping_id, count,\n                          started_at, next_started_at,\n                          delivery_status, cancel_flg, rental_type, store_id)\nVALUES (${user_id}, ${item_id}, 1, 112, 1, NOW(), ADDDATE(NOW(), 30), 2, 0, 1, ${store_id});\n\nINSERT INTO transactions (user_id, price, tax_price, tax, traded_at, type, order_id, gmo_tran_id, charge_id)\nVALUES (${user_id}, 3000, 300, 10, '2025-04-01', 1, 'TEST-ORDER-0001', 'TESTGMOTRAN0001', 'TEST-CHARGE-0001');\n\nINSERT INTO rental_item_transactions (user_id, price, original_price, tax, rental_item_id,\n                                      status, type, month, traded_at, transaction_id)\nVALUES (${user_id}, 3000, 10000, 10,\n        (SELECT id FROM rental_items ORDER BY id DESC LIMIT 1),\n        2, 1, 1, NOW(),\n        (SELECT id FROM transactions ORDER BY id DESC LIMIT 1));\n\nINSERT INTO ecrobo_delivered_items (user_id, item_id, rental_item_id, user_shipping_id, count, delivery_status)\nVALUES (${user_id}, ${item_id},\n        (SELECT id FROM rental_items ORDER BY id DESC LIMIT 1),\n        112, 1, ${delivery_status});\n\n-- Only when store_id > 1:\nINSERT INTO store_rental_items (code, rental_item_id, store_id)\nVALUES ('<random 5-digit>', (SELECT id FROM rental_items ORDER BY id DESC LIMIT 1), ${store_id});"
  },
  {
    "category": "rental",
    "title": "add-new-rentalItemTransaction",
    "body": "-- For a given rental, append N pairs of (transactions, rental_item_transactions),\n-- one per month from 1..${month_count}. Price and original_price are pulled from items;\n-- tax is fixed at 10 and RIT status is fixed at 4.\n-- Form fields:\n--   month_count    -> positive integer, how many monthly pairs to emit\n--   rental_item_id -> target rental_items.id\nINSERT INTO transactions (user_id, price, tax_price, tax, type, traded_at)\nSELECT ri.user_id, i.rental_price, FLOOR(i.rental_price * 10 / 110), 10,\n       u.default_payment_method, ri.started_at + INTERVAL <month_index> MONTH\nFROM rental_items ri\nJOIN items i ON i.id = ri.item_id\nJOIN users u ON u.id = ri.user_id\nWHERE ri.id = ${rental_item_id};\n\nINSERT INTO rental_item_transactions (user_id, price, original_price, tax, rental_item_id,\n                                      status, type, month, traded_at, transaction_id)\nSELECT ri.user_id, i.rental_price, i.original_price, 10, ri.id, 4,\n       u.default_payment_method, <month_index>,\n       ri.started_at + INTERVAL <month_index> MONTH,\n       (SELECT id FROM transactions ORDER BY id DESC LIMIT 1)\nFROM rental_items ri\nJOIN items i ON i.id = ri.item_id\nJOIN users u ON u.id = ri.user_id\nWHERE ri.id = ${rental_item_id};"
  },
  {
    "category": "rental",
    "title": "back-start-at",
    "body": "UPDATE rental_items\nSET started_at      = SUBDATE(NOW(), INTERVAL ${months_back} MONTH),\n    next_started_at = CURRENT_DATE,\n    delivery_status = 2,\n    stopped_at      = NULL\nWHERE id = ${rental_item_id};"
  },
  {
    "category": "rental",
    "title": "cancel-all-rentals",
    "body": "UPDATE rental_items\nSET cancel_flg = 1,\n    stopped_at = NOW()\nWHERE user_id = ${user_id};"
  },
  {
    "category": "rental",
    "title": "disable-rental-plan-penalty",
    "body": "UPDATE rental_items\nSET disable_rental_plan_penalty = 1\nWHERE id = ${rental_item_id};"
  },
  {
    "category": "rental",
    "title": "reset-rental",
    "body": "UPDATE rental_items\nSET expected_stopped_at = NULL,\n    started_at          = NULL,\n    next_started_at     = NULL,\n    delivery_status     = 2\nWHERE id = ${rental_item_id};"
  },
  {
    "category": "rental",
    "title": "run-penalty-batch",
    "body": "-- Backdate the rental + flip statuses so the penalty batch picks it up on the next tick.\nUPDATE rental_items AS r\nLEFT JOIN rental_penalty_transactions AS rpt ON rpt.rental_item_id = r.id\nLEFT JOIN ecrobo_returned_items AS eri ON eri.rental_item_id = r.id\nSET r.started_at          = NOW() - INTERVAL 30 DAY,\n    r.delivery_status     = 2,\n    r.expected_stopped_at = NOW(),\n    r.next_started_at     = NOW() - INTERVAL 90 DAY,\n    r.rental_plan_id      = 1,\n    rpt.status            = 2,\n    eri.return_status     = 1\nWHERE r.id = ${rental_item_id};"
  },
  {
    "category": "rental",
    "title": "set-started-today",
    "body": "-- Activate a rental_items row by setting started_at=CURRENT_DATE,\n-- next_started_at=+3 months, delivery_status=2.\n-- Form fields:\n--   rental_item_id (optional) -> target rental_items.id. If empty, falls back\n--                                to the latest row whose started_at IS NULL.\nUPDATE rental_items\nSET started_at      = CURRENT_DATE,\n    next_started_at = DATE_ADD(CURRENT_DATE, INTERVAL 3 MONTH),\n    delivery_status = 2\nWHERE id = ${rental_item_id};"
  },
  {
    "category": "rental",
    "title": "update-rit-status",
    "body": "UPDATE rental_item_transactions rit\nLEFT JOIN transactions rittx ON rittx.id = rit.transaction_id\nSET rit.status      = ${rental_item_transaction_status},\n    rittx.cancel_flg = 0,\n    rittx.traded_at = NOW(),\n    rit.created_at  = NOW()\nWHERE rit.id = 1;"
  },
  {
    "category": "rental_plan",
    "title": "delete-rental-plan-items",
    "body": "DELETE FROM rental_plan_items\nWHERE item_id = ${item_id}\n  AND rental_plan_id = 1;"
  },
  {
    "category": "rental_plan",
    "title": "insert-rental-plan",
    "body": "INSERT INTO mall.rental_plans (id, plan_price, plan_duration_month, start_date, end_date)\nVALUES ((SELECT max_id + 1 FROM (SELECT MAX(id) AS max_id FROM rental_plans) AS m),\n        4100, 3, '2025-07-15', '2300-12-31');"
  },
  {
    "category": "rental_plan",
    "title": "insert-rental-plan-items",
    "body": "INSERT INTO rental_plan_items (item_id, rental_plan_id)\nVALUES (${item_id}, 1);"
  },
  {
    "category": "rental_plan",
    "title": "view-rental-plans-by-item",
    "body": "SELECT rp.id,\n       rp.plan_duration_month,\n       rp.plan_price,\n       rpi.item_id,\n       rp.start_date,\n       rp.end_date\nFROM rental_plans rp\nLEFT JOIN rental_plan_items rpi ON rpi.rental_plan_id = rp.id\nWHERE rpi.item_id = ${item_id};"
  },
  {
    "category": "return",
    "title": "exit-return",
    "body": "UPDATE rental_items\nSET expected_stopped_at = NULL,\n    started_at          = NULL,\n    next_started_at     = NULL,\n    delivery_status     = 2\nWHERE id = ${rental_item_id};"
  },
  {
    "category": "return",
    "title": "fake-ship-method",
    "body": "UPDATE mall.ecrobo_returned_items t\nSET t.denpyo_no  = 'denpyo-12345',\n    t.trading_id = 'trade-12345',\n    t.reserve_no = 'reserve-12345'\nWHERE t.rental_item_id = ${rental_item_id};"
  },
  {
    "category": "return",
    "title": "finish-return",
    "body": "-- Seed an ecrobo_returned_items row only when this rental_item has none yet.\n-- rental_item_id is a non-unique index, so INSERT IGNORE / ON DUPLICATE KEY can't gate this.\n-- returned_item_id has no natural source here; reuse item_id as a dev placeholder.\nINSERT INTO ecrobo_returned_items\n  (user_id, item_id, rental_item_id, returned_item_id, user_shipping_id)\nSELECT ri.user_id, ri.item_id, ri.id, ri.item_id, ri.user_shipping_id\nFROM rental_items AS ri\nWHERE ri.id = ${rental_item_id}\n  AND NOT EXISTS (\n    SELECT 1 FROM ecrobo_returned_items AS eri\n    WHERE eri.rental_item_id = ri.id\n  );\n\nUPDATE `ecrobo_returned_items` AS cri\nLEFT JOIN rental_items AS ri ON cri.rental_item_id = ri.id\nSET cri.`reserve_no`     = NULL,\n    cri.`reserve_pwd`    = 'pwd-12345',\n    cri.`trading_id`     = 'trade-12345',\n    cri.`return_flg`     = 1,\n    cri.`expired_at`     = ADDDATE(ri.next_started_at, 7),\n    cri.`denpyo_no`      = 'denpyo-12345',\n    ri.`expected_stopped_at` = ADDDATE(ri.next_started_at, 14),\n    ri.`stopped_at`      = NOW(),\n    ri.`delivery_status` = 5\nWHERE ri.`id` = ${rental_item_id};"
  },
  {
    "category": "store",
    "title": "insert-store-cart-items",
    "body": "INSERT INTO mall.store_carts (user_id, item_id, count, store_id) VALUES (${user_id}, ${item_id_1}, 1, 1);\nINSERT INTO mall.store_carts (user_id, item_id, count, store_id) VALUES (${user_id}, ${item_id_2}, 1, 1);\nINSERT INTO mall.store_carts (user_id, item_id, count, store_id) VALUES (${user_id}, ${item_id_3}, 1, 1);"
  },
  {
    "category": "store",
    "title": "provision-store-item-price-histories",
    "body": "INSERT INTO store_item_price_histories\n    (store_id, item_id, price_version, tag_id,\n     rental_price, original_price, month_limit, discount_rate, discount_price)\nSELECT si.store_id,\n       si.item_id,\n       si.price_version,\n       1  AS tag_id,\n       si.rental_price,\n       si.original_price,\n       12  AS month_limit,\n       50 AS discount_rate,\n       1000  AS discount_price\nFROM store_items si\nWHERE si.store_id = 1\n  AND si.item_id IN (${item_id_1}, ${item_id_2}, ${item_id_3})\n  AND NOT EXISTS (\n      SELECT 1 FROM store_item_price_histories h\n      WHERE h.store_id      = si.store_id\n        AND h.item_id       = si.item_id\n        AND h.price_version = si.price_version\n  );"
  },
  {
    "category": "store",
    "title": "provision-store-items",
    "body": "INSERT INTO store_items\n    (store_id, item_id, store_item_is_active, price_version,\n     store_item_barcode, rental_price, original_price)\nSELECT 1                  AS store_id,\n       i.id               AS item_id,\n       1                  AS store_item_is_active,\n       i.price_version,\n       CAST(i.id AS CHAR) AS store_item_barcode,\n       i.rental_price,\n       i.original_price\nFROM items i\nWHERE i.id IN (${item_id_1}, ${item_id_2}, ${item_id_3})\n  AND NOT EXISTS (\n      SELECT 1 FROM store_items si\n      WHERE si.store_id = 1 AND si.item_id = i.id\n  );"
  },
  {
    "category": "store",
    "title": "reset-store-cart-for-user",
    "body": "DELETE FROM mall.store_carts WHERE user_id = ${user_id};"
  },
  {
    "category": "user",
    "title": "bulk-update-birthday",
    "body": "-- Bulk-seed an age cohort across user_details. Adjust the YEAR offset as needed.\nUPDATE user_details\nSET birthday = SUBDATE(NOW(), INTERVAL 18 YEAR)\nWHERE user_id > ${user_id};"
  },
  {
    "category": "user",
    "title": "find-airtouch-pending",
    "body": "-- Users with an airtouch rental in delivery_status=4 and not yet started.\nSELECT u.id, u.email, r.cancel_flg, r.id AS rental_item_id\nFROM users AS u\nLEFT JOIN rental_items AS r ON r.user_id = u.id\nLEFT JOIN items AS i ON i.id = r.item_id\nWHERE r.delivery_status = 2\n  AND r.cancel_flg = 0\n  AND i.airtouch = 1\n  AND r.started_at IS NULL\nGROUP BY u.id, r.id\nORDER BY r.id DESC;"
  },
  {
    "category": "user",
    "title": "find-by-amazon-sns",
    "body": "-- Look up users that have linked an Amazon Pay SNS account.\nSELECT u.id,\n       u.email,\n       d.id AS user_detail_id,\n       d.first_name,\n       d.tel,\n       d.post_code,\n       d.city,\n       u.created_at  AS u_created,\n       us.created_at AS us_created\nFROM users AS u\nLEFT JOIN user_details AS d ON d.user_id = u.id\nLEFT JOIN user_sns AS us ON us.user_id = u.id\nWHERE us.sns_id = 'amzn-sample-sns-id'\nORDER BY u.id DESC\nLIMIT 0, 50;"
  },
  {
    "category": "user",
    "title": "find-by-payment-method",
    "body": "-- Users whose default_payment_method=2 with incomplete details (tel / post_code missing).\nSELECT u.id,\n       u.email,\n       d.first_name,\n       d.tel,\n       d.post_code,\n       d.city,\n       u.created_at  AS u_created,\n       us.created_at AS us_created\nFROM users AS u\nLEFT JOIN user_details AS d ON d.user_id = u.id\nLEFT JOIN user_sns AS us ON us.user_id = u.id\nWHERE u.default_payment_method = 2\n  AND (d.tel = '' OR d.tel IS NULL OR d.post_code = '' OR d.post_code IS NULL)\nORDER BY u.id DESC\nLIMIT 0, 50;"
  },
  {
    "category": "user",
    "title": "list-users-with-rental-count",
    "body": "-- Per-user counts of rentals and matching item_discount_by_rental_counts rows.\nSELECT u.id,\n       u.email,\n       r.cancel_flg,\n       r.id              AS rental_item_id,\n       COUNT(d.id)       AS count_rental_count,\n       COUNT(t.id)       AS rental_count\nFROM users AS u\nLEFT JOIN rental_items AS r ON r.user_id = u.id\nLEFT JOIN items AS i ON i.id = r.item_id\nLEFT JOIN item_discount_by_rental_counts AS d ON d.item_id = r.item_id\nLEFT JOIN rental_item_transactions AS t ON t.rental_item_id = r.id\nWHERE r.delivery_status = 2\n  AND r.cancel_flg = 0\n  AND r.started_at IS NOT NULL\nGROUP BY u.id, r.id\nORDER BY r.id DESC;"
  },
  {
    "category": "user",
    "title": "reset-transactions",
    "body": "-- Reset all transaction-related state for a user. Form fields:\n--   user_id -> target users.id\n-- Deletes junction rows first (FK children of transactions), then the\n-- transactions themselves, then the rental_items / purchase_items that\n-- the junction tables used to reference. Junction tables don't carry\n-- user_id directly, so they're scoped via JOIN on transactions.user_id.\nDELETE d FROM store_rental_item_documents d LEFT JOIN rental_items r ON d.rental_item_id = r.id WHERE r.user_id = ${user_id};\nDELETE s FROM store_rental_items s LEFT JOIN rental_items r ON s.rental_item_id = r.id WHERE r.user_id = ${user_id};\nDELETE rit\nFROM rental_item_transactions rit\nJOIN transactions t ON t.id = rit.transaction_id\nWHERE t.user_id = ${user_id};\n\nDELETE pit\nFROM purchased_item_transactions pit\nJOIN transactions t ON t.id = pit.transaction_id\nWHERE t.user_id = ${user_id};\n\nDELETE rpt\nFROM rental_penalty_transactions rpt\nJOIN transactions t ON t.id = rpt.transaction_id\nWHERE t.user_id = ${user_id};\n\nDELETE FROM transactions WHERE user_id = ${user_id};\nDELETE FROM rental_items WHERE user_id = ${user_id};\nDELETE FROM purchased_items WHERE user_id = ${user_id};\nDELETE FROM ecrobo_delivered_items WHERE user_id = ${user_id};\nDELETE FROM ecrobo_returned_items WHERE user_id = ${user_id};"
  },
  {
    "category": "user",
    "title": "reset-user-address",
    "body": "-- Marks a target user_details / user_shippings row as the canonical test address.\nupdate users set email='test@test.com' where email like 'd.vuong+@air-closet.com';\nupdate user_details\nset tel='08001236364', post_code='3-1-42', verified_account='10000023142', last_name='a'\nwhere tel = '08001236363' or post_code='3-1-41' or verified_account = '10000003141' or verified_account = '10000013141' or (`last_name` = '太一' AND `first_name` = '井上' AND `birthday` = '1985-12-01');\nupdate user_shippings\nset tel='08001236364', post_code='3-1-42', verified_account='10000023142', last_name='a'\nwhere tel = '08001236363' or post_code='3-1-41' or verified_account = '10000003141' or verified_account = '10000013141' or (`last_name` = '太一' AND `first_name` = '井上' );"
  },
  {
    "category": "user",
    "title": "update-default-payment-method",
    "body": "UPDATE users\nSET default_payment_method = ${default_payment_method}\nWHERE id = ${user_id};"
  },
  {
    "category": "user",
    "title": "update-sns-id",
    "body": "-- Rewrite user_sns.sns_id for the first user whose default_payment_method=2.\nUPDATE user_sns\nSET sns_id = '${sns_id}'\nWHERE user_id = ${user_id};"
  }
];
