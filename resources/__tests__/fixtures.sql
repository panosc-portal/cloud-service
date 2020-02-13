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
insert into plan (id, name, description, provider_id, cloud_image_id, cloud_flavour_id)
values (7, 'plan 7', 'Plan 7 (unused)', 2, 2, 1);

insert into instance (id, cloud_id, plan_id, deleted)
values (1, 1, 1, false);
insert into instance (id, cloud_id, plan_id, deleted)
values (2, 2, 2, false);
insert into instance (id, cloud_id, plan_id, deleted)
values (3, 3, 3, false);
insert into instance (id, cloud_id, plan_id, deleted)
values (4, 4, 4, false);
insert into instance (id, cloud_id, plan_id, deleted)
values (5, 5, 1, false);
insert into instance  (id, cloud_id, plan_id, deleted)
values (6, 6, 2, false);
insert into instance(id, cloud_id, plan_id, deleted)
values (7, 1, 5, false);
insert into instance (id, cloud_id, plan_id, deleted)
values (8, 2, 6, false);
insert into instance (id, cloud_id, plan_id, deleted)
values (9, 3, 5, false);

insert into instance (id, cloud_id, plan_id, deleted)
values (10, 1, 1, true);
insert into instance (id, cloud_id, plan_id, deleted)
values (11, 1, 5, true);
