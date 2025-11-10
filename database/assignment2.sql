-- 1) Query 1 - Insert Tony Stark (account_id and account_type handled by defaults)
INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- 2) Query 2 - Promote Tony Stark to Admin (target a single row via its primary key)
UPDATE public.account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

-- 3) Query 3 - Delete Tony Stark (target a single row via its primary key)
DELETE FROM public.account
WHERE account_email = 'tony@starkent.com';

-- 4) Query 4 - Update GM Hummer description using REPLACE (single query, no full retype)
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_make = 'GM' AND inv_model = 'Hummer';

-- 5) Query 5 - Inner join to list Sport vehicles (should return exactly two rows)
SELECT i.inv_make, i.inv_model, c.classification_name
FROM public.inventory AS i
INNER JOIN classification AS c
  ON i.classification_id = c.classification_id
WHERE c.classification_name = 'Sport';

-- 6) Query 6 - Add "/vehicles" into image paths for ALL inventory rows (single query)
UPDATE inventory
SET
  inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'),
  inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/');
