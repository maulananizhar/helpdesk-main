create table jenislayanan
(
    id          serial primary key,
    tipelayanan varchar(255)
);

create table subjenislayanan
(
    id             serial primary key,
    subtipelayanan varchar(255)
);

create table users
(
    id           serial primary key,
    nama         varchar(255),
    id_layanan   integer references jenislayanan,
    role         varchar(255),
    email        varchar(255) unique,
    password     varchar(255),
    verify       boolean default false,
    verify_token varchar(64),
    unit         varchar(255)
);

create table formpelayanan
(
    id                 serial primary key,
    nama               varchar(255),
    email              varchar(255),
    unit               varchar(255),
    layanan            text,
    id_jenislayanan    integer references jenislayanan,
    tindak_lanjut      text,
    eskalasi           boolean,
    status             varchar(255)             default 'Baru'::character varying,
    created_at         timestamp with time zone default now(),
    proses_at          timestamp with time zone,
    selesai_at         timestamp with time zone,
    id_subjenislayanan integer references subjenislayanan,
    dokumen            text,
    ticket             varchar(255) unique
);

create table form_pics
(
    id      serial primary key,
    form_id integer references formpelayanan,
    pic_id  integer references users
);

create table chat
(
    id         serial primary key,
    room       varchar(255) references formpelayanan (ticket),
    name       varchar(255),
    sender     varchar(255),
    role       varchar(255),
    message    text,
    created_at timestamp with time zone default now()
);

create table timeline
(
    id         serial primary key,
    ticket     varchar(255) references formpelayanan (ticket),
    title      varchar(255),
    subtitle   varchar(255),
    created_at timestamp with time zone default now()
);

create table testimonial
(
    id                   serial primary key,
    ticket               varchar(255) references formpelayanan (ticket),
    id_user              integer references users,
    id_layanan           integer references jenislayanan,
    created_at           timestamp with time zone default now(),
    testimonial_helpdesk text,
    rating_helpdesk      integer,
    testimonial_pic      text,
    rating_pic           integer
);

create table testimonial_pics
(
    id             serial primary key,
    testimonial_id integer references testimonial,
    pic_id         integer references users
);

create table notifications
(
    id         serial primary key,
    receiver   varchar(255) references users (email),
    message    text,
    created_at timestamp with time zone default now()
);

