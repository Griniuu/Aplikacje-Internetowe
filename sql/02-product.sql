create table product
(
    id          integer not null
        constraint product_pk
            primary key autoincrement,
    name        text not null,
    description text,
    price       real not null,
    quantity    integer not null default 0
);
