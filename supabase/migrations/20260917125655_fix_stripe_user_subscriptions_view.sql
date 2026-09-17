DROP VIEW stripe_user_subscriptions;

CREATE VIEW stripe_user_subscriptions WITH (security_invoker = true) AS
SELECT
    c.customer_id,
    s.subscription_id,
    s.status,
    s.trial_end,
    s.price_id,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    s.payment_method_brand,
    s.payment_method_last4
FROM stripe_customers c
LEFT JOIN stripe_subscriptions s ON c.customer_id = s.customer_id
WHERE c.user_id = auth.uid()
  AND c.deleted_at IS NULL
  AND s.deleted_at IS NULL;

GRANT SELECT ON stripe_user_subscriptions TO authenticated;
