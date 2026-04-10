UPDATE bdix_servers SET links = (
  SELECT COALESCE(array_agg(link), '{}')
  FROM unnest(links) AS link
  WHERE link NOT LIKE '%facebook.com%'
);