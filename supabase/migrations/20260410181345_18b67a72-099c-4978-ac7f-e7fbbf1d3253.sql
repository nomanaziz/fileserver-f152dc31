UPDATE bdix_servers SET links = subq.cleaned_links
FROM (
  SELECT id, array_agg(DISTINCT regexp_replace(link, '(https?://)www\.', '\1')) AS cleaned_links
  FROM bdix_servers, unnest(links) AS link
  GROUP BY id
) subq
WHERE bdix_servers.id = subq.id;