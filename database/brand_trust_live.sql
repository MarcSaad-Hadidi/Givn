SELECT
  b.id,
  b.id AS brand_id,
  b.slug,
  b.name,
  b.website,
  b.logo_url,
  b.category,
  b.claim,
  b.description,
  count(p.id) FILTER (
    WHERE
      (p.status = 'verified' :: proof_status)
  ) AS proof_count,
  COALESCE(
    sum(p.amount) FILTER (
      WHERE
        (p.status = 'verified' :: proof_status)
    ),
    (0) :: numeric
  ) AS total_donated,
  max(p.verified_at) AS last_proof_at,
  CASE
    WHEN (
      max(p.verified_at) > (NOW() - '30 days' :: INTERVAL)
    ) THEN 100
    WHEN (
      max(p.verified_at) > (NOW() - '90 days' :: INTERVAL)
    ) THEN 75
    ELSE 20
  END AS trust_score,
  (
    SELECT
      proofs.status
    FROM
      proofs
    WHERE
      (proofs.brand_id = b.id)
    ORDER BY
      proofs.created_at DESC
    LIMIT
      1
  ) AS latest_status
FROM
  (
    brands b
    LEFT JOIN proofs p ON ((b.id = p.brand_id))
  )
GROUP BY
  b.id;