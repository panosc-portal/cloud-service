insert into provider (id, name, description, url)
values (1, 'provider 1', 'Cloud Provider 1', 'http://localhost:4000/api/v1');
insert into provider (id, name, description, url)
values (2, 'provider 2', 'Cloud Provider 2', 'http://localhost:4001/api/v1');
insert into provider (id, name, description, url)
values (3, 'provider 3', 'Cloud Provider 3 (unused)', 'http://localhost:4002/api/v1');

insert into plan (id, name, description, provider_id, cloud_image_id, cloud_flavour_id)
values (1, 'plan 1', 'Plan 1', 1, 1, 1);
insert into plan (id, name, description, provider_id, cloud_image_id, cloud_flavour_id)
values (2, 'plan 2', 'Plan 2', 1, 1, 2);
insert into plan (id, name, description, provider_id, cloud_image_id, cloud_flavour_id)
values (3, 'plan 3', 'Plan 3', 1, 2, 1);
insert into plan (id, name, description, provider_id, cloud_image_id, cloud_flavour_id)
values (4, 'plan 4', 'Plan 4', 1, 2, 2);
insert into plan (id, name, description, provider_id, cloud_image_id, cloud_flavour_id)
values (5, 'plan 5', 'Plan 5', 2, 1, 1);
insert into plan (id, name, description, provider_id, cloud_image_id, cloud_flavour_id)
values (6, 'plan 6', 'Plan 6', 2, 1, 2);
