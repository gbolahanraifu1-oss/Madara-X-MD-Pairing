-- Madara X-MD database schema
-- Run once in the Supabase SQL Editor.

create table if not exists users (
  id serial primary key,
  email text not null unique,
  username text not null unique,
  password_hash text not null,
  is_admin boolean not null default false,
  reset_token text,
  reset_token_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sessions (
  id serial primary key,
  user_id integer not null,
  token text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists pairing_sessions (
  id serial primary key,
  user_id integer not null,
  session_id text not null unique,
  phone_number text not null,
  method text not null default 'code',
  pairing_code text,
  qr_data text,
  connected boolean not null default false,
  connected_at timestamptz,
  last_seen timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists console_logs (
  id serial primary key,
  user_id integer not null,
  session_id text,
  level text not null default 'info',
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists contact_messages (
  id serial primary key,
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);
